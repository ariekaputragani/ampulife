"use client";

import { useLayeredGame } from "./useLayeredGame";
import styles from "./layeredGame.module.css";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LayeredGameView() {
  const { state, options, actions, ready } = useLayeredGame();
  const [activeTab, setActiveTab] = useState("journal");
  const logEndRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state?.history, activeTab]);

  if (!ready) {
    return <div className={styles.loading}>Memuat Kehidupan...</div>;
  }

  const groupedHistory = state.history.reduce((groups, log) => {
    const ageGroup = groups.find((g) => g.age === log.age);
    if (ageGroup) {
      ageGroup.logs.push(log);
    } else {
      groups.push({ age: log.age, logs: [log] });
    }
    return groups;
  }, []);

  // --- MODE: PLAYING ---
  return (
    <div className={styles.gameLayout}>
      {/* Top Part: Title & Money */}
      <header className={styles.header}>
        AmpuLife | Rp{state.money.toLocaleString("id-ID")} | {state.age} Tahun
      </header>

      <main className={styles.mainContent}>
        {/* Log Window (Messages) */}
        {activeTab === "journal" && (
          <div className={styles.logWindow}>
            {groupedHistory.map((group) => (
              <div key={group.age} className={styles.ageGroup}>
                <div className={styles.ageHeader}>{group.age} Tahun</div>
                {group.logs.map((log) => (
                  <div key={log.id} className={styles.logItemText}>
                    {log.message}
                  </div>
                ))}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}

        {/* Tab Panes */}
        {activeTab === "assets" && <AssetsTab state={state} options={options} actions={actions} onBack={() => setActiveTab("journal")} />}
        {activeTab === "relations" && <RelationsTab state={state} actions={actions} onBack={() => setActiveTab("journal")} />}
        {activeTab === "activities" && <ActivitiesTab state={state} options={options} actions={actions} onBack={() => setActiveTab("journal")} />}
        {activeTab === "jobs" && <JobsTab state={state} options={options} actions={actions} onBack={() => setActiveTab("journal")} />}
        {activeTab === "health" && <HealthTab state={state} options={options} actions={actions} onBack={() => setActiveTab("journal")} />}

        {/* Status Bars */}
        <section className={styles.statusBars}>
          <h4>Kebahagiaan: <span>{state.stats.happy}%</span></h4>
          <progress value={state.stats.happy} max="100" />
          
          <h4>Kesehatan: <span>{state.stats.health}%</span></h4>
          <progress value={state.stats.health} max="100" />
          
          <h4>Kecerdasan: <span>{state.stats.smarts}%</span></h4>
          <progress value={state.stats.smarts} max="100" />
          
          <h4>Penampilan: <span>{state.stats.looks}%</span></h4>
          <progress value={state.stats.looks} max="100" />
        </section>

        {/* Age Up Button */}
        <div className={styles.ageUpSection}>
          <button onClick={actions.ageUp} className={styles.ageUpButton}>+ Umur</button>
        </div>

        {/* Navigation Grid (Buttons) */}
        {activeTab === "journal" && (
          <div className={styles.navGrid}>
            <button style={{ width: "33.33%" }} onClick={() => setActiveTab("jobs")}>Pekerjaan</button>
            <button style={{ width: "33.33%" }} onClick={() => setActiveTab("assets")}>Aset</button>
            <button style={{ width: "33.33%" }} onClick={() => setActiveTab("relations")}>Hubungan</button>
            <button style={{ width: "50%" }} onClick={() => setActiveTab("activities")}>Aktivitas Umum</button>
            <button style={{ width: "50%" }} onClick={() => setActiveTab("health")}>Medis & Kesehatan</button>
          </div>
        )}
      </main>

      {/* Interactive Event Modal */}
      {state.currentEvent && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h2>Kejadian: {state.currentEvent.summary}</h2>
            <div className={styles.optionsList}>
              {state.currentEvent.options.map((opt) => (
                <button key={opt.id} onClick={() => actions.handleEventChoice(opt.id)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Death Modal */}
      {!state.life.isAlive && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h1>Kematian</h1>
            <p>Penyebab: {state.life.causeOfDeath}</p>
            <p>Usia: {state.age} tahun.</p>
            <button onClick={() => {
              actions.reset();
              router.push("/");
            }} className={styles.primaryButton}>Mulai Lagi</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AssetsTab({ state, options, actions, onBack }) {
  return (
    <div className={styles.tabPane}>
      <h3>Aset & Toko</h3>
      <div className={styles.optionsList}>
        {options.assets.map((asset) => (
          <button key={asset.id} onClick={() => actions.buyAsset(asset.id)} disabled={state.money < asset.price}>
            {asset.name} (Rp{asset.price.toLocaleString("id-ID")})
          </button>
        ))}
      </div>
      <button onClick={onBack} className={styles.secondaryButton} style={{ marginTop: "10px" }}>Kembali</button>
    </div>
  );
}

function RelationsTab({ state, actions, onBack }) {
  return (
    <div className={styles.tabPane}>
      <h3>Hubungan</h3>
      {state.relations.map((rel) => (
        <div key={rel.id} className={styles.itemCard} style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}>
          <strong>{rel.name}</strong> ({rel.label}) - Kedekatan: {rel.bond}%
          <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
            <button onClick={() => actions.relationAction(rel.id, "talk")}>Ngobrol</button>
            <button onClick={() => actions.relationAction(rel.id, "gift")}>Hadiah</button>
          </div>
        </div>
      ))}
      <button onClick={onBack} className={styles.secondaryButton} style={{ marginTop: "10px" }}>Kembali</button>
    </div>
  );
}

function ActivitiesTab({ state, options, actions, onBack }) {
  return (
    <div className={styles.tabPane}>
      <h3>Aktivitas Umum</h3>
      <div className={styles.optionsList}>
        {options.activities.map((act) => (
          <button key={act.id} onClick={() => actions.takeActivity(act.id)} disabled={act.cost && state.money < act.cost}>
            {act.name} {act.cost ? `(Rp${act.cost.toLocaleString("id-ID")})` : ""}
          </button>
        ))}
        <div className={styles.divider} />
        {options.crimes.map((crime) => (
          <button key={crime.id} onClick={() => actions.doCrime(crime.id)}>
            {crime.name}
          </button>
        ))}
      </div>
      <button onClick={onBack} className={styles.secondaryButton} style={{ marginTop: "10px" }}>Kembali</button>
    </div>
  );
}

function HealthTab({ state, options, actions, onBack }) {
  return (
    <div className={styles.tabPane}>
      <h3>Medis & Kesehatan</h3>
      <div className={styles.optionsList}>
        <div style={{ marginBottom: "10px", fontSize: "14px" }}>
          Kondisi saat ini: <strong>{state.healthStatus.condition === "healthy" ? "Sehat" : "Sakit"}</strong>
        </div>
        {options.treatments.map((tr) => (
          <button key={tr.id} onClick={() => actions.treatment(tr.id)} disabled={state.money < tr.cost}>
            👨‍⚕️ {tr.name} (Rp{tr.cost.toLocaleString("id-ID")})
          </button>
        ))}
      </div>
      <button onClick={onBack} className={styles.secondaryButton} style={{ marginTop: "10px" }}>Kembali</button>
    </div>
  );
}

function JobsTab({ state, options, actions, onBack }) {
  const currentJob = options.jobs.find(j => j.id === state.career.jobId);
  return (
    <div className={styles.tabPane}>
      <h3>Karir</h3>
      {state.career.jobId ? (
        <div className={styles.currentJobCard}>
          <p>Bekerja sebagai: <strong>{currentJob?.name || state.career.jobId}</strong></p>
          <button onClick={() => actions.promote()} className={styles.primaryButton}>Cek Promosi</button>
        </div>
      ) : (
        <div className={styles.optionsList}>
          {options.jobs.map((job) => (
            <button key={job.id} onClick={() => actions.takeJob(job.id)}>
              Lamar: {job.name} (Rp{job.salaryPerYear.toLocaleString("id-ID")}/thn)
            </button>
          ))}
        </div>
      )}
      <div className={styles.divider} />
      <h4>Pendidikan</h4>
      <div className={styles.optionsList}>
        {options.education.map((edu) => (
          <button key={edu.id} onClick={() => actions.study(edu.id)} disabled={state.money < edu.costPerYear}>
            {edu.name}
          </button>
        ))}
      </div>
      <button onClick={onBack} className={styles.secondaryButton} style={{ marginTop: "10px" }}>Kembali</button>
    </div>
  );
}
