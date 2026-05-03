"use client";

import { useLayeredGame } from "./useLayeredGame";
import styles from "./layeredGame.module.css";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { educationCatalog } from "@/layers/infrastructure/catalogs/educationCatalog";
import { jobsCatalog } from "@/layers/infrastructure/catalogs/jobsCatalog";

export default function LayeredGameView() {
  const { state, options, actions, promotionInfo, ready } = useLayeredGame();
  const [activeTab, setActiveTab] = useState("journal");
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);
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
            actions.resolveChoice(notif.eventId, choiceId, notif.payload);
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
        {activeTab === "education" && <EducationTab state={state} options={options} actions={actions} onBack={() => setActiveTab("journal")} />}
        {activeTab === "jobs" && (
          selectedJobDetail ? (
            <JobDetailView job={selectedJobDetail} onBack={() => setSelectedJobDetail(null)} />
          ) : (
            <CareerTab
              state={state}
              options={options}
              actions={actions}
              promotionInfo={promotionInfo}
              onViewDetail={(job) => setSelectedJobDetail(job)}
              onBack={() => setActiveTab("journal")}
            />
          )
        )}
        {activeTab === "health" && <HealthTab state={state} options={options} actions={actions} onBack={() => setActiveTab("journal")} />}
        {activeTab === "finance" && <FinanceTab state={state} actions={actions} onBack={() => setActiveTab("journal")} />}
        {activeTab === "identity" && <IdentityTab state={state} onBack={() => setActiveTab("journal")} />}



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
              return (
                <div className={styles.navGrid}>
                  <button
                    className={styles.navButton2}
                    onClick={() => setActiveTab("education")}
                    disabled={state.age < 6}
                  >
                    <i className="fa-solid fa-school"></i> Sekolah
                  </button>

                  <button
                    className={styles.navButton2}
                    onClick={() => setActiveTab("jobs")}
                    disabled={state.age < 15}
                  >
                    <i className="fa-solid fa-briefcase"></i> Karir
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

                  <button
                    className={styles.navButton1}
                    onClick={() => setActiveTab("identity")}
                    style={{ backgroundColor: "#f8f9fa", color: "#495057", border: "1px solid #ced4da" }}
                  >
                    <i className="fa-solid fa-id-card"></i> Identitas
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
                    onClick={() => {
                      actions.handleEventChoice(opt.id);
                      setActiveTab("journal");
                    }}
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
    { id: "ask_out", name: "❤️ Pacaran", desc: "Ajak pacaran.", effect: "Status: Pacar", oppositeOnly: true, minAge: 12, hideIfPartner: true, nonFamilyOnly: true },
    { id: "propose", name: "💍 Lamar", desc: "Ajak menikah (Rp50jt).", effect: "Status: Pasangan", partnerOnly: true, nonFamilyOnly: true },
    { id: "toggle_kb", name: "🍼 Program KB", desc: "Tunda/Atur anak.", effect: "Peluang Anak: 0%", spouseOnly: true }
  ];

  const handleAction = (rel, action) => {
    if (action.id === "give_money") {
      const uang = state.money;
      if (uang <= 0) {
        Swal.fire("Info", "Kamu tidak punya uang untuk diberikan.", "info");
        return;
      }

      let stepR = 1000;
      if (uang > 100_000_000) stepR = 1_000_000;
      else if (uang > 10_000_000) stepR = 100_000;
      else if (uang > 1_000_000) stepR = 10_000;

      const maxR = uang;

      import("sweetalert2").then((Swal) => {
        const swal = Swal.default;
        swal.fire({
          title: `Beri uang ke ${rel.name}`,
          icon: "question",
          html: `
            <div style="margin-bottom: 10px; font-weight: bold; color: #2f9e44;">
              Maksimal: Rp${uang.toLocaleString("id-ID")}
            </div>
            <div style="font-size: 12px; color: #666;">Tentukan jumlah yang ingin diberikan:</div>
          `,
          input: "range",
          inputAttributes: {
            min: 0,
            max: maxR,
            step: stepR
          },
          inputValue: Math.floor(uang * 0.05),
          didOpen: () => {
            const input = swal.getInput();
            const parent = input.parentNode;

            // Container utama harus bersih
            parent.style.display = 'flex';
            parent.style.flexDirection = 'column';
            parent.style.alignItems = 'center';
            parent.style.justifyContent = 'center';
            parent.style.width = '100%';
            parent.style.margin = '0';
            parent.style.padding = '0';

            // Slider (Input)
            input.style.width = 'calc(100% - 20px)';
            input.style.margin = '20px 0';

            // Sembunyikan output bawaan
            const defaultOutput = parent.querySelector('output');
            if (defaultOutput) defaultOutput.style.display = 'none';

            // Box angka Rupiah yang proporsional
            const output = document.createElement('div');
            output.id = 'custom-range-value';
            output.style.fontWeight = 'bold';
            output.style.fontSize = '22px';
            output.style.color = '#228be6';
            output.style.textAlign = 'center';
            output.style.padding = '12px';
            output.style.background = '#f8f9fa';
            output.style.borderRadius = '8px';
            output.style.border = '1px solid #e9ecef';
            output.style.width = 'calc(100% - 20px)';
            output.style.boxSizing = 'border-box';

            output.innerText = `Rp${Number(input.value).toLocaleString("id-ID")}`;
            parent.appendChild(output);

            input.addEventListener('input', () => {
              output.innerText = `Rp${Number(input.value).toLocaleString("id-ID")}`;
            });
          }
        }).then((result) => {
          if (result.isConfirmed && result.value) {
            const finalAmount = Number(result.value);
            if (finalAmount > 0) {
              actions.interact(rel.id, action.id, finalAmount);
            }
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
    spouse: "Pasangan 💍",
    grandchild: "Cucu 👶"
  };

  return (
    <div className={styles.tabPane}>
      <h3>Hubungan & Sosial</h3>
      <div className={styles.optionsList}>
        {(() => {
          const family = state.relations.filter(r => r.status === "family" || r.status === "spouse" || r.status === "partner" || r.id === "mother" || r.id === "father");
          const others = state.relations.filter(r => !family.find(f => f.id === r.id));

          const renderCard = (rel) => {
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
                <div className={styles.itemHeader}>
                  <div className={styles.itemTitle}>
                    {rel.name} {currentGender === "male" ? "♂️" : currentGender === "female" ? "♀️" : ""}
                    {isDead && <span style={{ color: "#fa5252", fontSize: "10px", marginLeft: "5px" }}>(Wafat)</span>}
                  </div>
                  {!isDead && <div className={styles.itemValue}></div>}
                </div>
                <div className={styles.itemSubtitle}>
                  {rel.label} • {statusLabels[rel.status] || rel.status} •
                  {rel.livingStatus === "stay_home" && "🏠 Tinggal Bersama • "}
                  {rel.livingStatus === "moved_out" && "✈️ Merantau • "}
                  {rel.education ? `${rel.education} • ` : " "}
                  {rel.age} Th
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
                        if (action.nonFamilyOnly && rel.status === "family") return null;
                        if (action.oppositeOnly && !isOppositeGender) return null;
                        if (action.minAge && state.age < action.minAge) return null;
                        if (action.partnerOnly && rel.status !== "partner") return null;
                        if (action.spouseOnly && rel.status !== "spouse") return null;
                        if (action.hideIfPartner && (rel.status === "partner" || rel.status === "spouse")) return null;

                        const isDisabled = isInteracted && action.id !== "ask_out" && action.id !== "propose" && action.id !== "give_money" && action.id !== "toggle_kb";

                        let actionName = action.name;
                        let actionEffect = action.effect;
                        let btnStyle = { textAlign: "left", padding: "8px", height: "auto", display: "flex", flexDirection: "column" };

                        if (action.id === "toggle_kb") {
                          const isKB = state.family.isKB;
                          actionName = isKB ? "✅ KB: AKTIF" : "🍼 Ikut KB?";
                          actionEffect = isKB ? "Peluang Anak: 0%" : "Peluang Anak: 20%";
                          if (isKB) btnStyle.background = "#e7f5ff";
                        }

                        return (
                          <button
                            key={action.id}
                            disabled={isDisabled}
                            onClick={() => handleAction(rel, action)}
                            style={btnStyle}
                          >
                            <span style={{ fontWeight: "bold", fontSize: "12px" }}>{actionName}</span>
                            <span style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>{action.desc}</span>
                            <span style={{ fontSize: "9px", color: "#228be6", fontWeight: "bold" }}>{actionEffect}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          };

          return (
            <>
              {family.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: "#228be6", marginBottom: "10px", paddingBottom: "5px", borderBottom: "2px solid #e7f5ff", display: "flex", alignItems: "center", gap: "5px" }}>
                    <span>👨‍👩‍👧‍👦</span> Keluarga
                  </div>
                  {family.map(renderCard)}
                </div>
              )}
              {others.length > 0 && (
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: "#868e96", marginBottom: "10px", paddingBottom: "5px", borderBottom: "2px solid #f1f3f5", display: "flex", alignItems: "center", gap: "5px" }}>
                    <span>👥</span> Teman & Lainnya
                  </div>
                  {others.map(renderCard)}
                </div>
              )}
            </>
          );
        })()}
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
              disabled={isDone || act.disabled || (act.cost && state.money < act.cost)}
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
                <div style={{ fontSize: "11px", color: isDone ? "#adb5bd" : (act.disabled ? "#e03131" : "#2f9e44"), fontWeight: "bold", marginTop: "4px" }}>
                  {isDone ? "Sudah dilakukan tahun ini" : (act.disabled ? `🚫 ${act.disabledReason}` : `✨ ${act.effects}`)}
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

function EducationTab({ state, options, actions, onBack }) {
  const currentEdu = educationCatalog.find(e => e.id === state.education.level);

  return (
    <div className={styles.tabPane}>
      <h3>Pendidikan</h3>

      <div className={styles.itemCard} style={{ borderLeft: "4px solid #4dabf7", marginBottom: "15px" }}>
        <h4>Status Pendidikan Saat Ini</h4>
        {state.education.level !== "none" ? (
          <p>Sedang menempuh: <strong>{(() => {
            const edu = educationCatalog.find(e => e.id === state.education.level);
            if (edu?.level === "university" || state.education.level.startsWith("university_")) return "S1";
            if (state.education.level === "sma" || state.education.level === "smk") return state.education.level.toUpperCase();
            return edu?.name || state.education.level;
          })()}</strong> {(() => {
            const edu = educationCatalog.find(e => e.id === state.education.level);
            const yrs = state.education.yearsStudied + 1;
            const group = state.education.classGroup || "";
            if (state.education.level === "elementary") return `(Kelas ${yrs}${group})`;
            if (state.education.level === "junior_high") return `(Kelas ${yrs + 6}${group})`;
            if (state.education.level === "sma" || state.education.level === "smk") return `(Kelas ${yrs + 9})`;
            return `(Tahun ${yrs}/${edu?.yearsToComplete || 4})`;
          })()}</p>
        ) : (
          <p>Tidak sedang menempuh pendidikan.</p>
        )}

        {state.education.completed.length > 0 && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#495057" }}>Riwayat Kelulusan:</div>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "5px" }}>
              {state.education.completed.map((id, index) => (
                <span key={`${id}-${index}`} style={{ fontSize: "10px", background: "#e7f5ff", color: "#228be6", padding: "2px 8px", borderRadius: "10px", border: "1px solid #a5d8ff" }}>
                  {(() => {
                    const edu = educationCatalog.find(e => e.id === id);
                    if (edu?.level === "university") return "S1";
                    if (id === "sma" || id === "smk") return id.toUpperCase();
                    if (id === "high_school") return "SMA";
                    return edu?.name || id;
                  })()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Status Beasiswa Aktif */}
        {((state.family.activeScholarships && state.family.activeScholarships.length > 0) || state.family.isScholarshipActive) && (
          <div style={{ marginTop: "15px", padding: "10px", background: "#f1f3f5", borderRadius: "8px", border: "1px dashed #adb5bd" }}>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#2f9e44", marginBottom: "5px" }}>🎓 Beasiswa Aktif:</div>
            {state.family.activeScholarships && state.family.activeScholarships.length > 0 ? (
              state.family.activeScholarships.map((sch, idx) => (
                <div key={idx} style={{ fontSize: "11px", color: "#495057", marginBottom: "3px" }}>
                  • <strong>{sch.name}</strong> ({sch.coverage === "full" || sch.coverage === 1 ? "Full Coverage" : (sch.amount ? `${sch.amount}%` : "Partial")})
                  <div style={{ fontSize: "10px", color: "#868e96", marginLeft: "10px" }}>Berlaku: {sch.yearsLeft || 0} tahun lagi</div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: "11px", color: "#495057" }}>• Beasiswa Pendidikan (Full Coverage)</div>
            )}
          </div>
        )}

        {state.education.level !== "none" && (
          <button
            onClick={() => {
              Swal.fire({
                title: 'Berhenti Sekolah?',
                text: "Kamu akan kehilangan progres tahun akademik saat ini.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Berhenti',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#e03131',
              }).then((result) => {
                if (result.isConfirmed) {
                  actions.dropOut();
                }
              });
            }}
            style={{
              marginTop: "15px",
              padding: "8px 12px",
              fontSize: "12px",
              background: "#fff5f5",
              color: "#e03131",
              border: "1px solid #ffa8a8",
              borderRadius: "5px",
              cursor: "pointer",
              width: "100%",
              fontWeight: "600"
            }}
          >
            ❌ Berhenti Sekolah / Putus Kuliah
          </button>
        )}
      </div>

      <div className={styles.divider} />

      <h4>Daftar Sekolah / Kursus Tersedia</h4>
      <div className={styles.optionsList}>
        {options.education.length > 0 ? (
          options.education.map((edu) => (
            <button
              key={edu.id}
              onClick={() => actions.study(edu.id)}
              disabled={state.money < edu.costPerYear}
              style={{ textAlign: "left", padding: "12px" }}
            >
              <div style={{ fontWeight: "bold" }}>{edu.name}</div>
              <div style={{ fontSize: "11px", color: "#666" }}>Durasi: {edu.yearsToComplete} Tahun</div>
              <div style={{ fontSize: "12px", color: state.money < edu.costPerYear ? "#e03131" : "#2f9e44", fontWeight: "bold", marginTop: "4px" }}>
                Biaya: {edu.costPerYear === 0 ? "GRATIS" : `Rp${edu.costPerYear.toLocaleString("id-ID")}/thn`}
              </div>
            </button>
          ))
        ) : (
          <p style={{ fontSize: "12px", color: "#adb5bd", fontStyle: "italic" }}>Tidak ada program pendidikan yang tersedia saat ini.</p>
        )}
      </div>
      <button onClick={onBack} className={styles.secondaryButton} style={{ marginTop: "15px" }}>Kembali</button>
    </div>
  );
}

function JobDetailView({ job, onBack }) {
  // Helper to trace the roadmap
  const roadmap = [];
  let curr = job;
  // Trace backwards to find the start of the track
  const allJobs = jobsCatalog;
  let startNode = job;
  let foundPrev = true;
  while (foundPrev) {
    const prev = allJobs.find(j => j.nextJobId === startNode.id);
    if (prev) startNode = prev;
    else foundPrev = false;
  }

  // Trace forwards to build the roadmap
  let trace = startNode;
  while (trace) {
    roadmap.push(trace);
    if (trace.nextJobId) {
      trace = allJobs.find(j => j.id === trace.nextJobId);
    } else {
      trace = null;
    }
  }

  return (
    <div className={styles.tabPane}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
        <button onClick={onBack} className={styles.backIconButton}><i className="fa fa-arrow-left"></i></button>
        <h3 style={{ margin: 0 }}>Detail Pekerjaan</h3>
      </div>

      <div className={styles.itemCard} style={{ borderLeft: "4px solid #228be6" }}>
        <h2 style={{ margin: "0 0 5px 0", color: "#1864ab" }}>{job.name}</h2>
        <div style={{ fontSize: "14px", color: "#2f9e44", fontWeight: "bold" }}>Gaji Dasar: Rp{job.salaryPerYear.toLocaleString("id-ID")}/thn</div>
        <p style={{ fontSize: "12px", color: "#666", marginTop: "10px", lineHeight: "1.5" }}>
          Pekerjaan ini berada di jalur <strong>{job.track.toUpperCase()}</strong>.
          {job.maxWealthStatus && ` Batas kekayaan untuk melamar: ${job.maxWealthStatus.toUpperCase()}.`}
        </p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4 style={{ marginBottom: "10px" }}>Syarat Kualifikasi:</h4>
        <div className={styles.statsCard} style={{ background: "#f8f9fa", padding: "12px" }}>
          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "#495057" }}>
            <li>Umur Minimal: {job.minAge} Tahun</li>
            <li>Kecerdasan Minimal: {job.minSmarts}</li>
            {job.requiredMajor && <li>Wajib Lulusan: {job.requiredMajor.toUpperCase()}</li>}
            {job.cleanRecordRequired && <li>Wajib Catatan Kriminal Bersih</li>}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <h4 style={{ marginBottom: "10px" }}>Roadmap Karir:</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {roadmap.map((r, idx) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%",
                background: r.id === job.id ? "#228be6" : "#e9ecef",
                color: r.id === job.id ? "#fff" : "#adb5bd",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "bold", border: "2px solid",
                borderColor: r.id === job.id ? "#1864ab" : "#dee2e6"
              }}>
                {idx + 1}
              </div>
              <div style={{
                flex: 1, padding: "10px", borderRadius: "8px",
                background: r.id === job.id ? "#e7f5ff" : "#fff",
                border: "1px solid",
                borderColor: r.id === job.id ? "#a5d8ff" : "#e9ecef"
              }}>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: r.id === job.id ? "#1864ab" : "#495057" }}>
                  {r.name} {r.id === job.id ? "(Sekarang)" : ""}
                </div>
                <div style={{ fontSize: "11px", color: "#868e96" }}>Gaji: Rp{r.salaryPerYear.toLocaleString("id-ID")}/thn</div>
              </div>
              {idx < roadmap.length - 1 && <div style={{ height: "10px" }} />}
            </div>
          ))}
        </div>
      </div>

      <button onClick={onBack} className={styles.primaryButton}>Kembali ke Daftar</button>
    </div>
  );
}

