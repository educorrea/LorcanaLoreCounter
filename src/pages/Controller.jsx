import { useState } from "react";
import { useGameState } from "../hooks/useGameState";
import styles from "./Controller.module.css";

function NumberPicker({ label, value, onDecrement, onIncrement, min = 0 }) {
  return (
    <div className={styles.picker}>
      <span className={styles.pickerLabel}>{label}</span>
      <div className={styles.pickerControls}>
        <button className={styles.pickerBtn} onClick={onDecrement} disabled={value <= min}>−</button>
        <span className={styles.pickerValue}>{value}</span>
        <button className={styles.pickerBtn} onClick={onIncrement}>+</button>
      </div>
    </div>
  );
}

// Diamond SVG — filled or empty
function Diamond({ filled, dim }) {
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 20 20"
      className={`${styles.diamond} ${filled ? styles.diamondFilled : ""}`}
    >
      <polygon
        points="10,1 19,10 10,19 1,10"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SeriesRow({ series, WINS_NEEDED, TOTAL_GAMES }) {
  const type = series?.type ?? "BO3";
  const games = series?.games ?? [];
  const total = WINS_NEEDED[type] ?? 2;
  const p1Wins = games.filter((g) => g === "p1").length;
  const p2Wins = games.filter((g) => g === "p2").length;
  const winsNeeded = WINS_NEEDED[type] ?? 2;
  const seriesOver = p1Wins >= winsNeeded || p2Wins >= winsNeeded;
  const currentGame = games.length + 1;

  return (
    <div className={styles.seriesRow}>
      <div className={styles.seriesDiamonds}>
        {Array.from({ length: total }).map((_, i) => {
          const winner = games[i];
          const isP1 = winner === "p1";
          const isP2 = winner === "p2";
          return (
            <div key={i} className={styles.seriesGame}>
              <Diamond filled={isP1} dim={16} />
              <span className={styles.seriesGameNum}>{i + 1}</span>
              <Diamond filled={isP2} dim={16} />
            </div>
          );
        })}
      </div>
      {!seriesOver && (
        <span className={styles.seriesGameLabel}>Jogo {currentGame}</span>
      )}
      {seriesOver && (
        <span className={styles.seriesWinner}>
          {p1Wins >= winsNeeded ? "P1" : "P2"} venceu a série!
        </span>
      )}
    </div>
  );
}

function PlayerPanel({ player, playerNum, onLoreChange, onNameChange, onWin, onRecord, series, WINS_NEEDED, TOTAL_GAMES, maxLore }) {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(player.name);

  const handleNameBlur = () => {
    setEditingName(false);
    if (tempName !== player.name) onNameChange(playerNum, tempName);
  };

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
        {editingName ? (
          <input
            className={styles.nameInput}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
            autoFocus
            maxLength={20}
          />
        ) : (
          <button
            className={styles.nameButton}
            onClick={() => { setTempName(player.name); setEditingName(true); }}
          >
            {player.name}
            <span className={styles.editHint}>editar</span>
          </button>
        )}

        {/* Diamonds showing this player's wins */}
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
          disabled={player.lore === 0}
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

      {/* Win button — records victory for this player */}
      {!seriesOver && (
        <button
          className={`${styles.winBtn} ${won ? styles.winBtnHighlight : ""}`}
          onClick={() => onWin(playerKey)}
        >
          {player.name} venceu o jogo {games.length + 1}
        </button>
      )}

      {/* V/D/E record pickers */}
      <div className={styles.recordRow}>
        <NumberPicker label="V" value={player.vitorias ?? 0} onDecrement={() => onRecord(playerNum, "vitorias", -1)} onIncrement={() => onRecord(playerNum, "vitorias", 1)} />
        <NumberPicker label="D" value={player.derrotas ?? 0} onDecrement={() => onRecord(playerNum, "derrotas", -1)} onIncrement={() => onRecord(playerNum, "derrotas", 1)} />
        <NumberPicker label="E" value={player.empates ?? 0} onDecrement={() => onRecord(playerNum, "empates", -1)} onIncrement={() => onRecord(playerNum, "empates", 1)} />
      </div>
    </div>
  );
}

export default function Controller() {
  const {
    gameState, connected, loading,
    updateLore, updateName, setSeriesType, recordWin,
    setRodada, updateRecord, resetMatch,
    MAX_LORE, WINS_NEEDED, TOTAL_GAMES,
  } = useGameState("partida1");

  const seriesType = gameState.series?.type ?? "BO3";

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

      {/* Rodada picker */}
      {!loading && (
        <div className={styles.rodadaRow}>
          <NumberPicker
            label="Rodada"
            value={gameState.rodada ?? 1}
            onDecrement={() => setRodada(-1)}
            onIncrement={() => setRodada(1)}
            min={1}
          />
        </div>
      )}

      {/* Series type selector */}
      <div className={styles.seriesSelector}>
        {["BO1", "BO3", "BO5"].map((type) => (
          <button
            key={type}
            className={`${styles.seriesBtn} ${seriesType === type ? styles.seriesBtnActive : ""}`}
            onClick={() => setSeriesType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Series progress */}
      {!loading && (
        <SeriesRow
          series={gameState.series}
          WINS_NEEDED={WINS_NEEDED}
          TOTAL_GAMES={TOTAL_GAMES}
        />
      )}

      {loading ? (
        <div className={styles.loading}>Conectando...</div>
      ) : (
        <main className={styles.main}>
          <PlayerPanel
            player={gameState.player1}
            playerNum={1}
            onLoreChange={updateLore}
            onNameChange={updateName}
            onWin={recordWin}
            onRecord={updateRecord}
            series={gameState.series}
            WINS_NEEDED={WINS_NEEDED}
            TOTAL_GAMES={TOTAL_GAMES}
            maxLore={MAX_LORE}
          />
          <PlayerPanel
            player={gameState.player2}
            playerNum={2}
            onLoreChange={updateLore}
            onNameChange={updateName}
            onWin={recordWin}
            onRecord={updateRecord}
            series={gameState.series}
            WINS_NEEDED={WINS_NEEDED}
            TOTAL_GAMES={TOTAL_GAMES}
            maxLore={MAX_LORE}
          />
        </main>
      )}

      <footer className={styles.footer}>
        <button className={styles.resetBtn} onClick={resetMatch}>
          Resetar Série
        </button>
        <a className={styles.overlayLink} href="/overlay/full" target="_blank" rel="noopener noreferrer">
          Ver Overlay
        </a>
      </footer>
    </div>
  );
}
