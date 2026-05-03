import { cloneState, pushLog, pushNotification } from "@/layers/domain/entities/stateUtils";

/**
 * Handles voluntary or forced drop out from education.
 * @param {Object} state Current game state
 * @param {String} reason Reason for dropping out (voluntary, financial, expelled)
 * @returns {Object} Updated state
 */
export function dropOutAction(state, reason = "voluntary") {
  const next = cloneState(state);

  if (next.education.level === "none") {
    return next;
  }

  const levelName = (next.education.level === "university" || next.education.level.startsWith("university_")) ? "Universitas" : 
                    (next.education.level === "sma" || next.education.level === "smk") ? (next.education.level === "sma" ? "SMA" : "SMK") :
                    next.education.level === "junior_high" ? "SMP" : "SD";

  const schoolName = next.education.schoolName || levelName;

  // Clear education status
  next.education.level = "none";
  next.education.yearsStudied = 0;
  next.education.schoolName = "";

  // Revoke scholarships if any
  if (next.family.activeScholarships && next.family.activeScholarships.length > 0) {
    next.family.activeScholarships = [];
    pushLog(next, "Semua beasiswa aktifmu telah dicabut.");
  }

  // Messages based on reason
  if (reason === "voluntary") {
    pushLog(next, `Kamu memutuskan untuk berhenti sekolah dari ${schoolName}.`);
    pushNotification(next, { 
      title: "Putus Sekolah", 
      message: `Kamu telah resmi berhenti dari ${schoolName}.`, 
      icon: "info" 
    });
  } else if (reason === "financial") {
    pushLog(next, `KRISIS KEUANGAN: Kamu terpaksa putus sekolah dari ${schoolName} karena tidak mampu membayar biaya pendidikan.`);
    pushNotification(next, { 
      title: "Putus Sekolah", 
      message: `Kamu dikeluarkan dari ${schoolName} karena masalah biaya.`, 
      icon: "error" 
    });
  } else if (reason === "expelled") {
    pushLog(next, `Kamu dikeluarkan (DO) dari ${schoolName} karena pelanggaran berat.`);
    pushNotification(next, { 
      title: "Dikeluarkan", 
      message: `Kamu telah di-DO dari ${schoolName}.`, 
      icon: "error" 
    });
  }

  return next;
}
