import { computeYearlySalary } from "@/layers/domain/services/careerEngine";
import { jobsCatalog } from "@/layers/infrastructure/catalogs/jobsCatalog";
import { cloneState, pushLog, pushNotification } from "@/layers/domain/entities/stateUtils";

export function retireAction(state) {
  if (!state.career.jobId || state.career.isRetired) {
    return state;
  }

  if (state.age < 55) {
    return state;
  }

  const next = cloneState(state);
  const job = jobsCatalog.find(j => j.id === next.career.jobId);
  
  if (job) {
    const salaryWithBoost = computeYearlySalary(next, job);
    const pesangon = Math.floor(salaryWithBoost * next.career.yearsWorked * 0.4); // Slightly less for early retirement
    const pensionYearly = Math.floor(salaryWithBoost * 0.25); // Slightly less for early retirement
    
    next.money += pesangon;
    next.career.isRetired = true;
    next.career.pensionAmount = pensionYearly;
    next.career.jobId = null;
    
    pushLog(next, `Kamu memutuskan untuk pensiun dini pada usia ${next.age} tahun. Kamu menerima uang pesangon sebesar Rp${pesangon.toLocaleString("id-ID")}.`);
    pushNotification(next, {
      title: "Pensiun Dini",
      message: `Selamat beristirahat! Kamu akan menerima uang pensiun tahunan sebesar Rp${pensionYearly.toLocaleString("id-ID")}.`,
      icon: "success"
    });
  }

  return next;
}
