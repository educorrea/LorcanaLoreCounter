import { useState, useEffect, useCallback } from "react";
import { ref, onValue, set, get, update } from "firebase/database";
import { db } from "../firebase";
import { normalizeColors } from "../constants/lorcana";

export const MAX_LORE = 20;

// Wins needed to take the series
export const WINS_NEEDED = { BO1: 1, BO3: 2, BO5: 3 };
// Total game slots to display as diamonds
export const TOTAL_GAMES = { BO1: 1, BO3: 3, BO5: 5 };

const DEFAULT_TIMER_SECONDS = 50 * 60; // 50 min common for Swiss rounds

function defaultPlayer(name, colors) {
  return {
    name,
    lore: 0,
    record: { wins: 0, losses: 0, draws: 0 },
    colors,
  };
}

const defaultState = {
  player1: defaultPlayer("Jogador 1", ["amber", "amethyst"]),
  player2: defaultPlayer("Jogador 2", ["ruby", "sapphire"]),
  series: {
    type: "BO3",
    games: [], // array of "p1" | "p2" — winner of each completed game
  },
  round: "Rodada 1",
  timer: {
    durationSeconds: DEFAULT_TIMER_SECONDS,
    remainingSeconds: DEFAULT_TIMER_SECONDS,
    running: false,
    endsAt: null,
  },
};

function clamp(value) {
  return Math.max(0, Math.min(MAX_LORE, value));
}

function normalizePlayer(player, fallbackName, fallbackColors) {
  return {
    name: player?.name || fallbackName,
    lore: typeof player?.lore === "number" ? player.lore : 0,
    record: {
      wins: Number(player?.record?.wins) || 0,
      losses: Number(player?.record?.losses) || 0,
      draws: Number(player?.record?.draws) || 0,
    },
    colors: normalizeColors(player?.colors ?? fallbackColors),
  };
}

function normalizeTimer(timer) {
  const durationSeconds = Math.max(60, Number(timer?.durationSeconds) || DEFAULT_TIMER_SECONDS);
  const remainingSeconds = Math.max(
    0,
    Number(timer?.remainingSeconds) || durationSeconds
  );
  return {
    durationSeconds,
    remainingSeconds,
    running: Boolean(timer?.running),
    endsAt: timer?.endsAt ?? null,
  };
}

function normalizeState(data) {
  return {
    player1: normalizePlayer(data?.player1, "Jogador 1", ["amber", "amethyst"]),
    player2: normalizePlayer(data?.player2, "Jogador 2", ["ruby", "sapphire"]),
    series: {
      type: data?.series?.type && WINS_NEEDED[data.series.type] ? data.series.type : "BO3",
      games: Array.isArray(data?.series?.games) ? data.series.games : [],
    },
    round: typeof data?.round === "string" && data.round.trim() ? data.round.trim() : "Rodada 1",
    timer: normalizeTimer(data?.timer),
  };
}

