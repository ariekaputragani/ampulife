import { cloneState, clamp, pushLog } from "@/layers/domain/entities/stateUtils";
import { treatmentCatalog } from "@/layers/infrastructure/catalogs/treatmentCatalog";

function downgradeSeverity(severity) {
  if (severity === "severe") {
    return "moderate";
  }
  if (severity === "moderate") {
    return "mild";
  }
  return "none";
}

export function takeTreatmentAction(state, treatmentId) {
  const next = cloneState(state);
  let treatment = treatmentCatalog.find((item) => item.id === treatmentId);

  // Special case for prison clinic (not in catalog)
  if (!treatment && treatmentId === "prison_clinic") {
    treatment = {
      id: "prison_clinic",
      name: "Klinik Penjara",
      cost: 0,
      effect: { health: 10, happy: 0 },
      canCure: true
    };
  }

  if (!treatment) {
    return next;
  }

  if (!next.life.isAlive) {
    pushLog(next, "Karakter sudah meninggal, aksi tidak bisa dilakukan.");
    return next;
  }

  if (next.healthStatus.treatmentCount >= 3) {
    pushLog(next, "Kamu sudah terlalu sering berobat tahun ini. Tubuhmu butuh istirahat.");
    return next;
  }

  let finalCost = treatment.cost;
  let isCoveredByBPJS = false;

  if (treatment.bpjsCovered && next.hasBPJS) {
    finalCost = 0;
    isCoveredByBPJS = true;
  }

  if (next.age <= 18) {
    if (finalCost > 0) {
      if (next.familyWealth === "poor") {
        if (Math.random() > 0.3) {
          pushLog(next, `Orang tuamu menangis karena tidak punya uang Rp${finalCost.toLocaleString("id-ID")} untuk pengobatanmu.`);
          return next;
        } else {
          pushLog(next, `Orang tuamu berutang ke tetangga untuk membayar biayamu berobat (Rp${finalCost.toLocaleString("id-ID")}).`);
        }
      } else {
        pushLog(next, `Orang tuamu membiayai pengobatanmu sebesar Rp${finalCost.toLocaleString("id-ID")}.`);
      }
    } else if (isCoveredByBPJS) {
      pushLog(next, `Orang tuamu membawamu ke Puskesmas. Biaya digratiskan oleh BPJS PBI.`);
    }
  } else {
    if (finalCost > 0) {
      if (next.money < finalCost) {
        pushLog(next, `Uangmu tidak cukup untuk membayar biaya Rp${finalCost.toLocaleString("id-ID")}.`);
        return next;
      }
      next.money -= finalCost;
      pushLog(next, `Kamu membayar biaya pengobatan sebesar Rp${finalCost.toLocaleString("id-ID")}.`);
    } else if (isCoveredByBPJS) {
      pushLog(next, `Kamu berobat ke Puskesmas secara gratis menggunakan BPJS.`);
    }
  }

  next.healthStatus.treatmentCount += 1;
  
  // Penalties for multiple visits
  if (next.healthStatus.treatmentCount === 2) {
    next.stats.happy = clamp(next.stats.happy - 5);
    pushLog(next, "Kamu merasa lelah karena harus kembali berobat (Kebahagiaan -5).");
  } else if (next.healthStatus.treatmentCount === 3) {
    next.stats.happy = clamp(next.stats.happy - 15);
    const adminFee = 150_000;
    const isFree = next.legal?.inJail || isCoveredByBPJS;
    if (next.age > 18 && !isFree) {
      next.money -= adminFee;
    }
    pushLog(next, `Antrian yang sangat panjang membuatmu stres (Kebahagiaan -15).${next.age > 18 && !isFree ? ` Ada biaya admin tambahan Rp${adminFee.toLocaleString("id-ID")}.` : ""}`);
  }

  next.stats.health = clamp(next.stats.health + treatment.effect.health);
  next.stats.happy = clamp(next.stats.happy + treatment.effect.happy);

  // Special Logic: Plastic Surgery (RNG Risk)
  if (treatmentId === "operasi_plastik") {
    const isSuccess = Math.random() < 0.9;
    if (isSuccess) {
      next.stats.looks = 100;
      next.stats.happy = clamp(next.stats.happy + 20);
      pushLog(next, "OPERASI BERHASIL! Wajahmu kini terlihat sempurna seperti selebriti.");
    } else {
      next.stats.looks = 0;
      next.stats.health = clamp(next.stats.health - 50);
      next.stats.happy = clamp(next.stats.happy - 50);
      pushLog(next, "MALPRAKTIK! Operasi gagal total dan merusak wajahmu. Kamu merasa hancur secara fisik dan mental.");
    }
    // Plastic surgery does NOT heal anything
    return next;
  }

  if (next.healthStatus.condition !== "healthy") {
    const isCancer = next.healthStatus.illnessId === "cancer";
    const isBasicClinic = ["puskesmas", "basic_checkup", "prison_clinic"].includes(treatmentId);

    if (isCancer && isBasicClinic) {
      pushLog(next, `Dokter di ${treatment.name} mendesah pelan. Penyakit Kankermu terlalu berat untuk ditangani di sini. Kamu butuh spesialis Rumah Sakit.`);
    } else {
      // Numerical healing progress based on script.js
      // In script.js, doctor visit reduces penh (healingPoints) by 100
      const reduction = 100;
      next.healthStatus.healingPoints -= reduction;

      if (next.healthStatus.healingPoints <= 0) {
        next.healthStatus.condition = "healthy";
        next.healthStatus.illnessId = null;
        next.healthStatus.severity = "none";
        next.healthStatus.untreatedYears = 0;
        next.healthStatus.healingPoints = 0;
        pushLog(next, `${treatment.name} berhasil menyembuhkan kondisi kesehatanmu!`);
      } else {
        next.healthStatus.severity = downgradeSeverity(next.healthStatus.severity);
        pushLog(next, `${treatment.name} meredakan gejala kesehatanmu.`);
      }
    }
    return next;
  }

  pushLog(next, `Kamu melakukan ${treatment.name}.`);
  return next;
}
