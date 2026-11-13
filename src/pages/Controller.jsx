import { useEffect, useState } from "react";
import { useGameState } from "../hooks/useGameState";
import { useSyncedTimer } from "../hooks/useSyncedTimer";
import { LORCANA_INKS, formatRecord } from "../constants/lorcana";
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

function SeriesRow({ series, WINS_NEEDED }) {
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
          return (
            <div key={i} className={styles.seriesGame}>
              <Diamond filled={winner === "p1"} dim={16} />
              <span className={styles.seriesGameNum}>{i + 1}</span>
              <Diamond filled={winner === "p2"} dim={16} />
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

function ColorPicker({ colors, onChange }) {
  const selected = colors ?? [];

  const toggle = (id) => {
    if (selected.includes(id)) {
      if (selected.length <= 1) return;
      onChange(selected.filter((c) => c !== id));
      return;
    }
    if (selected.length < 2) {
      onChange([...selected, id]);
      return;
    }
    // Replace oldest selection when already at 2
    onChange([selected[1], id]);
  };

  return (
    <div className={styles.colorGrid}>
      {LORCANA_INKS.map((ink) => {
        const active = selected.includes(ink.id);
        const order = selected.indexOf(ink.id);
        return (
          <button
            key={ink.id}
            type="button"
            className={`${styles.colorBtn} ${active ? styles.colorBtnActive : ""}`}
            onClick={() => toggle(ink.id)}
            title={ink.label}
          >
            <span className={styles.colorSwatch} style={{ background: ink.hex }} />
            <span className={styles.colorLabel}>{ink.label}</span>
            {active && <span className={styles.colorOrder}>{order + 1}</span>}
          </button>
        );
      })}
    </div>
  );
}

function ConfigPlayerCard({
  player,
  playerNum,
  onNameChange,
  onRecordChange,
  onColorsChange,
}) {
  const [tempName, setTempName] = useState(player.name);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setTempName(player.name);
  }, [player.name, editing]);

  return (
    <div className={styles.configCard}>
      <label className={styles.fieldLabel}>Nome</label>
      <input
        className={styles.configInput}
        value={tempName}
        maxLength={24}
        onFocus={() => {
          setEditing(true);
          setTempName(player.name);
        }}
        onChange={(e) => setTempName(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (tempName !== player.name) onNameChange(playerNum, tempName);
          else setTempName(player.name);
        }}
        onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
      />

      <label className={styles.fieldLabel}>Campeonato (V–D–E)</label>
      <div className={styles.recordInputs}>
        {[
          ["wins", "V"],
          ["losses", "D"],
          ["draws", "E"],
        ].map(([field, label]) => (
          <div key={field} className={styles.recordField}>
            <span className={styles.recordLabel}>{label}</span>
            <input
              className={styles.recordInput}
              type="number"
              min={0}
              max={99}
              value={player.record?.[field] ?? 0}
              onChange={(e) => onRecordChange(playerNum, field, e.target.value)}
            />
          </div>
        ))}
      </div>

      <label className={styles.fieldLabel}>Cores do deck (2)</label>
      <ColorPicker
        colors={player.colors}
        onChange={(next) => onColorsChange(playerNum, next)}
      />
    </div>
  );
}

