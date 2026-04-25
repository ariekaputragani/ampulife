import { cloneState, applyStatDelta, clamp, pushLog } from "@/layers/domain/entities/stateUtils";
import { jobsCatalog } from "@/layers/infrastructure/catalogs/jobsCatalog";
import { triggerRandomEvent } from "@/layers/domain/services/eventEngine";
import { educationCatalog } from "@/layers/infrastructure/catalogs/educationCatalog";
import {
  computeYearlySalary,
  getPromotionTarget,
} from "@/layers/domain/services/careerEngine";
import { applyIllnessProgression } from "@/layers/domain/services/healthEngine";

export function ageUpYear(state, rng = Math.random) {
  // If there's an unresolved interactive event, we don't age up yet
  if (state.currentEvent) {
    return state;
  }

  const next = cloneState(state);

  if (!next.life.isAlive) {
    return next;
  }

  next.age += 1;
  
  // Social Media Growth
  if (next.socialMedia.isJoined) {
    const growth = next.stats.happy > 50 ? 1.2 : 1.05;
    next.socialMedia.followers = Math.floor((next.socialMedia.followers + 10) * growth);
  }

  next.stats = applyStatDelta(next.stats, {
    happy: -1,
    health: next.age > 60 ? -2 : -1,
    smarts: next.age < 24 ? 1 : 0,
    looks: next.age > 45 ? -2 : -1,
  });

  if (next.legal.inJail) {
    next.legal.jailYearsLeft -= 1;
    next.stats = applyStatDelta(next.stats, {
      happy: -3,
      health: -2,
      smarts: 0,
      looks: -1,
    });
    if (next.legal.jailYearsLeft <= 0) {
      next.legal.inJail = false;
      next.legal.jailYearsLeft = 0;
      pushLog(next, "Masa hukumanmu selesai dan kamu bebas dari penjara.");
    } else {
      pushLog(next, `Kamu menjalani hukuman. Sisa masa tahanan: ${next.legal.jailYearsLeft} tahun.`);
    }
  }

  if (!next.legal.inJail && next.career.jobId) {
    const job = jobsCatalog.find((item) => item.id === next.career.jobId);
    if (job) {
      const salaryWithBoost = computeYearlySalary(next, job);
      next.money += salaryWithBoost;
      next.career.yearsWorked += 1;
      next.career.yearsInRole += 1;
      next.stats = applyStatDelta(next.stats, job.delta);
      pushLog(next, `Pendapatan tahunan dari ${job.name}: Rp${salaryWithBoost.toLocaleString("id-ID")}.`);

      const promotionTarget = getPromotionTarget(next);
      if (promotionTarget) {
        next.career.jobId = promotionTarget.id;
        next.career.yearsInRole = 0;
        next.career.promotions += 1;
        pushLog(next, `Promosi otomatis! Kamu naik menjadi ${promotionTarget.name}.`);
      }
    }
  }

  if (!next.legal.inJail && next.education.level) {
    const education = educationCatalog.find((item) => item.id === next.education.level);
    if (education && next.education.yearsStudied < education.yearsToComplete) {
      next.stats.smarts = clamp(next.stats.smarts + 1);
      next.stats.happy = clamp(next.stats.happy + 1);
      pushLog(next, `Kamu melanjutkan studi ${education.name}.`);
    }
  }

  if (next.healthStatus.condition !== "healthy") {
    applyIllnessProgression(next, rng);
    if (!next.life.isAlive) {
      pushLog(next, `Karakter meninggal karena ${next.life.causeOfDeath}.`);
    } else {
      pushLog(next, "Kondisi kesehatanmu memburuk karena belum ditangani.");
    }
  }

  next.relations = next.relations.map((relation) => ({
    ...relation,
    bond: clamp(relation.bond + (rng() > 0.5 ? 1 : -1)),
    support: clamp(relation.support + (rng() > 0.5 ? 1 : -1)),
  }));

  pushLog(next, `Kamu bertambah usia menjadi ${next.age} tahun.`);
  
  // Trigger Event
  triggerRandomEvent(next, rng);

  if (next.stats.health <= 0) {
    next.life.isAlive = false;
    next.life.causeOfDeath = "Kesehatan kritis";
    pushLog(next, "Karakter meninggal karena kesehatan mencapai 0.");
  }

  return next;
}
