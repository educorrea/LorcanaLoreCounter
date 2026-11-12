import { useEffect } from "react";
import { useGameState } from "../hooks/useGameState";
import styles from "./OverlayFull.module.css";

const MAX_LORE = 20;
const STEPS = Array.from({ length: MAX_LORE + 1 }, (_, i) => MAX_LORE - i);

function LoreTrack({ lore }) {
  return (
    <div className={styles.track}>
      {STEPS.map((step) => {
        const isActive = step === lore;
        const isFilled = step <= lore;
        const isWin = step === MAX_LORE;
        return (
          <div
            key={step}
            className={[
              styles.step,
              isFilled ? styles.filled : "",
              isActive ? styles.active : "",
              isWin ? styles.win : "",
            ].join(" ")}
          >
            <span className={styles.num}>{step}</span>
            <div className={styles.bar}>
              {isActive && <div className={styles.marker} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlayerPanel({ player, side }) {
  const won = player.lore >= MAX_LORE;
  return (
    <div className={`${styles.panel} ${styles[side]} ${won ? styles.won : ""}`}>
      <div className={styles.topLabel}>VITÓRIA</div>
      <LoreTrack lore={player.lore} />
      <div className={styles.bottomLabel}>START</div>
      <div className={styles.name}>{player.name}</div>
    </div>
  );
}

export default function OverlayFull() {
  const { gameState, loading } = useGameState("partida1");

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
      <PlayerPanel player={gameState.player1} side="left" />
      <PlayerPanel player={gameState.player2} side="right" />
    </div>
  );
}
