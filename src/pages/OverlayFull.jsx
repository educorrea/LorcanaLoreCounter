import { useEffect } from "react";
import { useGameState } from "../hooks/useGameState";
import { useSyncedTimer } from "../hooks/useSyncedTimer";
import { formatRecord } from "../constants/lorcana";
import InkDots from "../components/InkDots";
import styles from "./OverlayFull.module.css";

const MAX_LORE = 20;
const STEPS = Array.from({ length: MAX_LORE + 1 }, (_, i) => MAX_LORE - i);

function Diamond({ filled }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className={`${styles.diamond} ${filled ? styles.diamondFilled : ""}`}>
      <polygon points="10,1 19,10 10,19 1,10" strokeWidth="1.5" />
    </svg>
  );
}

function SeriesDiamonds({ playerKey, series, WINS_NEEDED }) {
  const type = series?.type ?? "BO3";
  const games = series?.games ?? [];
  const total = WINS_NEEDED[type] ?? 2;
  const myWins = games.filter((g) => g === playerKey).length;

  return (
    <div className={styles.seriesDiamonds}>
      {Array.from({ length: total }).map((_, i) => (
        <Diamond key={i} filled={i < myWins} />
      ))}
    </div>
  );
}

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
          </div>
        );
      })}
    </div>
  );
}

function PlayerPanel({ player, playerKey, side, series, WINS_NEEDED }) {
  const won = player.lore >= MAX_LORE;
  return (
    <div className={`${styles.panel} ${styles[side]} ${won ? styles.won : ""}`}>
      <div className={styles.topLabel}>VITÓRIA</div>
      <LoreTrack lore={player.lore} />
      <div className={styles.footer}>
        <div className={styles.bottomLabel}>START</div>
        <SeriesDiamonds
          playerKey={playerKey}
          series={series}
          WINS_NEEDED={WINS_NEEDED}
        />
        <div className={styles.name}>{player.name}</div>
        <div className={styles.playerMeta}>
          <InkDots colors={player.colors} size={32} />
          <span className={styles.record}>{formatRecord(player.record)}</span>
        </div>
      </div>
    </div>
  );
}

function RoundClock({ round, timer }) {
  const { label, expired } = useSyncedTimer(timer);

  return (
    <div className={styles.roundBar}>
      <div className={styles.roundBlock}>
        <span className={styles.roundLabel}>ROUND</span>
        <span className={styles.roundValue}>{round}</span>
      </div>
      <div className={styles.roundDivider} />
      <div className={styles.roundBlock}>
        <span className={styles.roundLabel}>TIME</span>
        <span className={`${styles.timeValue} ${expired ? styles.timeExpired : ""}`}>{label}</span>
      </div>
    </div>
  );
}

export default function OverlayFull() {
  const { gameState, loading, WINS_NEEDED } = useGameState("partida1");

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
      <PlayerPanel
        player={gameState.player1}
        playerKey="p1"
        side="left"
        series={gameState.series}
        WINS_NEEDED={WINS_NEEDED}
      />
      <PlayerPanel
        player={gameState.player2}
        playerKey="p2"
        side="right"
        series={gameState.series}
        WINS_NEEDED={WINS_NEEDED}
      />
    </div>
  );
}
