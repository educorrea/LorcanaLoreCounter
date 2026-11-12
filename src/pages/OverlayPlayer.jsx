import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGameState } from "../hooks/useGameState";
import styles from "./OverlayPlayer.module.css";

const MAX_LORE = 20;
const STEPS = Array.from({ length: MAX_LORE + 1 }, (_, i) => MAX_LORE - i);

export default function OverlayPlayer() {
  const { player } = useParams();
  const { gameState, loading } = useGameState("partida1");

  useEffect(() => {
    document.body.style.background = "transparent";
    document.body.style.width = "fit-content";
    document.body.style.height = "fit-content";
    document.documentElement.style.background = "transparent";
    document.documentElement.style.width = "fit-content";
    document.documentElement.style.height = "fit-content";
    const root = document.getElementById("root");
    if (root) {
      root.style.width = "fit-content";
      root.style.height = "fit-content";
    }
    return () => {
      document.body.style.background = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.documentElement.style.background = "";
      document.documentElement.style.width = "";
      document.documentElement.style.height = "";
      if (root) {
        root.style.width = "";
        root.style.height = "";
      }
    };
  }, []);

  if (loading) return null;

  const isP2 = player === "p2";
  const data = isP2 ? gameState.player2 : gameState.player1;
  const lore = data.lore ?? 0;
  const won = lore >= MAX_LORE;

  return (
    <div className={`${styles.root} ${isP2 ? styles.rootRight : styles.rootLeft}`}>
      <div className={`${styles.panel} ${won ? styles.panelWon : ""}`}>
        <div className={styles.topLabel}>VITÓRIA</div>

        <div className={styles.track}>
          {STEPS.map((step) => {
            const isActive = step === lore;
            const isFilled = step <= lore;
            const isWinStep = step === MAX_LORE;

            return (
              <div
                key={step}
                className={`${styles.step} ${isFilled ? styles.stepFilled : ""} ${isActive ? styles.stepActive : ""} ${isWinStep ? styles.stepWin : ""}`}
              >
                <span className={styles.stepNumber}>{step}</span>
                <div className={styles.stepBar}>
                  {isActive && (
                    <div className={styles.marker} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.bottomLabel}>START</div>

        <div className={styles.playerName}>{data.name}</div>
      </div>
    </div>
  );
}
