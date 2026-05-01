import { clamp, pushLog } from "@/layers/domain/entities/stateUtils";
import { getIllnessById } from "@/layers/infrastructure/catalogs/illnessCatalog";

const severityRank = ["mild", "moderate", "severe"];

function nextSeverity(current) {
  const index = severityRank.indexOf(current);
  if (index < 0 || index >= severityRank.length - 1) {
    return current;
  }
  return severityRank[index + 1];
}

function getSeverityFactor(severity) {
  if (severity === "moderate") {
    return 1.45;
  }
  if (severity === "severe") {
    return 2.1;
  }
  return 1;
}

export function applyIllnessProgression(state, rng = Math.random) {
  if (state.healthStatus.condition === "healthy" || !state.healthStatus.illnessId) {
    return;
  }

  const illness = getIllnessById(state.healthStatus.illnessId);
  if (!illness) return;

  // Initialize if somehow missing
  if (typeof state.healthStatus.untreatedYears !== "number") {
    state.healthStatus.untreatedYears = 0;
  }

  // --- SPONTANEOUS RECOVERY LOGIC ---
  const nonHealing = ["cancer", "heart_disease", "diabetes", "alzheimer"];
  
  if (!nonHealing.includes(state.healthStatus.illnessId)) {
    // High chance for mild illnesses to heal naturally within 1-2 years
    let recoveryChance = state.healthStatus.severity === "mild" ? 0.50 : 0.15;
    const timeBonus = (state.healthStatus.untreatedYears || 0) * 0.25;
    const finalChance = recoveryChance + timeBonus;

    if (rng() < finalChance) {
      const recoveredName = illness.name;
      state.healthStatus.condition = "healthy";
      state.healthStatus.illnessId = null;
      state.healthStatus.severity = "mild";
      state.healthStatus.untreatedYears = 0;
      
      state.stats.happy = clamp(state.stats.happy + 10);
      state.stats.health = clamp(state.stats.health + 5);

      pushLog(state, `Kabar baik! Tubuh ku berhasil melawan penyakit dan Saya sembuh dari ${recoveredName} secara alami.`);
      return;
    }
  }

  state.healthStatus.untreatedYears += 1;

  if (state.healthStatus.untreatedYears >= 2) {
    state.healthStatus.severity = nextSeverity(state.healthStatus.severity);
  }

  const factor = getSeverityFactor(state.healthStatus.severity);
  const healthPenalty = Math.ceil(illness.yearlyPenalty.health * factor);
  const happyPenalty = Math.ceil(illness.yearlyPenalty.happy * factor);

  state.stats.health = clamp(state.stats.health - healthPenalty);
  state.stats.happy = clamp(state.stats.happy - happyPenalty);

  // Increased mortality risk for older characters and severe illnesses
  const ageRisk = state.age > 65 ? (state.age - 60) * 0.015 : 0;
  const severityRisk = state.healthStatus.severity === "severe" ? 0.15 : 0;
  let deathRisk = illness.mortalityRisk + ageRisk + severityRisk;

  // Protection only for children or very fresh minor illnesses
  if (state.age < 40 && state.healthStatus.untreatedYears <= 1 && state.healthStatus.severity === "mild") {
    deathRisk = 0; 
  }

  if (state.healthStatus.treatmentCount > 0) {
    deathRisk *= 0.1;
  }

  if (rng() < deathRisk) {
    state.life.isAlive = false;
    state.life.causeOfDeath = illness.name;
  }
}
