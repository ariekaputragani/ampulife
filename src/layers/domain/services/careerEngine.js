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

  if (job.maxWealthStatus) {
    const statusLevels = { poor: 1, middle: 2, rich: 3 };
    const currentLevel = statusLevels[state.family.wealthStatus] || 1;
    const maxLevel = statusLevels[job.maxWealthStatus];

    if (currentLevel > maxLevel) {
      return false;
    }
  }

  return true;
}

export function computeYearlySalary(state, job) {
  const educationBoost = Math.min(0.3, state.education.yearsStudied * 0.03);
  const loyaltyBoost = Math.min(0.18, state.career.yearsInRole * 0.015);
  const multiplier = state.career.salaryMultiplier || 1.0;
  return Math.floor(job.salaryPerYear * (1 + educationBoost + loyaltyBoost) * multiplier);
}

export function getPromotionRequirements(state) {
  const current = getJobById(state.career.jobId);
  if (!current || !current.nextJobId) {
    return null;
  }

  const nextJob = getJobById(current.nextJobId);
  if (!nextJob) return null;

  const reqs = [];
  
  // 1. Years in Role
  const minYears = current.promotionAfterYears ?? 3;
  if (state.career.yearsInRole < minYears) {
    reqs.push({ 
      id: "years", 
      label: `Masa Kerja: ${state.career.yearsInRole}/${minYears} tahun`,
      met: false 
    });
  } else {
    reqs.push({ id: "years", label: `Masa Kerja: ${minYears}/${minYears} tahun`, met: true });
  }

  // 2. Smarts
  const effectiveSmarts = getEffectiveSmarts(state);
  if (effectiveSmarts < nextJob.minSmarts) {
    reqs.push({ 
      id: "smarts", 
      label: `Kecerdasan: ${effectiveSmarts}/${nextJob.minSmarts}`,
      met: false 
    });
  } else {
    reqs.push({ id: "smarts", label: `Kecerdasan: Cukup`, met: true });
  }

  // 3. Age
  if (state.age < nextJob.minAge) {
    reqs.push({ 
      id: "age", 
      label: `Umur Minimal: ${nextJob.minAge} tahun`,
      met: false 
    });
  }

  return {
    nextJobName: nextJob.name,
    requirements: reqs,
    canPromote: reqs.every(r => r.met)
  };
}

export function getPromotionTarget(state) {
  const status = getPromotionRequirements(state);
  if (!status || !status.canPromote) return null;
  return getJobById(getJobById(state.career.jobId).nextJobId);
}
