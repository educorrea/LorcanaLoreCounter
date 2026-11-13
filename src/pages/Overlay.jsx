import { useEffect } from "react";
import { useGameState } from "../hooks/useGameState";
import { useSyncedTimer } from "../hooks/useSyncedTimer";
import { formatRecord } from "../constants/lorcana";
import InkDots from "../components/InkDots";
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
      <div className={styles.playerTop}>
        <div className={styles.playerName}>{player.name}</div>
        <div className={styles.playerMeta}>
          <InkDots colors={player.colors} size={16} />
          <span className={styles.record}>{formatRecord(player.record)}</span>
        </div>
      </div>
      <div className={styles.loreRow}>
        <span className={styles.loreNumber}>{player.lore}</span>
        <span className={styles.loreLabel}>lore</span>
      </div>
      <LoreBar pct={pct} />
      {won && <div className={styles.wonLabel}>VENCEDOR</div>}
    </div>
  );
}

function RoundClock({ round, timer }) {
  const { label, expired } = useSyncedTimer(timer);
  return (
    <div className={styles.roundBar}>
      <div className={styles.roundBlock}>
        <span className={styles.roundLabel}>RODADA</span>
        <span className={styles.roundValue}>{round}</span>
      </div>
      <div className={styles.roundDivider} />
      <div className={styles.roundBlock}>
        <span className={styles.roundLabel}>TEMPO</span>
        <span className={`${styles.timeValue} ${expired ? styles.timeExpired : ""}`}>{label}</span>
      </div>
    </div>
  );
}

export default function Overlay() {
  const { gameState, loading, MAX_LORE } = useGameState("partida1");

  useEffect(() => {
    document.body.style.background = "transparent";
    document.documentElement.style.background = "transparent";
    return () => {
      document.body.style.background = "";
      document.documentElement.style.background = "";
    };
  }, []);

  if (loading) return null;

  return (
    <div className={styles.root}>
      <RoundClock round={gameState.round} timer={gameState.timer} />
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
