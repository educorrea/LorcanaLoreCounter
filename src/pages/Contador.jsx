import { useGameState } from "../hooks/useGameState";
import { useSyncedTimer } from "../hooks/useSyncedTimer";
import { usePwaManifest } from "../hooks/usePwaManifest";
import { formatRecord } from "../constants/lorcana";
import InkDots from "../components/InkDots";
import shared from "./Controller.module.css";
import styles from "./Contador.module.css";

function Diamond({ filled, dim }) {
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 20 20"
      className={`${shared.diamond} ${filled ? shared.diamondFilled : ""}`}
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
    <div className={`${styles.card} ${won ? styles.cardWon : ""}`}>
      <div className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.name}>{player.name}</span>
          <div className={styles.meta}>
            <InkDots colors={player.colors} size={16} />
            <span className={styles.record}>{formatRecord(player.record)}</span>
          </div>
        </div>
        <div className={styles.diamonds}>
          {Array.from({ length: total }).map((_, i) => (
            <Diamond key={i} filled={i < myWins} dim={14} />
          ))}
        </div>
      </div>

      <div className={styles.loreWrap}>
        <span className={styles.lore}>{player.lore}</span>
        <span className={styles.loreMax}>/{maxLore}</span>
      </div>

      <div className={styles.bar}>
        <div className={styles.barFill} style={{ width: `${pct}%` }} />
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
          className={`${styles.winBtn} ${won ? styles.winBtnHot : ""}`}
          onClick={() => onWin(playerKey)}
        >
          {player.name} venceu o jogo {games.length + 1}
        </button>
      )}
    </div>
  );
}

/** App do jogador: modo mesa (P1 invertido) + paisagem lado a lado */
export default function Contador() {
  usePwaManifest("contador");
  const {
    gameState, connected, loading,
    updateLore, recordWin, undoLastAction,
    MAX_LORE, WINS_NEEDED,
  } = useGameState("partida1");

  const timer = useSyncedTimer(gameState.timer);
  const canUndo = Boolean(gameState.lastAction);

  const midBar = (
    <div className={styles.midBar}>
      <span className={styles.roundText}>Rodada {gameState.round}</span>
      <span className={`${styles.timer} ${timer.expired ? styles.timerExpired : ""}`}>
        {timer.label}
      </span>
      <div className={styles.midActions}>
        <button
          type="button"
          className={styles.undoBtn}
          onClick={undoLastAction}
          disabled={!canUndo}
          aria-label="Desfazer última ação"
          title="Desfazer última ação"
        >
          Desfazer
        </button>
        <div className={styles.statusWrap}>
          <span className={`${styles.dot} ${connected ? styles.dotOnline : styles.dotOffline}`} />
          <span className={styles.status}>{connected ? "Online" : "Offline"}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.root}>
        {midBar}
        <div className={styles.loading}>Conectando...</div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.board}>
        {/* Em pé: este lado fica invertido para o jogador do outro lado da mesa */}
        <section className={`${styles.seat} ${styles.seatTop}`}>
          <PlayerPanel
            player={gameState.player1}
            playerNum={1}
            onLoreChange={updateLore}
            onWin={recordWin}
            series={gameState.series}
            WINS_NEEDED={WINS_NEEDED}
            maxLore={MAX_LORE}
          />
        </section>

        {midBar}

        <section className={`${styles.seat} ${styles.seatBottom}`}>
          <PlayerPanel
            player={gameState.player2}
            playerNum={2}
            onLoreChange={updateLore}
            onWin={recordWin}
            series={gameState.series}
            WINS_NEEDED={WINS_NEEDED}
            maxLore={MAX_LORE}
          />
        </section>
      </div>
    </div>
  );
}
