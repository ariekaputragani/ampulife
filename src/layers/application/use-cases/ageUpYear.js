import { cloneState, applyStatDelta, clamp, pushLog } from "@/layers/domain/entities/stateUtils";
import { jobsCatalog } from "@/layers/infrastructure/catalogs/jobsCatalog";
import { triggerRandomEvent } from "@/layers/domain/services/eventEngine";
import { educationCatalog } from "@/layers/infrastructure/catalogs/educationCatalog";
import {
  computeYearlySalary,
  getPromotionTarget,
} from "@/layers/domain/services/careerEngine";
import { applyIllnessProgression } from "@/layers/domain/services/healthEngine";

export function ageUpYear(state, rng = Math.random) {
  // If there's an unresolved interactive event, we don't age up yet
  if (state.currentEvent) {
    return state;
  }

  const next = cloneState(state);

  if (!next.life.isAlive) {
    return next;
  }

  next.age += 1;
  next.healthStatus.treatedThisYear = false;

  let grossIncome = 0;

  // 1. Family Cash Flow Calculation
  const monthlyIncome = next.family.monthlyIncome;
  const yearlyIncome = monthlyIncome * 12;

  // --- TAX CALCULATION (PPh Progresif) ---
  let taxes = 0;
  if (yearlyIncome > 500_000_000) {
    taxes = Math.floor((yearlyIncome - 500_000_000) * 0.30 + (250_000_000 * 0.15) + (190_000_000 * 0.05));
  } else if (yearlyIncome > 250_000_000) {
    taxes = Math.floor((yearlyIncome - 250_000_000) * 0.15 + (190_000_000 * 0.05));
  } else if (yearlyIncome > 60_000_000) {
    taxes = Math.floor((yearlyIncome - 60_000_000) * 0.05);
  }

  // --- BASIC HOUSEHOLD EXPENSES (Living Costs) ---
  const expenseRatio = next.family.wealthStatus === "poor" ? 0.75 : next.family.wealthStatus === "middle" ? 0.6 : 0.35;
  const basicExpenses = Math.floor(yearlyIncome * expenseRatio);

  // --- CHILDCARE COSTS (Player's Needs) ---
  let childcareCost = 0;
  if (next.age <= 4) childcareCost = 4_000_000;
  else if (next.age <= 12) childcareCost = 2_000_000;
  else if (next.age <= 18) childcareCost = 5_000_000;
  
  // Scale childcare cost by wealth (Rich families spend way more)
  if (next.family.wealthStatus === "rich") childcareCost *= 15;
  else if (next.family.wealthStatus === "middle") childcareCost *= 2.5;

  // --- TOTAL DEDUCTION ---
  const totalDeduction = taxes + basicExpenses + childcareCost;
  next.family.savings += (yearlyIncome - totalDeduction);

  // --- LOGGING: NARRATIVE & FORMAL ---
  if (taxes > 0) {
    pushLog(next, `Orang tua ku baru saja membayar pajak penghasilan tahunan mereka.`);
  }
  pushLog(next, `Orang tua ku membelikan semua kebutuhan pokok dan keperluan pribadi ku tahun ini.`);
  
  const report = `[Laporan Keuangan Keluarga] Pajak: Rp${taxes.toLocaleString("id-ID")}, Hidup: Rp${basicExpenses.toLocaleString("id-ID")}, Anak: Rp${childcareCost.toLocaleString("id-ID")}`;
  pushLog(next, report);

  // Education Cost Logic
  if (next.education.level !== "none") {
    const educationCosts = {
      elementary: 1_200_000,
      junior_high: 3_000_000,
      high_school: 6_000_000,
      university: 25_000_000,
    };

    let yearlyFee = educationCosts[next.education.level] || 0;
    
    if (next.family.isScholarshipActive) {
      yearlyFee = 0;
      pushLog(next, "Kamu bersekolah dengan beasiswa tahun ini (Biaya Rp0).");
    } else {
      next.family.savings -= yearlyFee;
      pushLog(next, `Keluargamu membayar biaya sekolah ${next.education.level} sebesar Rp${yearlyFee.toLocaleString("id-ID")}.`);
    }

    // Financial Crisis check
    if (next.family.savings < 0 && !next.family.isScholarshipActive) {
      pushLog(next, "PERINGATAN: Tabungan keluargamu habis! Kamu terancam putus sekolah.");
    }
  }

  // Allowance derived from family income
  if (next.age >= 6 && next.age <= 18) {
    const allowancePercent = next.family.wealthStatus === "rich" ? 0.05 : next.family.wealthStatus === "middle" ? 0.02 : 0.005;
    const allowance = Math.floor((next.family.monthlyIncome * allowancePercent) * (0.8 + rng() * 0.4));
    
    if (allowance > 0 && next.family.savings > 0) {
      grossIncome += allowance;
      pushLog(next, `Kamu mendapat uang jajan Rp${allowance.toLocaleString("id-ID")} tahun ini.`);
    }
  }
  
  // Social Media Growth
  if (next.socialMedia.isJoined) {
    const growth = next.stats.happy > 50 ? 1.2 : 1.05;
    next.socialMedia.followers = Math.floor((next.socialMedia.followers + 10) * growth);
  }

  next.stats = applyStatDelta(next.stats, {
    happy: -1,
    health: next.age > 60 ? -2 : -1,
    smarts: next.age < 24 ? 1 : 0,
    looks: next.age > 45 ? -2 : -1,
  });

  if (next.legal.inJail) {
    next.legal.jailYearsLeft -= 1;
    next.stats = applyStatDelta(next.stats, {
      happy: -3,
      health: -2,
      smarts: 0,
      looks: -1,
    });
    if (next.legal.jailYearsLeft <= 0) {
      next.legal.inJail = false;
      next.legal.jailYearsLeft = 0;
      pushLog(next, "Masa hukumanmu selesai dan kamu bebas dari penjara.");
    } else {
      pushLog(next, `Kamu menjalani hukuman. Sisa masa tahanan: ${next.legal.jailYearsLeft} tahun.`);
    }
  }

  if (!next.legal.inJail && next.career.jobId) {
    const job = jobsCatalog.find((item) => item.id === next.career.jobId);
    if (job) {
      const salaryWithBoost = computeYearlySalary(next, job);
      grossIncome += salaryWithBoost;
      next.career.yearsWorked += 1;
      next.career.yearsInRole += 1;
      next.stats = applyStatDelta(next.stats, job.delta);
      pushLog(next, `Pendapatan kotor tahunan dari ${job.name}: Rp${salaryWithBoost.toLocaleString("id-ID")}.`);

      const promotionTarget = getPromotionTarget(next);
      if (promotionTarget) {
        next.career.jobId = promotionTarget.id;
        next.career.yearsInRole = 0;
        next.career.promotions += 1;
        pushLog(next, `Promosi otomatis! Kamu naik menjadi ${promotionTarget.name}.`);
      }
    }
  }

  // Lifestyle & Budgeting Logic
  const lifestyle = next.financial?.lifestyle || "normal";
  const lifestyleNames = { hemat: "Hemat", normal: "Normal", mewah: "Mewah" };

  if (grossIncome > 0) {
    let expensesRatio = 0.5; // normal

    if (lifestyle === "hemat") {
      expensesRatio = 0.2;
      next.stats = applyStatDelta(next.stats, { happy: -2 });
    } else if (lifestyle === "mewah") {
      expensesRatio = 0.9;
      next.stats = applyStatDelta(next.stats, { happy: 3 });
    }

    const expenses = Math.floor(grossIncome * expensesRatio);
    const netIncome = grossIncome - expenses;
    next.money += netIncome;

    pushLog(next, `Dengan gaya hidup [${lifestyleNames[lifestyle]}], biaya hidupmu Rp${expenses.toLocaleString("id-ID")}. Sisa uang bersih yang ditabung: Rp${netIncome.toLocaleString("id-ID")}.`);
  } else if (next.age > 18 && next.money > 0 && !next.legal.inJail) {
    let expenses = 2000000;
    if (lifestyle === "mewah") expenses = 10000000;
    if (lifestyle === "hemat") expenses = 500000;
    
    expenses = Math.min(expenses, next.money);
    next.money -= expenses;
    next.stats = applyStatDelta(next.stats, { happy: -2 }); // Stres karena menguras tabungan
    pushLog(next, `Kamu tidak memiliki pendapatan tahun ini. Tabunganmu terkuras Rp${expenses.toLocaleString("id-ID")} untuk menyambung biaya hidup.`);
  }

  // Education System Logic
  if (!next.legal.inJail) {
    // 1. Automatic Enrollment
    if (next.age === 6 && next.education.level === "none") {
      next.education.level = "elementary";
      next.education.yearsStudied = 0;
      pushLog(next, "Hari pertama sekolah! Kamu resmi menjadi siswa SD.");
    } else if (next.age === 12 && next.education.completed.includes("elementary") && next.education.level === "none") {
      next.education.level = "junior_high";
      next.education.yearsStudied = 0;
      pushLog(next, "Kamu melanjutkan pendidikan ke jenjang SMP.");
    } else if (next.age === 15 && next.education.completed.includes("junior_high") && next.education.level === "none") {
      next.education.level = "high_school";
      next.education.yearsStudied = 0;
      pushLog(next, "Selamat! Kamu sekarang berseragam putih abu-abu (SMA).");
    }

    // 2. Progression
    if (next.education.level !== "none") {
      const edu = educationCatalog.find(e => e.id === next.education.level);
      if (edu) {
        next.education.yearsStudied += 1;
        next.stats = applyStatDelta(next.stats, {
          smarts: edu.smartsPerYear || 2,
          happy: 1
        });

        if (next.education.yearsStudied >= edu.yearsToComplete) {
          next.education.completed.push(next.education.level);
          const graduatedName = edu.name;
          next.education.level = "none";
          next.education.yearsStudied = 0;
          next.family.isScholarshipActive = false;
          pushLog(next, `LULUS! Kamu telah menyelesaikan pendidikan ${graduatedName}.`);
        } else {
          pushLog(next, `Kamu melanjutkan studi ${edu.name} (Tahun ke-${next.education.yearsStudied}).`);
        }
      }
    }
  }

  if (next.healthStatus.condition !== "healthy") {
    applyIllnessProgression(next, rng);
    if (!next.life.isAlive) {
      pushLog(next, `Karakter meninggal karena ${next.life.causeOfDeath}.`);
    } else {
      pushLog(next, "Kondisi kesehatanmu memburuk karena belum ditangani.");
    }
  }

  next.relations = next.relations.map((relation) => ({
    ...relation,
    bond: clamp(relation.bond + (rng() > 0.5 ? 1 : -1)),
    support: clamp(relation.support + (rng() > 0.5 ? 1 : -1)),
  }));

  pushLog(next, `Kamu bertambah usia menjadi ${next.age} tahun.`);
  
  // Trigger Event
  triggerRandomEvent(next, rng);

  if (next.stats.health <= 0) {
    next.life.isAlive = false;
    next.life.causeOfDeath = "Kesehatan kritis";
    pushLog(next, "Karakter meninggal karena kesehatan mencapai 0.");
  }

  return next;
}
