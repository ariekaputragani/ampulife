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

  if (next.money < treatment.cost) {
    pushLog(next, `Uang tidak cukup untuk ${treatment.name}.`);
    return next;
  }

  next.money -= treatment.cost;
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
