import { useState } from "react";
import { useGameState } from "../hooks/useGameState";
import styles from "./Controller.module.css";

function PlayerPanel({ player, playerNum, onLoreChange, onNameChange, maxLore }) {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(player.name);

  const handleNameBlur = () => {
    setEditingName(false);
    if (tempName !== player.name) {
      onNameChange(playerNum, tempName);
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") e.target.blur();
  };

  const won = player.lore >= maxLore;
  const pct = Math.round((player.lore / maxLore) * 100);

  return (
    <div className={`${styles.playerCard} ${won ? styles.won : ""}`}>
      <div className={styles.playerHeader}>
        {editingName ? (
          <input
            className={styles.nameInput}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            autoFocus
            maxLength={20}
          />
        ) : (
          <button
            className={styles.nameButton}
            onClick={() => {
              setTempName(player.name);
              setEditingName(true);
            }}
          >
            {player.name}
            <span className={styles.editHint}>editar</span>
          </button>
        )}
        {won && <span className={styles.wonBadge}>Vencedor!</span>}
      </div>

      <div className={styles.loreDisplay}>
        <span className={styles.loreNumber}>{player.lore}</span>
        <span className={styles.loreMax}>/{maxLore}</span>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>

      <div className={styles.buttons}>
        <button
          className={`${styles.btn} ${styles.btnMinus}`}
          onClick={() => onLoreChange(playerNum, -1)}
          disabled={player.lore === 0}
        >
          −1
        </button>
        <button
          className={`${styles.btn} ${styles.btnPlus}`}
          onClick={() => onLoreChange(playerNum, 1)}
          disabled={won}
        >
          +1
        </button>
        <button
          className={`${styles.btn} ${styles.btnPlus}`}
          onClick={() => onLoreChange(playerNum, 2)}
          disabled={won}
        >
          +2
        </button>
        <button
          className={`${styles.btn} ${styles.btnPlus}`}
          onClick={() => onLoreChange(playerNum, 3)}
          disabled={won}
        >
          +3
        </button>
      </div>
    </div>
  );
}

export default function Controller() {
  const { gameState, connected, loading, updateLore, updateName, resetMatch, MAX_LORE } =
    useGameState("partida1");

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Lorcana</h1>
          <span className={styles.subtitle}>Contador de Lore</span>
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.dot} ${connected ? styles.dotOnline : styles.dotOffline}`} />
          <span className={styles.status}>{connected ? "Online" : "Offline"}</span>
        </div>
      </header>

      {loading ? (
        <div className={styles.loading}>Conectando...</div>
      ) : (
        <main className={styles.main}>
          <PlayerPanel
            player={gameState.player1}
            playerNum={1}
            onLoreChange={updateLore}
            onNameChange={updateName}
            maxLore={MAX_LORE}
          />
          <PlayerPanel
            player={gameState.player2}
            playerNum={2}
            onLoreChange={updateLore}
            onNameChange={updateName}
            maxLore={MAX_LORE}
          />
        </main>
      )}

      <footer className={styles.footer}>
        <button className={styles.resetBtn} onClick={resetMatch}>
          Resetar Partida
        </button>
        <a
          className={styles.overlayLink}
          href="/overlay"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver Overlay
        </a>
      </footer>
    </div>
  );
}