export function useGameState(matchId = "default") {
  const [gameState, setGameState] = useState(defaultState);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const matchRef = ref(db, `matches/${matchId}`);

  useEffect(() => {
    const connectedRef = ref(db, ".info/connected");
    const connectedUnsub = onValue(connectedRef, (snap) => {
      setConnected(snap.val() === true);
    });

    const unsub = onValue(matchRef, (snap) => {
      setLoading(false);
      const data = snap.val();
      if (data) {
        setGameState(normalizeState(data));
      } else {
        set(matchRef, defaultState);
        setGameState(defaultState);
      }
    });

    return () => {
      unsub();
      connectedUnsub();
    };
  }, [matchId]);

  const updateLore = useCallback(async (player, delta) => {
    const key = player === 1 ? "player1" : "player2";
    const loreRef = ref(db, `matches/${matchId}/${key}/lore`);
    const snap = await get(loreRef);
    const current = snap.val() ?? 0;
    await set(loreRef, clamp(current + delta));
  }, [matchId]);

  const updateName = useCallback(async (player, name) => {
    const key = player === 1 ? "player1" : "player2";
    const nameRef = ref(db, `matches/${matchId}/${key}/name`);
    await set(nameRef, name.trim() || (player === 1 ? "Jogador 1" : "Jogador 2"));
  }, [matchId]);

  const updateRecord = useCallback(async (player, field, value) => {
    const key = player === 1 ? "player1" : "player2";
    const n = Math.max(0, Math.min(99, Number(value) || 0));
    await set(ref(db, `matches/${matchId}/${key}/record/${field}`), n);
  }, [matchId]);

  const updateColors = useCallback(async (player, colors) => {
    const key = player === 1 ? "player1" : "player2";
    await set(ref(db, `matches/${matchId}/${key}/colors`), normalizeColors(colors));
  }, [matchId]);

  const updateRound = useCallback(async (round) => {
    await set(ref(db, `matches/${matchId}/round`), round.trim() || "Rodada 1");
  }, [matchId]);

  const setTimerDuration = useCallback(async (minutes) => {
    const durationSeconds = Math.max(1, Math.round(Number(minutes) || 50)) * 60;
    await update(ref(db, `matches/${matchId}/timer`), {
      durationSeconds,
      remainingSeconds: durationSeconds,
      running: false,
      endsAt: null,
    });
  }, [matchId]);

  const startTimer = useCallback(async () => {
    const snap = await get(ref(db, `matches/${matchId}/timer`));
    const timer = normalizeTimer(snap.val());
    const remaining = timer.running && timer.endsAt
      ? Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000))
      : timer.remainingSeconds;
    if (remaining <= 0) return;
    await update(ref(db, `matches/${matchId}/timer`), {
      remainingSeconds: remaining,
      running: true,
      endsAt: Date.now() + remaining * 1000,
    });
  }, [matchId]);

  const pauseTimer = useCallback(async () => {
    const snap = await get(ref(db, `matches/${matchId}/timer`));
    const timer = normalizeTimer(snap.val());
    const remaining = timer.running && timer.endsAt
      ? Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000))
      : timer.remainingSeconds;
    await update(ref(db, `matches/${matchId}/timer`), {
      remainingSeconds: remaining,
      running: false,
      endsAt: null,
    });
  }, [matchId]);

  const resetTimer = useCallback(async () => {
    const snap = await get(ref(db, `matches/${matchId}/timer`));
    const timer = normalizeTimer(snap.val());
    await update(ref(db, `matches/${matchId}/timer`), {
      remainingSeconds: timer.durationSeconds,
      running: false,
      endsAt: null,
    });
  }, [matchId]);

  const setSeriesType = useCallback(async (type) => {
    await set(ref(db, `matches/${matchId}/series`), { type, games: [] });
    // Reset lore when changing series type
    await set(ref(db, `matches/${matchId}/player1/lore`), 0);
    await set(ref(db, `matches/${matchId}/player2/lore`), 0);
  }, [matchId]);

  const recordWin = useCallback(async (player) => {
    const snap = await get(matchRef);
    const data = snap.val();
    if (!data) return;

    const series = data.series ?? defaultState.series;
    const games = [...(series.games ?? []), player];
    const type = series.type ?? "BO3";
    const winsNeeded = WINS_NEEDED[type] ?? 2;

    const p1Wins = games.filter((g) => g === "p1").length;
    const p2Wins = games.filter((g) => g === "p2").length;
    const seriesOver = p1Wins >= winsNeeded || p2Wins >= winsNeeded;

    await set(ref(db, `matches/${matchId}/series/games`), games);

    // Reset lore for next game unless series is over
    if (!seriesOver) {
      await set(ref(db, `matches/${matchId}/player1/lore`), 0);
      await set(ref(db, `matches/${matchId}/player2/lore`), 0);
    }
  }, [matchId]);

  const resetMatch = useCallback(async () => {
    const snap = await get(matchRef);
    const data = snap.val();
    const normalized = normalizeState(data ?? {});
    await set(matchRef, {
      player1: { ...normalized.player1, lore: 0 },
      player2: { ...normalized.player2, lore: 0 },
      series: { type: normalized.series.type, games: [] },
      round: normalized.round,
      timer: {
        durationSeconds: normalized.timer.durationSeconds,
        remainingSeconds: normalized.timer.durationSeconds,
        running: false,
        endsAt: null,
      },
    });
  }, [matchId]);

  return {
    gameState,
    connected,
    loading,
    updateLore,
    updateName,
    updateRecord,
    updateColors,
    updateRound,
    setTimerDuration,
    startTimer,
    pauseTimer,
    resetTimer,
    setSeriesType,
    recordWin,
    resetMatch,
    MAX_LORE,
    WINS_NEEDED,
    TOTAL_GAMES,
  };
}
