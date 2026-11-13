import { useGameState } from "../hooks/useGameState";
import { useSyncedTimer } from "../hooks/useSyncedTimer";
import { usePwaManifest } from "../hooks/usePwaManifest";
import { formatRecord } from "../constants/lorcana";
import InkDots from "../components/InkDots";
import styles from "./Controller.module.css";

function Diamond({ filled, dim }) {
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 20 20"
      className={`${styles.diamond} ${filled ? styles.diamondFilled : ""}`}
    >
      <polygon points="10,1 19,10 10,19 1,10" strokeWidth="1.5" />
    </svg>
  );
}

function PlayerPanel({ player, playerNum, onLoreChange, onWin, series, WINS_NEEDED, maxLore }) {
  const type = series?.type ?? "BO3";
  const games = series?.games ?? [];
  const winsNeeded = WINS_NEEDED[type] ?? 2;
  const total = WINS_NEEDED[type] ?? 2;
  const playerKey = playerNum === 1 ? "p1" : "p2";
  const myWins = games.filter((g) => g === playerKey).length;
  const oppWins = games.filter((g) => g !== playerKey).length;
  const seriesOver = myWins >= winsNeeded || oppWins >= winsNeeded;

  const won = player.lore >= maxLore;
  const pct = Math.round((player.lore / maxLore) * 100);

  return (
    <div className={`${styles.playerCard} ${won ? styles.won : ""}`}>
      <div className={styles.playerHeader}>
        <div className={styles.playerIdentity}>
          <span className={styles.nameDisplay}>{player.name}</span>
          <div className={styles.metaRow}>
            <InkDots colors={player.colors} size={18} />
            <span className={styles.recordText}>{formatRecord(player.record)}</span>
          </div>
        </div>

        <div className={styles.playerDiamonds}>
          {Array.from({ length: total }).map((_, i) => (
            <Diamond key={i} filled={i < myWins} dim={14} />
          ))}
        </div>
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
          disabled={player.lore === 0 || seriesOver}
        >
          −1
        </button>
        <button
          className={`${styles.btn} ${styles.btnPlus}`}
          onClick={() => onLoreChange(playerNum, 1)}
          disabled={won || seriesOver}
        >
          +1
        </button>
        <button
          className={`${styles.btn} ${styles.btnPlus}`}
          onClick={() => onLoreChange(playerNum, 2)}
          disabled={won || seriesOver}
        >
          +2
        </button>
        <button
          className={`${styles.btn} ${styles.btnPlus}`}
          onClick={() => onLoreChange(playerNum, 3)}
          disabled={won || seriesOver}
        >
          +3
        </button>
      </div>

      {!seriesOver && (
        <button
          className={`${styles.winBtn} ${won ? styles.winBtnHighlight : ""}`}
          onClick={() => onWin(playerKey)}
        >
          {player.name} venceu o jogo {games.length + 1}
        </button>
      )}
    </div>
  );
}

/** App do jogador: só lore + vitória da partida */
export default function Contador() {
  usePwaManifest("contador");
  const {
    gameState, connected, loading,
    updateLore, recordWin,
    MAX_LORE, WINS_NEEDED,
  } = useGameState("partida1");

  const timer = useSyncedTimer(gameState.timer);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Lorcana</h1>
          <span className={styles.subtitle}>Contador</span>
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.dot} ${connected ? styles.dotOnline : styles.dotOffline}`} />
          <span className={styles.status}>{connected ? "Online" : "Offline"}</span>
        </div>
      </header>

      <div className={styles.roundBanner}>
        <span className={styles.roundText}>Rodada {gameState.round}</span>
        <span className={`${styles.roundTimer} ${timer.expired ? styles.timerExpired : ""}`}>
          {timer.label}
        </span>
      </div>

      {loading ? (
        <div className={styles.loading}>Conectando...</div>
      ) : (
        <main className={`${styles.main} ${styles.mainContador}`}>
          <PlayerPanel
            player={gameState.player1}
            playerNum={1}
            onLoreChange={updateLore}
            onWin={recordWin}
            series={gameState.series}
            WINS_NEEDED={WINS_NEEDED}
            maxLore={MAX_LORE}
          />
          <PlayerPanel
            player={gameState.player2}
            playerNum={2}
            onLoreChange={updateLore}
            onWin={recordWin}
            series={gameState.series}
            WINS_NEEDED={WINS_NEEDED}
            maxLore={MAX_LORE}
          />
        </main>
      )}
    </div>
  );
}
