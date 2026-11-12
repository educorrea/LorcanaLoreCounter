import { useState, useEffect, useCallback } from "react";
import { ref, onValue, set, get } from "firebase/database";
import { db } from "../firebase";

const MAX_LORE = 20;

const defaultState = {
  player1: { name: "Jogador 1", lore: 0 },
  player2: { name: "Jogador 2", lore: 0 },
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

  const updateLore = useCallback(
    async (player, delta) => {
      const key = player === 1 ? "player1" : "player2";
      const playerRef = ref(db, `matches/${matchId}/${key}/lore`);

      const snap = await get(playerRef);
      const current = snap.val() ?? 0;
      await set(playerRef, clamp(current + delta));
    },
    [matchId]
  );

  const updateName = useCallback(
    async (player, name) => {
      const key = player === 1 ? "player1" : "player2";
      const nameRef = ref(db, `matches/${matchId}/${key}/name`);
      await set(nameRef, name.trim() || (player === 1 ? "Jogador 1" : "Jogador 2"));
    },
    [matchId]
  );

  const resetMatch = useCallback(async () => {
    await set(matchRef, {
      player1: { name: gameState.player1.name, lore: 0 },
      player2: { name: gameState.player2.name, lore: 0 },
    });
  }, [matchId, gameState.player1.name, gameState.player2.name]);

  return {
    gameState,
    connected,
    loading,
    updateLore,
    updateName,
    resetMatch,
    MAX_LORE,
  };
}
