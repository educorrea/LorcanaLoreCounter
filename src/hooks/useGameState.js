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
  round: "1",
  timer: {
    durationSeconds: DEFAULT_TIMER_SECONDS,
    remainingSeconds: DEFAULT_TIMER_SECONDS,
    running: false,
    endsAt: null,
  },
  lastAction: null, // snapshot to undo lore / win
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

function normalizeGames(games) {
  if (!Array.isArray(games)) return [];
  return games.filter((g) => g === "p1" || g === "p2");
}

function normalizeLastAction(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    kind: raw.kind === "win" ? "win" : "lore",
    player1Lore: typeof raw.player1Lore === "number" ? clamp(raw.player1Lore) : 0,
    player2Lore: typeof raw.player2Lore === "number" ? clamp(raw.player2Lore) : 0,
    games: normalizeGames(raw.games),
  };
}

function snapshotFromData(data, kind) {
  return {
    kind,
    player1Lore: typeof data?.player1?.lore === "number" ? clamp(data.player1.lore) : 0,
    player2Lore: typeof data?.player2?.lore === "number" ? clamp(data.player2.lore) : 0,
    games: normalizeGames(data?.series?.games),
  };
}

function normalizeState(data) {
  return {
    player1: normalizePlayer(data?.player1, "Jogador 1", ["amber", "amethyst"]),
    player2: normalizePlayer(data?.player2, "Jogador 2", ["ruby", "sapphire"]),
    series: {
      type: data?.series?.type && WINS_NEEDED[data.series.type] ? data.series.type : "BO3",
      games: normalizeGames(data?.series?.games),
    },
    round: normalizeRound(data?.round),
    timer: normalizeTimer(data?.timer),
    lastAction: normalizeLastAction(data?.lastAction),
  };
}

function normalizeRound(round) {
  if (typeof round === "number" && Number.isFinite(round)) {
    return String(Math.max(1, Math.min(99, Math.round(round))));
  }
  if (typeof round === "string" && round.trim()) {
    const match = round.trim().match(/\d+/);
    if (match) return String(Math.max(1, Math.min(99, Number(match[0]) || 1)));
    return round.trim();
  }
  return "1";
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
    const snap = await get(matchRef);
    const data = snap.val();
    if (!data) return;

    const key = player === 1 ? "player1" : "player2";
    const current = typeof data[key]?.lore === "number" ? data[key].lore : 0;
    const next = clamp(current + delta);
    if (next === current) return;

    await update(matchRef, {
      lastAction: snapshotFromData(data, "lore"),
      [`${key}/lore`]: next,
    });
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
    await set(ref(db, `matches/${matchId}/round`), normalizeRound(round));
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
    await update(matchRef, {
      series: { type, games: [] },
      "player1/lore": 0,
      "player2/lore": 0,
      lastAction: null,
    });
  }, [matchId]);

  const recordWin = useCallback(async (player) => {
    const snap = await get(matchRef);
    const data = snap.val();
    if (!data) return;

    const series = data.series ?? defaultState.series;
    const games = [...normalizeGames(series.games), player];
    const type = series.type ?? "BO3";
    const winsNeeded = WINS_NEEDED[type] ?? 2;

    const p1Wins = games.filter((g) => g === "p1").length;
    const p2Wins = games.filter((g) => g === "p2").length;
    const seriesOver = p1Wins >= winsNeeded || p2Wins >= winsNeeded;

    const patch = {
      lastAction: snapshotFromData(data, "win"),
      "series/games": games,
    };

    // Reset lore for next game unless series is over
    if (!seriesOver) {
      patch["player1/lore"] = 0;
      patch["player2/lore"] = 0;
    }

    await update(matchRef, patch);
  }, [matchId]);

  const undoLastAction = useCallback(async () => {
    const snap = await get(matchRef);
    const data = snap.val();
    if (!data) return;

    const lastAction = normalizeLastAction(data.lastAction);
    if (!lastAction) return;

    await update(matchRef, {
      "player1/lore": lastAction.player1Lore,
      "player2/lore": lastAction.player2Lore,
      "series/games": lastAction.games,
      lastAction: null,
    });
  }, [matchId]);

  const resetMatch = useCallback(async () => {
    const snap = await get(matchRef);
    const data = snap.val();
    const normalized = normalizeState(data ?? {});
    // Preserva o timer — só o botão Resetar do topo zera o tempo
    await set(matchRef, {
      player1: { ...normalized.player1, lore: 0 },
      player2: { ...normalized.player2, lore: 0 },
      series: { type: normalized.series.type, games: [] },
      round: normalized.round,
      timer: normalized.timer,
      lastAction: null,
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
    undoLastAction,
    resetMatch,
    MAX_LORE,
    WINS_NEEDED,
    TOTAL_GAMES,
  };
}
