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

  if (isUni) {
    // Calculate total cost (UKT + Admission Fee)
    const ukt = program.costPerYear || 0;
    let admissionFee = 0;
    if (program.id === "university_swasta") admissionFee = 50_000_000;
    else if (program.id === "university_ptn_mandiri") admissionFee = 35_000_000;
    else if (program.id === "university_terbuka") admissionFee = 0;
    const totalNeeded = ukt + admissionFee;

    const familyMoney = next.family.savings;
    const selfMoney = next.money;
    const canAffordFamily = isAnyParentAlive && familyMoney >= totalNeeded;
    const canAffordSelf = selfMoney >= totalNeeded;

    if (!canAffordFamily && !canAffordSelf) {
      pushLog(next, `Kamu tidak mampu mendaftar ke ${program.name}. Dana yang dibutuhkan Rp${totalNeeded.toLocaleString("id-ID")}.`);
      pushNotification(next, {
        title: "Dana Tidak Cukup",
        message: `Biaya masuk ${program.name} (Rp${totalNeeded.toLocaleString("id-ID")}) tidak terjangkau saat ini.`,
        icon: "error"
      });
      return next;
    }

    if (isAnyParentAlive) {
      // Trigger funding popup — both parent and self options available
      pushLog(next, `Kamu berencana mendaftar di ${program.name}. Siapa yang akan membiayai?`);
      pushNotification(next, {
        title: "Pendanaan Kuliah",
        message: `Kamu ingin masuk ke ${program.name}. Total biaya: Rp${totalNeeded.toLocaleString("id-ID")}. Bagaimana rencana pembayarannya?`,
        icon: "question",
        type: "confirm",
        eventId: "university_funding",
        options: [
          { id: "parents", label: `Minta Orang Tua${canAffordFamily ? "" : " (Tidak Cukup)"}`, disabled: !canAffordFamily },
          { id: "self", label: `Bayar Sendiri (Mandiri)${canAffordSelf ? "" : " (Tidak Cukup)"}`, disabled: !canAffordSelf }
        ],
        payload: { targetId: educationId }
      });
      return next;
    }

    // No parents — self-fund only
    if (!canAffordSelf) {
      pushLog(next, `Uang tidak cukup untuk mendaftar ke ${program.name}. Butuh Rp${totalNeeded.toLocaleString("id-ID")}.`);
      return next;
    }

    // Self-funded enrollment (deduct full cost including admission fee)
    next.money -= totalNeeded;
    next.education.level = program.id;
    next.education.schoolName = program.name;
    next.education.yearsStudied = 0;
    next.education.fundingSource = "self";
    next.profile.isIndependent = true;
    next.education.isFocusingOnWork = false;
    next.stats.smarts = clamp(next.stats.smarts + (program.smartsPerYear || 3));
    pushLog(next, `Kamu mendaftar di ${program.name} secara mandiri. Total biaya dibayarkan: Rp${totalNeeded.toLocaleString("id-ID")}.`);
    return next;
  }

  // Non-university schooling (Kejar Paket, etc.)
  if (next.money < program.costPerYear) {
    pushLog(next, `Uang belum cukup untuk biaya tahunan ${program.name}.`);
    return next;
  }

  next.money -= program.costPerYear;
  next.education.level = program.id;
  next.education.major = program.major ?? next.education.major;
  next.education.yearsStudied = 0;
  next.education.fundingSource = "self";
  next.education.isFocusingOnWork = false;
  const smartsGain = program.smartsPerYear || program.delta?.smarts || 0;
  next.stats.smarts = clamp(next.stats.smarts + smartsGain);
  next.stats.happy = clamp(next.stats.happy + 2);
  pushLog(next, `Kamu mendaftar di ${program.name}.`);

  return next;
}
