import { useGameState } from "../hooks/useGameState";
import styles from "./Overlay.module.css";

function LoreBar({ pct }) {
  return (
    <div className={styles.progressBar}>
      <div className={styles.progressFill} style={{ width: `${pct}%` }} />
    </div>
  );
}

function PlayerBlock({ player, side, maxLore }) {
  const pct = Math.round((player.lore / maxLore) * 100);
  const won = player.lore >= maxLore;

  return (
    <div className={`${styles.playerBlock} ${styles[side]} ${won ? styles.won : ""}`}>
      <div className={styles.playerName}>{player.name}</div>
      <div className={styles.loreRow}>
        <span className={styles.loreNumber}>{player.lore}</span>
        <span className={styles.loreLabel}>lore</span>
      </div>
      <LoreBar pct={pct} />
      {won && <div className={styles.wonLabel}>VENCEDOR</div>}
    </div>
  );
}

export default function Overlay() {
  const { gameState, loading, MAX_LORE } = useGameState("partida1");

  if (loading) return null;

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <PlayerBlock player={gameState.player1} side="left" maxLore={MAX_LORE} />
        <div className={styles.divider}>
          <span className={styles.dividerLabel}>LORE</span>
        </div>
        <PlayerBlock player={gameState.player2} side="right" maxLore={MAX_LORE} />
      </div>
    </div>
  );
}