function ConfigTab({
  gameState,
  updateName,
  updateRecord,
  updateColors,
  updateRound,
  setTimerDuration,
  startTimer,
  pauseTimer,
  resetTimer,
}) {
  const { label, expired } = useSyncedTimer(gameState.timer);
  const durationMinutes = Math.round((gameState.timer?.durationSeconds ?? 3000) / 60);
  const running = Boolean(gameState.timer?.running);

  return (
    <div className={styles.configMain}>
      <section className={styles.configSection}>
        <h2 className={styles.configTitle}>Rodada</h2>
        <input
          className={styles.configInput}
          value={gameState.round ?? ""}
          maxLength={40}
          placeholder="Ex: Rodada 3 / Phase 2"
          onChange={(e) => updateRound(e.target.value)}
        />
      </section>

      <section className={styles.configSection}>
        <h2 className={styles.configTitle}>Tempo da rodada</h2>
        <div className={`${styles.timerDisplay} ${expired ? styles.timerExpired : ""}`}>
          {label}
        </div>
        <div className={styles.timerControls}>
          <label className={styles.durationField}>
            <span>Minutos</span>
            <input
              className={styles.recordInput}
              type="number"
              min={1}
              max={180}
              value={durationMinutes}
              onChange={(e) => setTimerDuration(e.target.value)}
            />
          </label>
          {!running ? (
            <button className={styles.timerBtn} onClick={startTimer} disabled={expired && durationMinutes <= 0}>
              Iniciar
            </button>
          ) : (
            <button className={styles.timerBtn} onClick={pauseTimer}>
              Pausar
            </button>
          )}
          <button className={`${styles.timerBtn} ${styles.timerBtnGhost}`} onClick={resetTimer}>
            Reset
          </button>
        </div>
      </section>

      <section className={styles.configSection}>
        <h2 className={styles.configTitle}>Jogador 1</h2>
        <ConfigPlayerCard
          player={gameState.player1}
          playerNum={1}
          onNameChange={updateName}
          onRecordChange={updateRecord}
          onColorsChange={updateColors}
        />
      </section>

      <section className={styles.configSection}>
        <h2 className={styles.configTitle}>Jogador 2</h2>
        <ConfigPlayerCard
          player={gameState.player2}
          playerNum={2}
          onNameChange={updateName}
          onRecordChange={updateRecord}
          onColorsChange={updateColors}
        />
      </section>
    </div>
  );
}

export default function Controller() {
  const [tab, setTab] = useState("lore");
  const {
    gameState, connected, loading,
    updateLore, updateName, updateRecord, updateColors, updateRound,
    setTimerDuration, startTimer, pauseTimer, resetTimer,
    setSeriesType, recordWin, resetMatch,
    MAX_LORE, WINS_NEEDED,
  } = useGameState("partida1");

  const seriesType = gameState.series?.type ?? "BO3";
  const timer = useSyncedTimer(gameState.timer);

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

      <nav className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${tab === "lore" ? styles.tabBtnActive : ""}`}
          onClick={() => setTab("lore")}
        >
          Lore
        </button>
        <button
          className={`${styles.tabBtn} ${tab === "config" ? styles.tabBtnActive : ""}`}
          onClick={() => setTab("config")}
        >
          Config
        </button>
      </nav>

      {tab === "lore" && (
        <>
          <div className={styles.roundBanner}>
            <span className={styles.roundText}>{gameState.round}</span>
            <span className={`${styles.roundTimer} ${timer.expired ? styles.timerExpired : ""}`}>
              {timer.label}
            </span>
          </div>

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

          {!loading && (
            <SeriesRow series={gameState.series} WINS_NEEDED={WINS_NEEDED} />
          )}

          {loading ? (
            <div className={styles.loading}>Conectando...</div>
          ) : (
            <main className={styles.main}>
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

          <footer className={styles.footer}>
            <button className={styles.resetBtn} onClick={resetMatch}>
              Resetar Série
            </button>
            <a className={styles.overlayLink} href="/overlay/full" target="_blank" rel="noopener noreferrer">
              Ver Overlay
            </a>
          </footer>
        </>
      )}

      {tab === "config" && (
        loading ? (
          <div className={styles.loading}>Conectando...</div>
        ) : (
          <ConfigTab
            gameState={gameState}
            updateName={updateName}
            updateRecord={updateRecord}
            updateColors={updateColors}
            updateRound={updateRound}
            setTimerDuration={setTimerDuration}
            startTimer={startTimer}
            pauseTimer={pauseTimer}
            resetTimer={resetTimer}
          />
        )
      )}
    </div>
  );
}
