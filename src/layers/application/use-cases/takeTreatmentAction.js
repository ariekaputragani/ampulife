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
  const treatment = treatmentCatalog.find((item) => item.id === treatmentId);

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
    if (next.age > 18) next.money = Math.max(0, next.money - adminFee);
    pushLog(next, "Antrian yang sangat panjang membuatmu stres (Kebahagiaan -15). Ada biaya admin tambahan Rp150.000.");
  }

  next.stats.health = clamp(next.stats.health + treatment.effect.health);
  next.stats.happy = clamp(next.stats.happy + treatment.effect.happy);

  if (treatment.canCure && next.healthStatus.condition !== "healthy") {
    next.healthStatus.condition = "healthy";
    next.healthStatus.illnessId = null;
    next.healthStatus.severity = "none";
    next.healthStatus.untreatedYears = 0;
    pushLog(next, `${treatment.name} berhasil menyembuhkan kondisi kesehatanmu.`);
    return next;
  }

  if (!treatment.canCure && next.healthStatus.condition !== "healthy") {
    next.healthStatus.untreatedYears = Math.max(0, next.healthStatus.untreatedYears - 1);
    next.healthStatus.severity = downgradeSeverity(next.healthStatus.severity);
    if (next.healthStatus.severity === "none") {
      next.healthStatus.condition = "healthy";
      next.healthStatus.illnessId = null;
    }
    pushLog(next, `${treatment.name} meredakan gejala kesehatanmu.`);
    return next;
  }

  pushLog(next, `Kamu melakukan ${treatment.name}.`);
  return next;
}
