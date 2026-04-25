import { cloneState, applyStatDelta, pushLog } from "@/layers/domain/entities/stateUtils";
import { jobsCatalog } from "@/layers/infrastructure/catalogs/jobsCatalog";
import { canTakeJob } from "@/layers/domain/services/careerEngine";

export function takeJobAction(state, jobId) {
  const next = cloneState(state);
  const job = jobsCatalog.find((item) => item.id === jobId);

  if (!job) {
    return next;
  }

  if (!canTakeJob(next, job)) {
    pushLog(next, `Kamu belum memenuhi syarat untuk ${job.name}.`);
    return next;
  }

  next.career.jobId = job.id;
  next.career.yearsInRole = 0;
  next.money += job.salaryPerYear;
  next.stats = applyStatDelta(next.stats, job.delta);

  pushLog(next, `Kamu bekerja sebagai ${job.name} dan mendapat Rp${job.salaryPerYear.toLocaleString("id-ID")}.`);
  return next;
}
