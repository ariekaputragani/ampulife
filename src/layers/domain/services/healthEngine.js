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

  // Numerical healing progress logic
  if (state.healthStatus.healingPoints === undefined || state.healthStatus.healingPoints === 0) {
    const range = illness.initialHealingRange || { min: 1, max: 100 };
    state.healthStatus.healingPoints = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  // Annual progression based on script.js
  const illnessId = state.healthStatus.illnessId;
  
  if (illnessId === "cancer") {
    // Cancer gets worse (+50 penh)
    state.healthStatus.healingPoints += 50;
  } else {
    // Natural recovery over time for some illnesses
    // 0: Batuk rejan (20), 1: Campak (20), 2: DBD (20), 4: Coronavirus (100), 
    // 5: Alzheimer (50), 6: Epilepsi (100), 7: Flu (100), 8: Diare (100), 
    // 10: Tubercolosis (30), 11: Penyakit jantung (3)
    
    const naturalRecoveryMap = {
      pertussis: 20,
      measles: 20,
      dengue: 20,
      coronavirus: 100,
      alzheimer: 50,
      epilepsy: 100,
      flu: 100,
      diarrhea: 100,
      tuberculosis: 30,
      heart_disease: 3,
      diabetes: 0, // Diabetes doesn't heal naturally in legacy script?
    };

    const recoveryAmount = naturalRecoveryMap[illnessId] || 0;
    state.healthStatus.healingPoints -= recoveryAmount;
  }

  // Check if cured naturally
  if (state.healthStatus.healingPoints <= 0) {
    const recoveredName = illness.name;
    state.healthStatus.condition = "healthy";
    state.healthStatus.illnessId = null;
    state.healthStatus.severity = "none";
    state.healthStatus.untreatedYears = 0;
    state.healthStatus.healingPoints = 0;
    
    state.stats.happy = clamp(state.stats.happy + 10);
    state.stats.health = clamp(state.stats.health + 5);

    pushLog(state, `Kabar baik! Tubuh ku berhasil melawan penyakit dan Saya sembuh dari ${recoveredName} secara alami.`);
    return;
  }

  state.healthStatus.untreatedYears += 1;

  if (state.healthStatus.untreatedYears >= 2) {
    state.healthStatus.severity = nextSeverity(state.healthStatus.severity);
  }

  const factor = getSeverityFactor(state.healthStatus.severity);
  
  // Support for age-dependent penalty (e.g. for Cancer)
  let baseHealthPenalty = illness.yearlyPenalty.health || 0;
  if (Array.isArray(baseHealthPenalty)) {
    const matchingRange = baseHealthPenalty.find(range => state.age <= (range.maxAge || 999));
    baseHealthPenalty = matchingRange ? matchingRange.value : 0;
  }
  
  const healthPenalty = Math.ceil(baseHealthPenalty * factor);
  const happyPenalty = Math.ceil((illness.yearlyPenalty.happy || 0) * factor);

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
