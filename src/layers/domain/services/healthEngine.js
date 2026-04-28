import { clamp } from "@/layers/domain/entities/stateUtils";
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

  state.healthStatus.untreatedYears += 1;

  if (state.healthStatus.untreatedYears >= 2) {
    state.healthStatus.severity = nextSeverity(state.healthStatus.severity);
  }

  const illness = getIllnessById(state.healthStatus.illnessId);
  if (!illness) {
    return;
  }

  const factor = getSeverityFactor(state.healthStatus.severity);
  const healthPenalty = Math.ceil(illness.yearlyPenalty.health * factor);
  const happyPenalty = Math.ceil(illness.yearlyPenalty.happy * factor);

  state.stats.health = clamp(state.stats.health - healthPenalty);
  state.stats.happy = clamp(state.stats.happy - happyPenalty);

  const ageRisk = state.age > 65 ? 0.05 : 0;
  const severityRisk = state.healthStatus.severity === "severe" ? 0.1 : 0;
  let deathRisk = illness.mortalityRisk + ageRisk + severityRisk;

  // Protection: If treated this year, reduce death risk by 95%
  if (state.healthStatus.treatmentCount > 0) {
    deathRisk *= 0.05;
  }

  // Protection: Children (under 12) have better survival chance for common illnesses
  if (state.age < 12) {
    deathRisk *= 0.5;
  }

  if (rng() < deathRisk) {
    state.life.isAlive = false;
    state.life.causeOfDeath = illness.name;
  }
}
