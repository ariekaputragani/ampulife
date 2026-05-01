import { cloneState, pushLog } from "@/layers/domain/entities/stateUtils";

export function resolveChoice(state, eventId, choiceId) {
  const next = cloneState(state);

  if (eventId === "graduation_sma") {
    if (choiceId === "college") {
      if (next.family.savings < 50_000_000) {
        next.profile.isIndependent = true;
        next.stats.happy -= 10;
        pushLog(next, "Orang tua Saya tidak memiliki cukup tabungan untuk membiayai kuliah. Saya terpaksa mencari kerja dan hidup mandiri.");
      } else {
        next.education.level = "university";
        next.education.yearsStudied = 0;
        pushLog(next, "Saya memutuskan untuk melanjutkan kuliah. Orang tua Saya masih akan menanggung biaya hidup Saya.");
      }
    } else if (choiceId === "job") {
      next.profile.isIndependent = true;
      next.stats.happy += 5;
      pushLog(next, "Saya memutuskan untuk hidup mandiri, mencari kos-kosan, dan mengelola keuangan Saya sendiri mulai sekarang.");
    } else if (choiceId === "gap_year") {
      next.profile.isIndependent = true;
      next.stats.happy += 10;
      pushLog(next, "Saya memutuskan untuk mengambil cuti panjang (Gap Year) sebelum menentukan langkah hidup selanjutnya.");
    }
  } 
  
  else if (eventId === "sim_test") {
    if (choiceId === "yes") {
      // 80% chance to pass
      const passChance = 0.8;
      if (Math.random() < passChance) {
        if (!next.profile.licenses) next.profile.licenses = [];
        if (!next.profile.licenses.includes("SIM A/C")) {
            next.profile.licenses.push("SIM A/C");
        }
        next.stats.happy += 15;
        pushLog(next, "Selamat! Saya berhasil lulus ujian SIM dan sekarang resmi bisa berkendara.");
      } else {
        next.stats.happy -= 10;
        pushLog(next, "Sayang sekali, Saya gagal dalam ujian SIM tahun ini. Saya harus mencobanya lagi nanti.");
      }
    } else {
      pushLog(next, "Saya memutuskan untuk tidak mengambil ujian SIM tahun ini.");
    }
  }

  else if (eventId === "scholarship_offer") {
    if (choiceId === "yes") {
      const chance = 0.35 + (next.stats.smarts - 75) * 0.02;
      if (Math.random() < chance) {
        next.family.isScholarshipActive = true;
        next.stats.happy = Math.min(100, next.stats.happy + 10);
        pushLog(next, "Luar biasa! Saya memenangkan beasiswa tersebut.");
      } else {
        pushLog(next, "Sayang sekali, Saya belum berhasil mendapatkan beasiswa kali ini.");
      }
    } else {
      pushLog(next, "Saya melewatkan kesempatan beasiswa tersebut.");
    }
  }

  else if (eventId === "funeral_decision") {
    if (choiceId === "ignore") {
      pushLog(next, "Saya tidak bisa menghadiri pemakamannya.");
    } else {
      pushLog(next, "Saya menghadiri pemakaman tersebut.");
    }
  }

  return next;
}
