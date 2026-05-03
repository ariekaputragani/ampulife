import { cloneState, pushLog } from "@/layers/domain/entities/stateUtils";
import { jobsCatalog } from "@/layers/infrastructure/catalogs/jobsCatalog";

export function applyJobAction(state, jobId) {
  const next = cloneState(state);
  const job = jobsCatalog.find(j => j.id === jobId);

  if (!job) return state;

  // 0. Initialize flags if not exists
  if (!next.flags) next.flags = {};
  if (next.flags.jobSearchCount === undefined) next.flags.jobSearchCount = 0;

  // 1. Check application limit (Max 3 per year)
  if (next.flags.jobSearchCount >= 3) {
    pushLog(next, `Kamu sudah terlalu banyak melamar kerja tahun ini. HRD perusahaan lain mungkin sudah menandai namamu. Istirahatlah dan coba lagi tahun depan.`);
    return next;
  }

  // 2. Check if already employed
  if (next.career.jobId) {
    const currentJob = jobsCatalog.find(j => j.id === next.career.jobId);
    pushLog(next, `Kamu masih bekerja sebagai ${currentJob?.name || next.career.jobId}. Kamu harus resign terlebih dahulu.`);
    return next;
  }

  // 3. Check basic requirements (Age, Smarts)
  if (next.age < job.minAge) {
    pushLog(next, `Umurmu belum cukup untuk melamar sebagai ${job.name}.`);
    return next;
  }

  if (next.stats.smarts < job.minSmarts) {
    pushLog(next, `Kualifikasi intelektualmu belum memenuhi syarat untuk posisi ${job.name}.`);
    return next;
  }

  // 4. Wealth status check (Class-based restriction)
  const statusLevels = { poor: 1, middle: 2, rich: 3 };
  const currentStatusLevel = statusLevels[next.family.wealthStatus] || 1;
  const maxStatusLevel = statusLevels[job.maxWealthStatus] || 99;

  if (currentStatusLevel > maxStatusLevel) {
    pushLog(next, `Gengsi keluargamu terlalu tinggi untuk mengambil pekerjaan sebagai ${job.name}.`);
    return next;
  }

  // 5. TRIGGER INTERACTIVE INTERVIEW
  next.flags.jobSearchCount += 1;

  next.currentEvent = {
    id: "job_interview",
    label: "Wawancara Kerja",
    summary: `Kamu dipanggil untuk sesi wawancara posisi ${job.name} di sebuah perusahaan. Bagaimana kamu akan membawakan dirimu?`,
    isInteractive: true,
    options: [
      { id: "confident", label: "Percaya Diri & Tegas", color: "blue" },
      { id: "polite", label: "Sopan & Rendah Hati", color: "green" },
      { id: "nervous", label: "Gugup & Apa Adanya", color: "gray" }
    ],
    payload: { jobId: job.id, jobName: job.name }
  };

  return next;
}

export function resignJobAction(state) {
  const next = cloneState(state);

  if (!next.career.jobId) {
    return state;
  }

  const oldJobId = next.career.jobId;
  const job = jobsCatalog.find(j => j.id === oldJobId);

  next.career.lastJobId = oldJobId;
  next.career.jobId = null;
  next.career.yearsInRole = 0;

  pushLog(next, `Kamu telah resmi mengundurkan diri dari pekerjaanmu sebagai ${job ? job.name : oldJobId}.`);

  return next;
}
