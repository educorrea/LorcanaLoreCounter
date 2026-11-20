import { useGameState } from "../hooks/useGameState";
import { useSyncedTimer } from "../hooks/useSyncedTimer";
import styles from "./TimerDisplay.module.css";

/** Tela gigante de tempo da rodada — mesma sync Firebase da Config/Contador/Overlay */
export default function TimerDisplay() {
  const { gameState, connected, loading } = useGameState("partida1");
  const timer = useSyncedTimer(gameState.timer);
  const running = Boolean(gameState.timer?.running);
  const urgent = timer.seconds > 0 && timer.seconds <= 5 * 60;

  if (loading) {
    return (
      <div className={styles.root}>
        <p className={styles.loading}>Conectando...</p>
      </div>
    );
  }

  return (
    <div
      className={[
        styles.root,
        timer.expired ? styles.expired : "",
        urgent && !timer.expired ? styles.urgent : "",
        running ? styles.running : styles.paused,
      ].join(" ")}
    >
      <div className={styles.top}>
        <span className={styles.round}>Rodada {gameState.round}</span>
        <span className={styles.status}>
          <span className={`${styles.dot} ${connected ? styles.dotOnline : styles.dotOffline}`} />
          {running ? "Em andamento" : timer.expired ? "Encerrado" : "Pausado"}
        </span>
      </div>

      <div className={styles.clockWrap} aria-live="polite">
        <span className={styles.clock}>{timer.label}</span>
      </div>

      <p className={styles.hint}>
        Mesmo tempo da Config — inicie/pause/resete por lá
      </p>
    </div>
  );
}
