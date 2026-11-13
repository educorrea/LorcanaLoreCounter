import { useEffect, useState } from "react";
import { useGameState } from "../hooks/useGameState";
import { useSyncedTimer } from "../hooks/useSyncedTimer";
import { usePwaManifest } from "../hooks/usePwaManifest";
import { LORCANA_INKS } from "../constants/lorcana";
import styles from "./Controller.module.css";

function NumberPicker({ value, min = 0, max = 99, onChange, ariaLabel }) {
  const n = Number(value) || 0;
  return (
    <div className={styles.numberPicker}>
      <button
        type="button"
        className={styles.pickerBtn}
        onClick={() => onChange(Math.max(min, n - 1))}
        disabled={n <= min}
        aria-label={`Diminuir ${ariaLabel || ""}`}
      >
        −
      </button>
      <span className={styles.pickerValue}>{n}</span>
      <button
        type="button"
        className={styles.pickerBtn}
        onClick={() => onChange(Math.min(max, n + 1))}
        disabled={n >= max}
        aria-label={`Aumentar ${ariaLabel || ""}`}
      >
        +
      </button>
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
          ["wins", "V", "Vitórias"],
          ["losses", "D", "Derrotas"],
          ["draws", "E", "Empates"],
        ].map(([field, short, label]) => (
          <div key={field} className={styles.recordField}>
            <span className={styles.recordLabel} title={label}>{short}</span>
            <NumberPicker
              value={player.record?.[field] ?? 0}
              min={0}
              max={99}
              ariaLabel={label}
              onChange={(next) => onRecordChange(playerNum, field, next)}
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

/** App do operador: nomes, rodada, timer, BO, reset, overlay */
export default function Config() {
  usePwaManifest("config");
  const {
    gameState, connected, loading,
    updateName, updateRecord, updateColors, updateRound,
    setTimerDuration, startTimer, pauseTimer, resetTimer,
    setSeriesType, resetMatch,
  } = useGameState("partida1");

  const seriesType = gameState.series?.type ?? "BO3";
  const { label, expired } = useSyncedTimer(gameState.timer);
  const durationMinutes = Math.round((gameState.timer?.durationSeconds ?? 3000) / 60);
  const running = Boolean(gameState.timer?.running);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Lorcana</h1>
          <span className={styles.subtitle}>Config</span>
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.dot} ${connected ? styles.dotOnline : styles.dotOffline}`} />
          <span className={styles.status}>{connected ? "Online" : "Offline"}</span>
        </div>
      </header>

      {loading ? (
        <div className={styles.loading}>Conectando...</div>
      ) : (
        <div className={styles.configMain}>
          <p className={styles.installHint}>
            <strong>Apps separados no Android</strong>
            <br />
            1. Desinstale o app antigo “Lorcana/Contador” (segurar ícone →
            Desinstalar).
            <br />
            2. No Chrome, abra <strong>/config/</strong> → ⋮ → Instalar app
            (ícone azul).
            <br />
            3. No Chrome, abra <strong>/contador/</strong> → ⋮ → Instalar app
            (ícone roxo).
            <br />
            Não instale de dentro de um app já instalado — use o Chrome.
          </p>

          <section className={styles.configSection}>
            <h2 className={styles.configTitle}>Tipo de série</h2>
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
          </section>

          <section className={styles.configSection}>
            <h2 className={styles.configTitle}>Rodada</h2>
            <NumberPicker
              value={Number(String(gameState.round ?? "1").match(/\d+/)?.[0] || 1)}
              min={1}
              max={99}
              ariaLabel="Rodada"
              onChange={(next) => updateRound(String(next))}
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
                Resetar
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

          <section className={styles.configSection}>
            <h2 className={styles.configTitle}>Série & Overlay</h2>
            <div className={styles.configActions}>
              <button className={styles.resetBtn} onClick={resetMatch}>
                Resetar Série
              </button>
              <a className={styles.overlayLink} href="/overlay/full" target="_blank" rel="noopener noreferrer">
                Ver Overlay
              </a>
            </div>
            <a className={styles.contadorLink} href="/contador/" target="_blank" rel="noopener noreferrer">
              Abrir Contador (jogadores)
            </a>
          </section>
        </div>
      )}
    </div>
  );
}
