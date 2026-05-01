"use client";

import { useLayeredGame } from "./useLayeredGame";
import styles from "./layeredGame.module.css";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { educationCatalog } from "@/layers/infrastructure/catalogs/educationCatalog";

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

  useEffect(() => {
    if (state.notificationQueue && state.notificationQueue.length > 0) {
      const notif = state.notificationQueue[0];

      if (notif.type === "confirm") {
        Swal.fire({
          title: notif.title,
          text: notif.message,
          icon: notif.icon,
          showCancelButton: true,
          showDenyButton: notif.options.length > 2,
          confirmButtonText: notif.options[0]?.label || "Ya",
          denyButtonText: notif.options[1]?.label || "Tidak",
          cancelButtonText: notif.options[notif.options.length - 1]?.label || "Batal",
        }).then((result) => {
          let choiceId = null;
          if (result.isConfirmed) {
            choiceId = notif.options[0].id;
          } else if (result.isDenied) {
            choiceId = notif.options[1].id;
          } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
            choiceId = notif.options[notif.options.length - 1].id;
          }

          if (choiceId) {
            actions.resolveChoice(notif.eventId, choiceId);
          }
          actions.popNotification();
        });
      } else {
        Swal.fire({
          title: notif.title,
          text: notif.message,
          icon: notif.icon,
          confirmButtonText: "OK",
        }).then(() => {
          actions.popNotification();
        });
      }
    }
  }, [state.notificationQueue, actions]);

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
        AmpuLife | Rp{state.money.toLocaleString("id-ID")} | {state.age} Th
      </header>

      <main className={styles.mainContent}>
        {/* Log Window (Messages) */}
        {activeTab === "journal" && (
          <div className={styles.logWindow} id="log-window">
            {groupedHistory.map((group) => (
              <div key={group.age} className={styles.ageGroup}>
                <div className={styles.ageHeader}>Umur: {group.age} tahun ({Number(state.profile.birthDate.year) + group.age})</div>
                {group.logs.map((log) => (
                  <div
                    key={log.id}
                    className={styles.logItemText}
                    dangerouslySetInnerHTML={{ __html: log.message }}
                  />
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
        {activeTab === "finance" && <FinanceTab state={state} actions={actions} onBack={() => setActiveTab("journal")} />}



        {/* Status Bars */}
        <section className={styles.statusBars}>
          {/* Kebahagiaan */}
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Kebahagiaan:</span>
            <span className={styles.statusPercent}>
              <i className={state.stats.happy <= 15 ? "fa-solid fa-face-frown" : state.stats.happy <= 80 ? "fa-solid fa-face-meh" : "fa-solid fa-face-smile"}></i>
            </span>
            <progress value={state.stats.happy} max="100" />
          </div>

          {/* Kesehatan */}
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Kesehatan:</span>
            <span className={styles.statusPercent}>
              <i className={state.stats.health <= 15 ? "fa-solid fa-heart-crack" : "fa-solid fa-heart"}></i>
            </span>
            <progress value={state.stats.health} max="100" />
          </div>

          {/* Kecerdasan */}
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Kecerdasan:</span>
            <span className={styles.statusPercent}>
              <i className={state.stats.smarts <= 15 ? "fa-solid fa-face-grin-tongue" : state.stats.smarts <= 80 ? "fa-solid fa-brain" : "fa-solid fa-lightbulb"}></i>
            </span>
            <progress value={state.stats.smarts} max="100" />
          </div>

          {/* Penampilan */}
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Penampilan:</span>
            <span className={styles.statusPercent}>
              <i className={state.stats.looks <= 15 ? "fa-solid fa-skull" : state.stats.looks <= 80 ? "fa-solid fa-user" : "fa-solid fa-user-tie"}></i>
            </span>
            <progress value={state.stats.looks} max="100" />
          </div>
        </section>

        {/* Age Up Button */}
        <div className={styles.ageUpSection}>
          <button onClick={actions.ageUp} className={styles.ageUpButton}><i className="fa fa-plus"></i> Umur</button>
        </div>

        {/* Navigation Grid (Buttons) */}
        {activeTab === "journal" && (
          <>
            {(() => {
              // Dynamic Occupancy Status
              let occStatus = "Okupansi";
              let occIcon = "fa-briefcase";

              if (state.age < 6) {
                occStatus = "Infant";
                occIcon = "fa-baby";
              } else if (state.education && state.education.level && state.education.level !== "none") {
                occStatus = "Sekolah";
                occIcon = "fa-school";
              } else if (state.legal && state.legal.inJail) {
                occStatus = "Di penjara";
                occIcon = "fa-xmarks-lines";
              } else if (state.career && state.career.jobId) {
                occStatus = "Pekerjaan";
                occIcon = "fa-briefcase";
              }

              const handleOccClick = () => {
                if (state.age < 6) {
                  Swal.fire({
                    title: "Informasi",
                    html: `<div style="text-align: left;"><strong>Nama:</strong> ${state.profile.name}<br><strong>Alamat:</strong> ${state.profile.city}, Indonesia</div>`,
                    icon: "info"
                  });
                } else {
                  setActiveTab("jobs");
                }
              };

              return (
                <div className={styles.navGrid}>
                  {/* Row 1 */}
                  <button
                    className={styles.navButton2}
                    onClick={handleOccClick}
                  >
                    <i className={`fa-solid ${occIcon}`}></i> {occStatus}
                  </button>

                  <button
                    className={styles.navButton1}
                    onClick={() => setActiveTab("assets")}
                    disabled={state.age < 10}
                  >
                    <i className="fa-solid fa-house-chimney-user"></i> Aset
                  </button>

                  <button
                    className={styles.navButton1}
                    onClick={() => setActiveTab("relations")}
                    disabled={state.age < 6}
                  >
                    <i className="fa-solid fa-user-group"></i> Hubungan
                  </button>

                  <button
                    className={styles.navButton1}
                    onClick={() => setActiveTab("activities")}
                    disabled={state.age < 6}
                  >
                    <i className="fa-solid fa-book-open"></i> Aktivitas
                  </button>

                  {/* Row 2 */}
                  <button
                    className={styles.navButton1}
                    onClick={() => setActiveTab("health")}
                  >
                    <i className="fa-solid fa-stethoscope"></i> Medis
                  </button>

                  <button
                    className={styles.navButton1}
                    onClick={() => setActiveTab("finance")}
                  >
                    <i className="fa-solid fa-wallet"></i> Keuangan
                  </button>
                </div>
              );
            })()}
            <div className={styles.ageUpSection}>
              <button
                className={styles.tombol2Button}
                style={{ margin: "0 0 12px 0" }} // Removing top margin because it's now in a section
                onClick={() => {
                  Swal.fire({
                    title: 'Akhiri Hidup?',
                    text: "Semua progres akan hilang dan kamu akan mulai dari awal.",
                    icon: 'warning',
                    showCancelButton: true,
                    customClass: {
                      confirmButton: styles.swalDrugButton
                    },
                    cancelButtonColor: "#7066e0",
                    confirmButtonText: 'Ya',
                    cancelButtonText: 'Tidak',
                    focusCancel: true
                  }).then((result) => {
                    if (result.isConfirmed) {
                      actions.reset();
                      window.location.reload();
                    }
                  });
                }}
              >
                <i className="fa fa-shuffle"></i> Ulangi Hidup (Reset)
              </button>
            </div>
          </>
        )}
      </main>

      {/* Interactive Event Modal */}
      {state.currentEvent && (() => {
        const eventId = state.currentEvent.id;
        let icon = "🌟";
        let categoryClass = styles.modalLife;

        // Map events to categories and icons
        if (["school_award", "drop_out_school", "bully", "scholarship_offer", "academic_achievement", "adult_transition"].includes(eventId)) {
          icon = "🏫";
          categoryClass = styles.modalSchool;
        } else if (["illness", "parent_sick"].includes(eventId)) {
          icon = "🩺";
          categoryClass = styles.modalHealth;
        } else if (["financial_crisis", "household_crisis", "parent_phk"].includes(eventId)) {
          icon = "🚨";
          categoryClass = styles.modalEmergency;
        } else if (["side_income", "parent_job_recovery"].includes(eventId)) {
          icon = "💰";
          categoryClass = styles.modalFinance;
        }

        return (
          <div className={styles.modalBackdrop}>
            <div className={`${styles.modalContent} ${categoryClass}`}>
              <span className={styles.modalIcon}>{icon}</span>
              <h2 className={styles.modalTitle}>Kejadian Khusus</h2>
              <p className={styles.modalSummary}>{state.currentEvent.summary}</p>
              <div className={styles.modalOptionsList}>
                {state.currentEvent.options.map((opt, idx) => (
                  <button
                    key={opt.id}
                    className={`${styles.modalOptionButton} ${idx === 0 ? styles.modalOptionButtonPrimary : ""}`}
                    onClick={() => actions.handleEventChoice(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Death Modal */}
      {!state.life.isAlive && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h1>Kematian</h1>
            <p>Penyebab: {state.life.causeOfDeath}</p>
            <p>Umur: {state.age} tahun.</p>
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
  const isIndependent = state.profile?.isIndependent;
  const availableFunds = isIndependent ? state.money : state.family.savings;
  const fundLabel = isIndependent ? "Uang Pribadi" : "Tabungan Keluarga";
  const [pendingAsset, setPendingAsset] = useState(null);

  const handleAssetClick = (asset) => {
    if (isIndependent) {
      actions.buyAsset(asset.id);
    } else {
      setPendingAsset(asset);
    }
  };

  return (
    <div className={styles.tabPane}>
      <h3>Aset & Toko</h3>

      {/* Pending Asset Decision Modal */}
      {pendingAsset && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent} style={{ background: "#fff", color: "#333" }}>
            <h3 style={{ marginBottom: "5px" }}>{pendingAsset.name}</h3>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#e03131", marginBottom: "15px" }}>
              Harga: Rp{pendingAsset.price.toLocaleString("id-ID")}
            </div>
            <p style={{ fontSize: "13px", marginBottom: "20px", color: "#666" }}>
              Bagaimana kamu ingin mendapatkan barang ini?
            </p>
            <div className={styles.modalOptionsList}>
              <button
                className={styles.modalOptionButton}
                onClick={() => {
                  actions.buyAsset(pendingAsset.id);
                  setPendingAsset(null);
                }}
                disabled={state.money < pendingAsset.price}
              >
                💰 Beli Pakai Uang Sendiri
                <div style={{ fontSize: "10px", opacity: 0.8 }}>Uang Jajan: Rp{state.money.toLocaleString("id-ID")}</div>
              </button>
              <button
                className={styles.modalOptionButton}
                onClick={() => {
                  actions.askParents(pendingAsset.id);
                  setPendingAsset(null);
                }}
                disabled={state.lastAssetRequestAge === state.age}
                style={{ background: "#e7f5ff", color: "#228be6", opacity: state.lastAssetRequestAge === state.age ? 0.5 : 1 }}
              >
                🙏 Minta Dibelikan Orang Tua
                <div style={{ fontSize: "10px", opacity: 0.8 }}>
                  {state.lastAssetRequestAge === state.age
                    ? "✅ Sudah minta tahun ini"
                    : "Peluang keberhasilan tergantung Smarts & Hubungan."}
                </div>
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => setPendingAsset(null)}
                style={{ marginTop: "10px", width: "100%" }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owned Assets Section */}
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ fontSize: "14px", color: "#495057", marginBottom: "8px" }}>📦 Aset Milikku</h4>
        {state.assets && state.assets.length > 0 ? (
          <div className={styles.optionsList}>
            {state.assets.map((asset, idx) => (
              <div key={`${asset.id}-${idx}`} className={styles.itemCard} style={{ padding: "10px", fontSize: "13px", background: "#f8f9fa", borderLeft: "4px solid #40c057" }}>
                <strong>{asset.name}</strong>
                <div style={{ fontSize: "11px", color: "#868e96" }}>Dibeli pada umur {asset.boughtAtAge} tahun</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: "12px", color: "#adb5bd", fontStyle: "italic" }}>Belum memiliki aset apapun.</div>
        )}
      </div>

      <div className={styles.divider} />

      {/* Store Section */}
      <div style={{ marginTop: "10px" }}>
        <h4 style={{ fontSize: "14px", color: "#495057", marginBottom: "8px" }}>🏪 Toko Aset</h4>
        <div style={{ fontSize: "11px", color: "#228be6", marginBottom: "10px" }}>Tersedia: <strong>Rp{availableFunds.toLocaleString("id-ID")}</strong> ({fundLabel})</div>
        <div className={styles.optionsList}>
          {options.assets.map((asset) => {
            const isAffordable = availableFunds >= asset.price;
            return (
              <button
                key={asset.id}
                onClick={() => handleAssetClick(asset)}
                style={{ textAlign: "left", padding: "12px", marginBottom: "8px", opacity: isAffordable || !isIndependent ? 1 : 0.6 }}
              >
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>{asset.name}</div>
                <div style={{ fontSize: "11px", color: "#666", margin: "4px 0" }}>💡 {asset.description}</div>
                <div style={{ fontSize: "12px", color: isAffordable ? "#2f9e44" : "#e03131", fontWeight: "bold" }}>
                  Rp{asset.price.toLocaleString("id-ID")}
                </div>
                <div style={{ fontSize: "10px", color: "#868e96", marginTop: "4px" }}>
                  Efek: {asset.delta.happy > 0 ? `😊+${asset.delta.happy} ` : ""}{asset.delta.smarts > 0 ? `🧠+${asset.delta.smarts} ` : ""}{asset.delta.looks > 0 ? `✨+${asset.delta.looks} ` : ""}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={onBack} className={styles.secondaryButton} style={{ marginTop: "15px" }}>Kembali</button>
    </div>
  );
}

function RelationsTab({ state, actions, onBack }) {
  const relActions = [
    { id: "chat", name: "💬 Ngobrol", desc: "Berbagi cerita santai.", effect: "📈 +5%" },
    { id: "rant", name: "🗣️ Curhat", desc: "Menceritakan keluh kesah.", effect: "📈 +8%, 😊 +5" },
    { id: "ask_money", name: "💰 Minta Uang", desc: "Minta uang saku.", effect: "💸 +Uang, 📉 -5%", familyOnly: true },
    { id: "give_money", name: "💸 Memberi Uang", desc: "Beri uang saku.", effect: "📈 +Kedekatan, 💸 -Uang" },
    { id: "gift", name: "🎁 Hadiah", desc: "Memberi kado (Rp1jt).", effect: "📈 +15%" },
    { id: "ask_out", name: "❤️ Pacaran", desc: "Ajak pacaran.", effect: "Status: Pacar", oppositeOnly: true, minAge: 12, hideIfPartner: true },
    { id: "propose", name: "💍 Lamar", desc: "Ajak menikah (Rp50jt).", effect: "Status: Pasangan", partnerOnly: true }
  ];

  const handleAction = (rel, action) => {
    if (action.id === "give_money") {
      const uang = state.money;
      let minR, maxR;
      if (uang < 200000) {
        minR = 500;
      } else if (uang < 800000) {
        minR = 1000;
      } else if (uang < 5000000) {
        minR = 5000;
      } else if (uang < 10000000) {
        minR = 10000;
      } else if (uang < 100000000) {
        minR = 50000;
      } else if (uang < 750000000) {
        minR = 100000;
      } else {
        minR = 500000;
      }

      if (uang < 100000) {
        maxR = 100000;
      } else if (uang < 1000000000) {
        maxR = uang - (uang % minR);
      } else {
        maxR = 1000000000;
      }

      import("sweetalert2").then((Swal) => {
        Swal.default.fire({
          title: rel.label,
          icon: "question",
          input: "range",
          inputLabel: "Memberi uang",
          inputAttributes: {
            min: minR,
            max: maxR,
            step: minR
          },
          inputValue: 0.2 * maxR - ((0.2 * maxR) % minR)
        }).then((result) => {
          if (result.isConfirmed && result.value) {
            actions.interact(rel.id, action.id, Number(result.value));
          }
        });
      });
      return;
    }
    actions.interact(rel.id, action.id);
  };

  const statusLabels = {
    family: "Keluarga",
    acquaintance: "Kenalan",
    friend: "Teman",
    best_friend: "Sahabat",
    partner: "Pacar ❤️",
    spouse: "Pasangan 💍"
  };

  return (
    <div className={styles.tabPane}>
      <h3>Hubungan & Sosial</h3>
      <div className={styles.optionsList}>
        {state.relations.map((rel) => {
          const isInteracted = rel.lastInteractionAge === state.age;
          const currentRel = rel.relationship ?? rel.bond ?? 0;
          const currentGender = rel.gender || (rel.id === "mother" ? "female" : "male");
          const isOppositeGender = currentGender !== state.profile.gender;
          const isDead = rel.isDead;

          return (
            <div
              key={rel.id}
              className={styles.itemCard}
              style={{
                padding: "12px",
                borderLeft: isDead ? "4px solid #adb5bd" : (rel.status === "partner" || rel.status === "spouse" ? "4px solid #f06595" : "4px solid #ced4da"),
                marginBottom: "10px",
                opacity: isDead ? 0.6 : 1,
                background: isDead ? "#f8f9fa" : "#fff"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{rel.name}</strong> {isDead ? "🕯️" : (currentGender === "male" ? "♂️" : "♀️")}
                  <div style={{ fontSize: "11px", color: "#868e96" }}>
                    {isDead ? "Almarhum/ah" : rel.label} • {statusLabels[rel.status] || (rel.id === "father" || rel.id === "mother" ? "Keluarga" : "Teman")}
                    {rel.age && ` • ${rel.age} Th`}
                  </div>
                </div>
                {!isDead && <div style={{ fontSize: "12px", fontWeight: "bold", color: "#495057" }}>{currentRel}%</div>}
              </div>

              {!isDead && (
                <>
                  <progress
                    value={currentRel}
                    max="100"
                    style={{ width: "100%", height: "8px", marginTop: "8px" }}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
                    {relActions.map(action => {
                      if (action.familyOnly && rel.status !== "family") return null;
                      if (action.oppositeOnly && !isOppositeGender) return null;
                      if (action.minAge && state.age < action.minAge) return null;
                      if (action.partnerOnly && rel.status !== "partner") return null;
                      if (action.hideIfPartner && (rel.status === "partner" || rel.status === "spouse")) return null;

                      const isDisabled = isInteracted && action.id !== "ask_out" && action.id !== "propose" && action.id !== "give_money";

                      return (
                        <button
                          key={action.id}
                          disabled={isDisabled}
                          onClick={() => handleAction(rel, action)}
                          style={{ textAlign: "left", padding: "8px", height: "auto", display: "flex", flexDirection: "column" }}
                        >
                          <span style={{ fontWeight: "bold", fontSize: "12px" }}>{action.name}</span>
                          <span style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>{action.desc}</span>
                          <span style={{ fontSize: "9px", color: "#228be6", fontWeight: "bold" }}>{action.effect}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={onBack} className={styles.secondaryButton} style={{ marginTop: "10px" }}>Kembali</button>
    </div>
  );
}

function ActivitiesTab({ state, options, actions, onBack }) {
  return (
    <div className={styles.tabPane}>
      <h3>Aktivitas Umum</h3>
      <div className={styles.optionsList}>
        {options.activities.map((act) => {
          const isDone = state.lastActivityAges?.[act.id] === state.age;
          return (
            <button
              key={act.id}
              onClick={() => actions.takeActivity(act.id)}
              disabled={isDone || (act.cost && state.money < act.cost)}
              style={{
                textAlign: "left",
                padding: "12px",
                marginBottom: "8px",
                display: "block",
                width: "100%",
                background: isDone ? "#f1f3f5" : "#fff",
                color: isDone ? "#adb5bd" : "inherit"
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                {isDone ? "✅ " : ""}{act.name} {act.cost > 0 ? `(Rp${act.cost.toLocaleString("id-ID")})` : ""}
              </div>
              {act.description && (
                <div style={{ fontSize: "11px", color: isDone ? "#adb5bd" : "#666", marginTop: "4px", lineHeight: "1.4" }}>
                  💡 {act.description}
                </div>
              )}
              {act.effects && (
                <div style={{ fontSize: "11px", color: isDone ? "#adb5bd" : "#2f9e44", fontWeight: "bold", marginTop: "4px" }}>
                  {isDone ? "Sudah dilakukan tahun ini" : `✨ ${act.effects}`}
                </div>
              )}
            </button>
          );
        })}

        {options.crimes.length > 0 && (
          <>
            <div className={styles.divider} style={{ margin: "15px 0" }} />
            <h4 style={{ marginBottom: "10px", color: "#e03131" }}>Aktivitas Berisiko</h4>
            {options.crimes.map((crime) => (
              <button
                key={crime.id}
                onClick={() => actions.doCrime(crime.id)}
                style={{ textAlign: "left", padding: "12px", marginBottom: "8px", borderLeft: "4px solid #e03131" }}
              >
                <div style={{ fontWeight: "bold" }}>⚠️ {crime.name}</div>
                <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>Hati-hati, aksi ini bisa membuatmu berurusan dengan polisi.</div>
              </button>
            ))}
          </>
        )}
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
          <button key={tr.id} onClick={() => actions.treatment(tr.id)} disabled={tr.disabled}>
            👨‍⚕️ {tr.name} (Rp{tr.cost.toLocaleString("id-ID")})
            <div style={{ fontSize: "11px", color: "#2f9e44", fontWeight: "bold", marginTop: "2px" }}>
              +{tr.effect.health} Health {tr.canCure ? "• Bisa Sembuh" : "• Meredakan Gejala"}
            </div>
            <span style={{ fontSize: "10px", display: "block", color: "#666" }}>
              {tr.isFreeWithBPJS ? "✅ Gratis BPJS" :
                tr.isCoveredByParents ? "👨‍👩‍👦 Ditanggung Ortu" :
                  "💰 Bayar Mandiri"}
            </span>
          </button>
        ))}
      </div>
      <button onClick={onBack} className={styles.secondaryButton} style={{ marginTop: "10px" }}>Kembali</button>
    </div>
  );
}

function JobsTab({ state, options, actions, onBack }) {
  const currentJob = options.jobs.find(j => j.id === state.career.jobId);
  const currentEdu = educationCatalog.find(e => e.id === state.education.level);

  return (
    <div className={styles.tabPane}>
      <h3>Karir & Pendidikan</h3>

      {/* Education Section */}
      <div className={styles.itemCard} style={{ borderLeft: "4px solid #4dabf7", marginBottom: "15px" }}>
        <h4>Pendidikan Saat Ini</h4>
        {state.education.level !== "none" ? (
          <p>Sedang menempuh: <strong>{currentEdu?.name || (state.education.level === "university" ? "Universitas" : state.education.level)}</strong> (Tahun {state.education.yearsStudied}/{currentEdu?.yearsToComplete || 4})</p>
        ) : (
          <p>Tidak sedang menempuh pendidikan.</p>
        )}

        {state.education.completed.length > 0 && (
          <p style={{ fontSize: "12px", color: "#666" }}>
            Gelar/Lulus: {state.education.completed.map(id => educationCatalog.find(e => e.id === id)?.name).join(", ")}
          </p>
        )}
      </div>

      <div className={styles.divider} />

      {/* Career Section */}
      <h4>Pekerjaan</h4>
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

      <h4>Daftar Universitas / Kursus</h4>
      <div className={styles.optionsList}>
        {options.education.filter(e => e.minAge >= 18 || e.id === "ged").map((edu) => (
          <button key={edu.id} onClick={() => actions.study(edu.id)} disabled={state.money < edu.costPerYear}>
            Daftar: {edu.name} (Rp{edu.costPerYear.toLocaleString("id-ID")}/thn)
          </button>
        ))}
      </div>
      <button onClick={onBack} className={styles.secondaryButton} style={{ marginTop: "10px" }}>Kembali</button>
    </div>
  );
}

function FinanceTab({ state, actions, onBack }) {
  const lifestyle = state.financial?.lifestyle || "normal";

  return (
    <div className={styles.tabPane}>
      <h3>Keuangan & Gaya Hidup</h3>
      <div className={styles.itemCard} style={{ background: "#f8f9fa", padding: "10px", borderRadius: "5px", marginBottom: "10px", color: "#333" }}>
        <p>Gaya Hidup Saat Ini: <strong>{lifestyle.toUpperCase()}</strong></p>
        <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
          {lifestyle === "hemat" && "Hemat: Tabung 80%, Hidup pas-pasan (Kebahagiaan -2/thn)."}
          {lifestyle === "normal" && "Normal: Tabung 50%, Hidup cukup (Kebahagiaan stabil)."}
          {lifestyle === "mewah" && "Mewah: Tabung 10%, Hidup foya-foya (Kebahagiaan +3/thn)."}
        </p>
      </div>

      {!state.profile?.isIndependent ? (
        <div className={styles.itemCard} style={{ background: "#e7f5ff", borderLeft: "4px solid #228be6", padding: "10px", marginBottom: "10px", color: "#333" }}>
          <h4>Ekonomi Keluarga</h4>
          <p>Status: <strong>{state.family.wealthStatus.toUpperCase()}</strong></p>
          <p>Tabungan Keluarga: <strong>Rp{state.family.savings.toLocaleString("id-ID")}</strong></p>
          <p>Gaji Orang Tua: <strong>Rp{state.family.monthlyIncome.toLocaleString("id-ID")}/bln</strong></p>
          <div style={{ marginTop: "10px", borderTop: "1px solid #dee2e6", paddingTop: "10px" }}>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#495057", marginBottom: "5px" }}>Beasiswa Aktif:</div>
            {state.family.activeScholarships && state.family.activeScholarships.length > 0 ? (
              state.family.activeScholarships.map(s => (
                <div key={s.id} style={{ background: "#fff", padding: "8px", borderRadius: "4px", marginBottom: "5px", border: "1px solid #ced4da", fontSize: "11px" }}>
                  <div style={{ fontWeight: "bold", color: "#2f9e44" }}>🎓 {s.name}</div>
                  <div style={{ color: "#868e96" }}>Sisa: {s.yearsLeft} tahun</div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: "11px", color: "#adb5bd" }}>Tidak ada beasiswa aktif.</div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.itemCard} style={{ background: "#ebfbee", borderLeft: "4px solid #40c057", padding: "10px", marginBottom: "10px", color: "#333" }}>
          <h4>Ekonomi Pribadi</h4>
          <p>Status: <strong>MANDIRI</strong></p>
          <p>Uang Tersedia: <strong>Rp{state.money.toLocaleString("id-ID")}</strong></p>
          <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>Kamu sekarang bertanggung jawab penuh atas biaya kos, makan, dan pajak pribadimu.</p>
        </div>
      )}
      <div className={styles.optionsList}>
        <button
          onClick={() => actions.changeLifestyle("hemat")}
          style={{ background: lifestyle === "hemat" ? "#e9ecef" : "#fff", fontWeight: lifestyle === "hemat" ? "bold" : "normal", textAlign: "left", padding: "12px" }}
        >
          <div>{lifestyle === "hemat" ? "✓ " : ""}Gaya Hidup: <strong>HEMAT</strong></div>
          <div style={{ fontSize: "11px", color: "#2b8a3e", marginTop: "4px" }}>📉 Biaya Hidup -20% | 📉 Kebahagiaan -4/thn</div>
        </button>

        <button
          onClick={() => actions.changeLifestyle("normal")}
          style={{ background: lifestyle === "normal" ? "#e9ecef" : "#fff", fontWeight: lifestyle === "normal" ? "bold" : "normal", textAlign: "left", padding: "12px" }}
        >
          <div>{lifestyle === "normal" ? "✓ " : ""}Gaya Hidup: <strong>NORMAL</strong></div>
          <div style={{ fontSize: "11px", color: "#495057", marginTop: "4px" }}>⚖️ Biaya Standar | ⚖️ Kebahagiaan Stabil</div>
        </button>

        <button
          onClick={() => actions.changeLifestyle("mewah")}
          style={{ background: lifestyle === "mewah" ? "#e9ecef" : "#fff", fontWeight: lifestyle === "mewah" ? "bold" : "normal", textAlign: "left", padding: "12px" }}
        >
          <div>{lifestyle === "mewah" ? "✓ " : ""}Gaya Hidup: <strong>MEWAH</strong></div>
          <div style={{ fontSize: "11px", color: "#e03131", marginTop: "4px" }}>📈 Biaya Hidup +60% | 📈 Kebahagiaan +8/thn</div>
        </button>
      </div>
      <button onClick={onBack} className={styles.secondaryButton} style={{ marginTop: "15px" }}>Kembali</button>
    </div>
  );
}
