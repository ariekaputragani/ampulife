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

  // Check Requirements from Catalog
  if (program.requirement && !program.requirement(next)) {
    const hasSD = next.education.completed.includes("elementary") || next.education.completed.includes("paket_a");
    const hasSMP = next.education.completed.includes("junior_high") || next.education.completed.includes("paket_b");
    const hasSMA = next.education.completed.includes("sma") || next.education.completed.includes("smk") || next.education.completed.includes("paket_c");

    let missingMsg = "";
    let suggestOptions = [];

    if (!hasSD) {
      suggestOptions.push({ id: "paket_a", label: "Ambil Paket A (SD)" });
    }
    if (!hasSMP) {
      suggestOptions.push({ id: "paket_b", label: "Ambil Paket B (SMP)" });
    }
    if (!hasSMA && (program.level === "university" || program.id.startsWith("university_"))) {
      suggestOptions.push({ id: "paket_c", label: "Ambil Paket C (SMA)" });
    }

    if (suggestOptions.length > 0) {
      pushNotification(next, {
        title: "Prasyarat Pendidikan",
        message: `Kamu belum memiliki ijazah yang diperlukan untuk masuk ${program.name}. Silakan ambil program kesetaraan berikut:`,
        icon: "warning",
        type: "confirm",
        eventId: "education_suggest_paket",
        options: suggestOptions
      });
      pushLog(next, `Gagal mendaftar ke ${program.name}: Ijazah belum lengkap.`);
    } else {
      pushLog(next, `Kamu tidak memenuhi persyaratan untuk mendaftar di ${program.name}.`);
    }
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
    // Check for re-enrollment in the same university level to preserve progress
    const isReEnrollment = next.education.level === "none" && next.education.lastLevel === program.id;

    if (!isReEnrollment) {
      next.education.yearsStudied = 0;
    }

    next.education.level = program.id;
    next.education.schoolName = program.name;
    next.education.lastLevel = program.id;
    next.education.fundingSource = "self";
    next.profile.isIndependent = true;
    next.education.isFocusingOnWork = false;
    pushLog(next, `Kamu mendaftar di ${program.name} secara mandiri. Total biaya dibayarkan: Rp${totalNeeded.toLocaleString("id-ID")}.`);
    return next;
  }

  // Non-university schooling (Kejar Paket, etc.)
  if (next.money < program.costPerYear) {
    pushLog(next, `Uang belum cukup untuk biaya tahunan ${program.name}.`);
    return next;
  }

  // Check for re-enrollment in the same level to preserve progress
  const isReEnrollment = next.education.level === "none" && next.education.lastLevel === program.id;

  if (isReEnrollment) {
    next.education.level = program.id;
    next.education.lastLevel = program.id;

    // Assessment / Placement Test Logic
    const currentYears = next.education.yearsStudied || 0;
    const ageAppropriateClass = Math.min(program.yearsToComplete, next.age - program.minAge + 1);

    let jump = 0;
    if (next.stats.smarts > 85) jump = 3;
    else if (next.stats.smarts > 70) jump = 2;
    else if (next.stats.smarts > 50) jump = 1;

    const newClass = Math.min(ageAppropriateClass, currentYears + jump);

    if (newClass > currentYears) {
      next.education.yearsStudied = newClass;
      pushLog(next, `Kamu mengikuti tes penempatan di ${program.name}. Karena kecerdasanmu, kamu diizinkan melompat ke Kelas ${newClass}!`);
    } else {
      pushLog(next, `Kamu mendaftar kembali di ${program.name} dan melanjutkan dari Kelas ${currentYears + 1}.`);
    }
  } else if (next.education.level !== program.id) {
    next.education.yearsStudied = 0;
    next.education.level = program.id;
    next.education.lastLevel = program.id;
    pushLog(next, `Kamu mendaftar di ${program.name}.`);
  }

  next.money -= program.costPerYear;
  next.education.major = program.major ?? next.education.major;
  next.education.fundingSource = "self";
  next.education.isFocusingOnWork = false;
  next.stats.happy = clamp(next.stats.happy + 2);


  return next;
}
