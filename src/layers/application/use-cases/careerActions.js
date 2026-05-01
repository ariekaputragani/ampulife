import { cloneState, pushLog } from "@/layers/domain/entities/stateUtils";
import { jobsCatalog } from "@/layers/infrastructure/catalogs/jobsCatalog";

export function applyJobAction(state, jobId) {
  const next = cloneState(state);
  const job = jobsCatalog.find(j => j.id === jobId);

  if (!job) return state;

  // 1. Check if already employed
  if (next.career.jobId) {
    pushLog(next, `Kamu masih bekerja sebagai ${next.career.jobId}. Kamu harus resign terlebih dahulu.`);
    return next;
  }

  // 2. Check basic requirements (Age, Smarts, Wealth)
  if (next.age < job.minAge) {
    pushLog(next, `Umurmu belum cukup untuk melamar sebagai ${job.name}.`);
    return next;
  }

  if (next.stats.smarts < job.minSmarts) {
    pushLog(next, `Kualifikasi intelektualmu belum memenuhi syarat untuk posisi ${job.name}.`);
    return next;
  }

  // 3. Wealth status check (Class-based restriction)
  const statusLevels = { poor: 1, middle: 2, rich: 3 };
  const currentStatusLevel = statusLevels[next.family.wealthStatus] || 1;
  const maxStatusLevel = statusLevels[job.maxWealthStatus] || 99;

  if (currentStatusLevel > maxStatusLevel) {
    pushLog(next, `Gengsi keluargamu terlalu tinggi untuk mengambil pekerjaan sebagai ${job.name}.`);
    return next;
  }

  // 4. Hiring Chance (Success/Fail)
  // Base chance 60% + boost from smarts/looks
  const hiringChance = 0.5 + (next.stats.smarts / 400) + (next.stats.looks / 400);
  
  if (Math.random() < hiringChance) {
    next.career.jobId = job.id;
    next.career.yearsInRole = 0;
    pushLog(next, `SELAMAT! Lamaranmu diterima. Kamu sekarang bekerja sebagai ${job.name}.`);
  } else {
    next.stats.happy = Math.max(0, next.stats.happy - 5);
    pushLog(next, `Maaf, lamaranmu untuk posisi ${job.name} ditolak oleh HRD. Coba lagi tahun depan atau cari lowongan lain.`);
  }

  return next;
}

export function resignJobAction(state) {
  const next = cloneState(state);
  
  if (!next.career.jobId) {
    return state;
  }

  const oldJobId = next.career.jobId;
  const job = jobsCatalog.find(j => j.id === oldJobId);

  next.career.jobId = null;
  next.career.yearsInRole = 0;
  
  pushLog(next, `Kamu telah resmi mengundurkan diri dari pekerjaanmu sebagai ${job ? job.name : oldJobId}.`);
  
  return next;
}