function CareerTab({ state, options, actions, promotionInfo, onViewDetail, onBack }) {
  const currentJob = jobsCatalog.find(j => j.id === state.career.jobId);

  return (
    <div className={styles.tabPane}>
      <h3>Karir & Pekerjaan</h3>

      <div className={styles.itemCard} style={{ borderLeft: "4px solid #fcc419", marginBottom: "15px" }}>
        <h4>{state.career.isRetired ? "Status Pensiun" : "Pekerjaan Saat Ini"}</h4>
        {state.career.isRetired ? (
          <div className={styles.currentJobCard}>
            <div style={{ fontWeight: "bold", fontSize: "16px", color: "#1864ab" }}>👴 Pensiunan</div>
            <div style={{ fontSize: "13px", color: "#2f9e44", fontWeight: "bold", marginTop: "5px" }}>
              Uang Pensiun: Rp{state.career.pensionAmount.toLocaleString("id-ID")}/thn
            </div>
            <p style={{ fontSize: "11px", color: "#666", marginTop: "10px" }}>
              Kamu telah menyelesaikan masa baktimu. Nikmati hari tuamu dengan tenang!
            </p>
          </div>
        ) : state.career.jobId ? (
          <div className={styles.currentJobCard}>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>{currentJob?.name || state.career.jobId}</div>
            <div style={{ fontSize: "12px", color: "#2f9e44", fontWeight: "bold" }}>Gaji: Rp{currentJob?.salaryPerYear.toLocaleString("id-ID")}/thn</div>
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "10px" }}>Masa kerja: {state.career.yearsInRole} tahun</div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => actions.promote()} className={styles.primaryButton} style={{ flex: 1 }}>Cek Promosi</button>
              <button onClick={() => actions.resignJob()} className={styles.secondaryButton} style={{ flex: 1, backgroundColor: "#fff5f5", color: "#fa5252", borderColor: "#ffa8a8" }}>Resign</button>

              {state.age >= 55 && (
                <button
                  onClick={() => {
                    Swal.fire({
                      title: 'Pensiun Dini?',
                      text: "Kamu akan berhenti bekerja dan menerima uang pesangon serta gaji pensiun bulanan.",
                      icon: 'question',
                      showCancelButton: true,
                      confirmButtonText: 'Ya, Pensiun!',
                      cancelButtonText: 'Batal'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        actions.retireEarly();
                      }
                    });
                  }}
                  className={styles.secondaryButton}
                  style={{ flex: "1 0 100%", marginTop: "5px", backgroundColor: "#e7f5ff", color: "#228be6", borderColor: "#a5d8ff" }}
                >
                  👴 Pensiun Dini
                </button>
              )}
            </div>

            {promotionInfo && !promotionInfo.canPromote && (
              <div style={{ marginTop: "12px", padding: "8px", background: "#fff9db", borderRadius: "4px", border: "1px solid #ffe066" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#856404", marginBottom: "4px" }}>
                  🎯 Syarat Naik Jabatan ke: {promotionInfo.nextJobName}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {promotionInfo.requirements.map(req => (
                    <div key={req.id} style={{ fontSize: "10px", color: req.met ? "#2f9e44" : "#e03131", display: "flex", alignItems: "center", gap: "4px" }}>
                      {req.met ? "✅" : "❌"} {req.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {promotionInfo && promotionInfo.canPromote && (
              <div style={{ marginTop: "12px", padding: "8px", background: "#e7f5ff", borderRadius: "4px", border: "1px solid #a5d8ff", fontSize: "11px", color: "#1864ab", fontWeight: "bold" }}>
                ✨ Kamu sudah layak untuk promosi! Klik tombol di atas.
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontSize: "14px", color: "#868e96" }}>Belum memiliki pekerjaan.</p>
        )}
      </div>

      <div className={styles.divider} />

      <h4>Lowongan Kerja</h4>
      <div className={styles.optionsList}>
        {options.jobs.length > 0 ? (
          options.jobs.map((job) => {
            const isCurrent = state.career.jobId === job.id;
            if (isCurrent) return null; // Don't show current job in vacancies

            return (
              <div
                key={job.id}
                className={styles.jobItemCard}
                style={{
                  textAlign: "left", padding: "12px", marginBottom: "10px",
                  background: "#fff", borderRadius: "8px", border: "1px solid #e9ecef",
                  opacity: state.career.jobId ? 0.6 : 1
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, cursor: state.career.jobId ? "not-allowed" : "pointer" }} onClick={() => !state.career.jobId && actions.applyJob(job.id)}>
                    <div style={{ fontWeight: "bold" }}>{job.name}</div>
                    <div style={{ fontSize: "12px", color: "#2f9e44", fontWeight: "bold", marginTop: "2px" }}>
                      Gaji: Rp{job.salaryPerYear.toLocaleString("id-ID")}/thn
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
                    <span style={{ fontSize: "10px", background: job.type === "part-time" ? "#e7f5ff" : "#f8f9fa", padding: "2px 6px", borderRadius: "4px" }}>
                      {job.type === "part-time" ? "Part-time" : "Full-time"}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewDetail(job); }}
                      style={{
                        padding: "4px 8px", fontSize: "10px", background: "#f1f3f5",
                        border: "1px solid #dee2e6", borderRadius: "4px", color: "#495057",
                        width: "auto", minWidth: "30px", cursor: "pointer"
                      }}
                    >
                      <i className="fa fa-info-circle"></i> Info
                    </button>
                  </div>
                </div>
                {state.career.jobId && (
                  <div style={{ fontSize: "10px", color: "#fa5252", marginTop: "4px" }}>Resign dulu untuk melamar</div>
                )}
              </div>
            );
          })
        ) : (
          <p style={{ fontSize: "12px", color: "#adb5bd", fontStyle: "italic" }}>
            {state.age < 14 ? "Kamu masih terlalu muda untuk bekerja." : "Tidak ada lowongan kerja yang sesuai kualifikasimu saat ini."}
          </p>
        )}
      </div>
      <button onClick={onBack} className={styles.secondaryButton} style={{ marginTop: "15px" }}>Kembali</button>
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

      {/* Section: Family Economy (Show if living with parents OR underage) */}
      {(state.profile?.livingWithParents || (state.age < 18 && !state.profile?.isIndependent)) && (
        <div className={styles.itemCard} style={{ background: "#e7f5ff", borderLeft: "4px solid #228be6", padding: "10px", marginBottom: "10px", color: "#333" }}>
          <h4>Ekonomi Keluarga</h4>
          <p>Status: <strong>{state.family.wealthStatus.toUpperCase()}</strong></p>
          <p>Tabungan Keluarga: <strong>Rp{state.family.savings.toLocaleString("id-ID")}</strong></p>
          {state.family.monthlyIncome > 0 && <p>Gaji Orang Tua: <strong>Rp{state.family.monthlyIncome.toLocaleString("id-ID")}/bln</strong></p>}

          <div style={{ marginTop: "10px", borderTop: "1px solid #dee2e6", paddingTop: "10px" }}>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#495057", marginBottom: "5px" }}>Beasiswa/Subsidi Aktif:</div>
            {state.family.activeScholarships && state.family.activeScholarships.length > 0 ? (
              state.family.activeScholarships.map(s => (
                <div key={s.id} style={{ background: "#fff", padding: "8px", borderRadius: "4px", marginBottom: "5px", border: "1px solid #ced4da", fontSize: "11px" }}>
                  <div style={{ fontWeight: "bold", color: "#2f9e44" }}>🎓 {s.name}</div>
                  <div style={{ color: "#868e96" }}>Sisa: {s.yearsLeft} tahun</div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: "11px", color: "#adb5bd" }}>Tidak ada beasiswa/subsidi aktif.</div>
            )}
          </div>
        </div>
      )}

      {/* Section: Personal Economy (Show if independent OR in jail OR has money) */}
      {(state.profile?.isIndependent || state.legal?.inJail || state.money > 0) && (
        <div className={styles.itemCard} style={{ background: "#ebfbee", borderLeft: "4px solid #40c057", padding: "15px", marginBottom: "10px", color: "#333" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h4 style={{ margin: 0 }}>Ekonomi Pribadi</h4>
            {state.legal?.inJail ? (
              <span style={{ fontSize: "10px", background: "#fa5252", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>DI PENJARA</span>
            ) : (
              <span style={{ fontSize: "10px", background: "#40c057", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>{state.profile?.isIndependent ? "MANDIRI" : "TABUNGAN"}</span>
            )}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <div style={{ fontSize: "12px", color: "#666" }}>Uang Tersedia:</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#2b8a3e" }}>Rp{state.money.toLocaleString("id-ID")}</div>
          </div>

          {!state.legal?.inJail && (
            <div style={{ borderTop: "1px solid #d3f9d8", paddingTop: "10px" }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#2b8a3e", marginBottom: "8px" }}>Rincian Pendapatan Bulanan:</div>

              {(() => {
                const currentJob = jobsCatalog.find(j => j.id === state.career.jobId);
                const playerMonthly = currentJob ? Math.floor(currentJob.salaryPerYear / 12) : 0;

                const spouse = state.relations.find(r => r.status === "spouse" && !r.isDead);
                let spouseMonthly = 0;
                if (spouse) {
                  const spouseYearly = lifestyle === "mewah" ? 150_000_000 : 45_000_000;
                  spouseMonthly = Math.floor(spouseYearly / 12);
                }

                if (playerMonthly === 0 && spouseMonthly === 0) {
                  return <div style={{ fontSize: "11px", color: "#fa5252", fontStyle: "italic" }}>Tidak ada pendapatan rutin saat ini.</div>;
                }

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {playerMonthly > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                        <span>Gaji Kamu ({currentJob?.name}):</span>
                        <strong>Rp{playerMonthly.toLocaleString("id-ID")}</strong>
                      </div>
                    )}
                    {spouseMonthly > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                        <span>Gaji Pasangan ({spouse?.name}):</span>
                        <strong>Rp{spouseMonthly.toLocaleString("id-ID")}</strong>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginTop: "5px", paddingTop: "5px", borderTop: "1px dashed #b2f2bb", fontWeight: "bold" }}>
                      <span>Total Pendapatan:</span>
                      <span>Rp{(playerMonthly + spouseMonthly).toLocaleString("id-ID")}/bln</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div style={{ fontSize: "11px", color: "#666", marginTop: "12px", fontStyle: "italic" }}>
            {state.legal?.inJail ? "Selama di penjara, kamu tidak bisa bekerja atau menerima pendapatan rutin." : "Kamu bertanggung jawab penuh atas biaya hidup dan kebutuhan pribadimu."}
          </div>
        </div>
      )}
      <div className={styles.optionsList}>
        <button
          onClick={() => actions.changeLifestyle("hemat")}
          style={{ background: lifestyle === "hemat" ? "#e9ecef" : "#fff", fontWeight: lifestyle === "hemat" ? "bold" : "normal", textAlign: "left", padding: "12px" }}
        >
          <div>{lifestyle === "hemat" ? "✓ " : ""}Gaya Hidup: <strong>HEMAT</strong></div>
          <div style={{ fontSize: "11px", color: "#2b8a3e", marginTop: "4px" }}>📉 Biaya Hidup -20% | 📉 Kebahagiaan -2/thn</div>
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
          <div style={{ fontSize: "11px", color: "#e03131", marginTop: "4px" }}>📈 Biaya Hidup +60% | 📈 Kebahagiaan +3/thn</div>
        </button>
      </div>
      <button onClick={onBack} className={styles.secondaryButton} style={{ marginTop: "15px" }}>Kembali</button>
    </div>
  );
}
function IdentityTab({ state, onBack }) {
  const getZodiac = (day, month) => {
    const d = Number(day);
    const monthMap = { "Januari": 1, "Februari": 2, "Maret": 3, "April": 4, "Mei": 5, "Juni": 6, "Juli": 7, "Agustus": 8, "September": 9, "Oktober": 10, "November": 11, "Desember": 12 };
    const m = monthMap[month] || Number(month);

    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return "Aries";
    if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return "Taurus";
    if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return "Gemini";
    if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return "Cancer";
    if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return "Leo";
    if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return "Virgo";
    if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return "Libra";
    if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return "Scorpio";
    if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return "Sagittarius";
    if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return "Capricorn";
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return "Aquarius";
    if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) return "Pisces";
    return "";
  };

  const birthDate = state.profile.birthDate;
  const zodiac = getZodiac(birthDate.day, birthDate.month);
  const birthPlace = state.profile.birthPlace || "Rumah Sakit Umum";

  // Get current or latest education level for ID card
  const getDisplayEdu = (level) => {
    if (!level || level === "none") return null;
    const edu = educationCatalog.find(e => e.id === level);
    
    // Check for University IDs (including fallbacks)
    if (level.startsWith("university_") || level.startsWith("college_") || level === "university") {
      return "S1";
    }

    if (edu) {
      if (level === "sma") return "SMA";
      if (level === "smk") return "SMK";
      if (level === "paket_c") return "Paket C";
      if (level === "paket_b") return "Paket B";
      if (level === "elementary") return "SD";
      if (level === "junior_high") return "SMP";
      return edu.name;
    }
    
    // Fallback for legacy IDs
    if (level === "high_school") return "SMA";
    return null;
  };

  const currentLevel = state.education.level;
  const completedLevels = state.education.completed || [];
  const latestLevel = (currentLevel !== "none") 
    ? currentLevel 
    : (completedLevels.length > 0 ? completedLevels[completedLevels.length - 1] : null);

  const college_cs = getDisplayEdu(latestLevel) || "-";

  return (
    <div className={styles.tabPane}>
      <h3>Kartu Identitas (KTP)</h3>
      <div
        className={styles.itemCard}
        style={{
          background: "linear-gradient(135deg, #e7f5ff 0%, #ffffff 100%)",
          border: "2px solid #a5d8ff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          color: "#333",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", top: "-10px", right: "-10px", opacity: 0.1, fontSize: "80px" }}>
          <i className="fa-solid fa-id-card"></i>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ borderBottom: "1px solid #d0ebff", pb: "10px", marginBottom: "5px" }}>
            <label style={{ fontSize: "10px", color: "#868e96", textTransform: "uppercase", fontWeight: "bold" }}>Nama Lengkap</label>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1864ab" }}>{state.profile.name.toUpperCase()}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ fontSize: "10px", color: "#868e96", textTransform: "uppercase", fontWeight: "bold" }}>Jenis Kelamin</label>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>
                {state.profile.gender === "male" ? "Laki-laki" : "Perempuan"}
              </div>
            </div>
            <div>
              <label style={{ fontSize: "10px", color: "#868e96", textTransform: "uppercase", fontWeight: "bold" }}>Zodiak</label>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>{zodiac}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ fontSize: "10px", color: "#868e96", textTransform: "uppercase", fontWeight: "bold" }}>Tempat Lahir</label>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>{birthPlace}</div>
            </div>
            <div>
              <label style={{ fontSize: "10px", color: "#868e96", textTransform: "uppercase", fontWeight: "bold" }}>Tanggal Lahir</label>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>
                {(() => {
                  const monthMap = { "Januari": 1, "Februari": 2, "Maret": 3, "April": 4, "Mei": 5, "Juni": 6, "Juli": 7, "Agustus": 8, "September": 9, "Oktober": 10, "November": 11, "Desember": 12 };
                  const m = monthMap[birthDate.month] || birthDate.month;
                  const pad = (n) => String(n).padStart(2, '0');
                  return `${pad(birthDate.day)}-${pad(m)}-${birthDate.year}`;
                })()}
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #d0ebff", pt: "10px", marginTop: "5px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ fontSize: "10px", color: "#868e96", textTransform: "uppercase", fontWeight: "bold" }}>Pendidikan</label>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>{college_cs}</div>
            </div>
            <div>
              <label style={{ fontSize: "10px", color: "#868e96", textTransform: "uppercase", fontWeight: "bold" }}>Kewarganegaraan</label>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>WNI</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ fontSize: "10px", color: "#868e96", textTransform: "uppercase", fontWeight: "bold" }}>Domisili</label>
              <div style={{ fontSize: "14px", fontWeight: "600", color: state.legal?.inJail ? "#fa5252" : "#1864ab" }}>
                {state.legal?.inJail
                  ? "Lapas"
                  : state.profile?.livingWithParents
                    ? "Rumah Ortu"
                    : "Mandiri/Kos"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "20px", fontSize: "11px", color: "#868e96", fontStyle: "italic", textAlign: "center" }}>
        "Identitas ini berlaku seumur hidup selama karakter masih bernapas."
      </div>

      <button onClick={onBack} className={styles.secondaryButton} style={{ marginTop: "15px" }}>Kembali</button>
    </div>
  );
}
