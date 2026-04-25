import { cloneState, clamp, pushLog } from "@/layers/domain/entities/stateUtils";
import { educationCatalog } from "@/layers/infrastructure/catalogs/educationCatalog";

export function takeEducationAction(state, educationId) {
  const next = cloneState(state);
  const program = educationCatalog.find((item) => item.id === educationId);

  if (!program) {
    return next;
  }

  if (!next.life.isAlive) {
    pushLog(next, "Karakter sudah meninggal, aksi tidak bisa dilakukan.");
    return next;
  }

  if (next.legal.inJail) {
    pushLog(next, "Kamu sedang di penjara, tidak bisa melanjutkan studi.");
    return next;
  }

  if (next.age < program.minAge) {
    pushLog(next, `Umur belum cukup untuk ${program.name}.`);
    return next;
  }

  if (next.money < program.costPerYear) {
    pushLog(next, `Uang belum cukup untuk biaya tahunan ${program.name}.`);
    return next;
  }

  next.money -= program.costPerYear;
  next.education.level = program.id;
  next.education.major = program.major ?? next.education.major;
  next.education.yearsStudied += 1;
  next.stats.smarts = clamp(next.stats.smarts + program.smartsPerYear);
  next.stats.happy = clamp(next.stats.happy + 2);

  if (next.education.yearsStudied >= program.yearsToComplete) {
    pushLog(next, `Kamu menyelesaikan ${program.name}.`);
  } else {
    pushLog(next, `Kamu menempuh ${program.name} tahun ke-${next.education.yearsStudied}.`);
  }

  return next;
}
