import { jobsCatalog } from "@/layers/infrastructure/catalogs/jobsCatalog";

export function getJobById(jobId) {
  return jobsCatalog.find((item) => item.id === jobId) ?? null;
}

export function getEffectiveSmarts(state) {
  const educationBoost = Math.min(16, state.education.yearsStudied * 2);
  return state.stats.smarts + educationBoost;
}

export function canTakeJob(state, job) {
  if (!job || !state.life.isAlive || state.legal.inJail) {
    return false;
  }

  if (state.age < job.minAge) {
    return false;
  }

  if (getEffectiveSmarts(state) < job.minSmarts) {
    return false;
  }

  if (job.requiredMajor && state.education.major !== job.requiredMajor) {
    return false;
  }

  if (job.cleanRecordRequired && state.legal.records.length > 0) {
    return false;
  }

  return true;
}

export function computeYearlySalary(state, job) {
  const educationBoost = Math.min(0.3, state.education.yearsStudied * 0.03);
  const loyaltyBoost = Math.min(0.18, state.career.yearsInRole * 0.015);
  return Math.floor(job.salaryPerYear * (1 + educationBoost + loyaltyBoost));
}

export function getPromotionTarget(state) {
  const current = getJobById(state.career.jobId);
  if (!current || !current.nextJobId) {
    return null;
  }

  const nextJob = getJobById(current.nextJobId);
  if (!nextJob) {
    return null;
  }

  if (state.career.yearsInRole < (current.promotionAfterYears ?? 99)) {
    return null;
  }

  if (!canTakeJob(state, nextJob)) {
    return null;
  }

  return nextJob;
}
