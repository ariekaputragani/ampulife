import { cloneState, clamp, pushLog, pushNotification } from "@/layers/domain/entities/stateUtils";
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

  const isAnyParentAlive = next.relations.some(r => (r.id === "father" || r.id === "mother") && !r.isDead);
  const isUni = program.level === "university" || program.id.startsWith("university_");

  if (isUni && isAnyParentAlive) {
    // Instead of enrolling directly, trigger the funding popup
    pushLog(next, `Kamu berencana mendaftar di ${program.name}. Siapa yang akan membiayai?`);
    pushNotification(next, {
      title: "Pendanaan Kuliah",
      message: `Kamu ingin masuk ke ${program.name}. Bagaimana rencana pembayarannya?`,
      icon: "question",
      type: "confirm",
      eventId: "university_funding",
      options: [
        { id: "parents", label: "Minta Orang Tua" },
        { id: "self", label: "Bayar Sendiri (Mandiri)" }
      ],
      payload: { targetId: educationId }
    });
    return next;
  }

  if (next.money < program.costPerYear) {
    pushLog(next, `Uang belum cukup untuk biaya tahunan ${program.name}.`);
    return next;
  }

  // Self-funded / Regular Schooling
  next.money -= program.costPerYear;
  next.education.level = program.id;
  next.education.major = program.major ?? next.education.major;
  next.education.yearsStudied = 0;
  next.education.fundingSource = "self"; 
  if (isUni) next.profile.isIndependent = true;
  
  next.education.isFocusingOnWork = false;
  const smartsGain = program.smartsPerYear || program.delta?.smarts || 0;
  next.stats.smarts = clamp(next.stats.smarts + smartsGain);
  next.stats.happy = clamp(next.stats.happy + 2);

  pushLog(next, `Kamu mendaftar di ${program.name} secara mandiri.`);

  return next;
}
