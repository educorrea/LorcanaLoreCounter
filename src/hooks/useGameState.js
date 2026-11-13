import { useState, useEffect, useCallback } from "react";
import { ref, onValue, set, get } from "firebase/database";
import { db } from "../firebase";

export const MAX_LORE = 20;

// Wins needed to take the series
export const WINS_NEEDED = { BO1: 1, BO3: 2, BO5: 3 };
// Total game slots to display as diamonds
export const TOTAL_GAMES = { BO1: 1, BO3: 3, BO5: 5 };

const defaultState = {
  player1: { name: "Jogador 1", lore: 0, vitorias: 0, derrotas: 0, empates: 0 },
  player2: { name: "Jogador 2", lore: 0, vitorias: 0, derrotas: 0, empates: 0 },
  rodada: 1,
  series: {
    type: "BO3",
    games: [],
  },
};

function clamp(value) {
  return Math.max(0, Math.min(MAX_LORE, value));
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
        // Ensure fields exist for older saves
        if (!data.series) data.series = defaultState.series;
        if (!data.series.games) data.series.games = [];
        if (!data.rodada) data.rodada = 1;
        if (!data.player1.vitorias) data.player1 = { ...defaultState.player1, ...data.player1 };
        if (!data.player2.vitorias) data.player2 = { ...defaultState.player2, ...data.player2 };
        setGameState(data);
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

  const setRodada = useCallback(async (delta) => {
    const snap = await get(ref(db, `matches/${matchId}/rodada`));
    const current = snap.val() ?? 1;
    const next = Math.max(1, current + delta);
    await set(ref(db, `matches/${matchId}/rodada`), next);
  }, [matchId]);

  const updateRecord = useCallback(async (player, field, delta) => {
    const key = player === 1 ? "player1" : "player2";
    const fieldRef = ref(db, `matches/${matchId}/${key}/${field}`);
    const snap = await get(fieldRef);
    const current = snap.val() ?? 0;
    await set(fieldRef, Math.max(0, current + delta));
  }, [matchId]);

  const resetMatch = useCallback(async () => {
    const snap = await get(matchRef);
    const data = snap.val();
    const names = {
      player1: data?.player1?.name ?? "Jogador 1",
      player2: data?.player2?.name ?? "Jogador 2",
    };
    const type = data?.series?.type ?? "BO3";
    await set(matchRef, {
      player1: { name: names.player1, lore: 0 },
      player2: { name: names.player2, lore: 0 },
      series: { type, games: [] },
    });
  }, [matchId]);

  return {
    gameState,
    connected,
    loading,
    updateLore,
    updateName,
    setSeriesType,
    recordWin,
    setRodada,
    updateRecord,
    resetMatch,
    MAX_LORE,
    WINS_NEEDED,
    TOTAL_GAMES,
  };
}
