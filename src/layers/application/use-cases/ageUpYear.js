import { cloneState, applyStatDelta, clamp, clampStatus, pushLog, pushNotification, generateRandomName } from "@/layers/domain/entities/stateUtils";
import { dropOutAction } from "./dropOutAction";
import { jobsCatalog } from "@/layers/infrastructure/catalogs/jobsCatalog";
import { triggerRandomEvent } from "@/layers/domain/services/eventEngine";
import { educationCatalog } from "@/layers/infrastructure/catalogs/educationCatalog";
import {
  computeYearlySalary,
  getPromotionTarget,
} from "@/layers/domain/services/careerEngine";
import { applyIllnessProgression } from "@/layers/domain/services/healthEngine";
import { getIllnessById } from "@/layers/infrastructure/catalogs/illnessCatalog";

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

  // --- 1. AGE-UP RESETS & FLAGS ---
  next.legal.crimeAttemptsThisYear = 0;
  next.legal.isCaughtThisYear = false;
  next.healthStatus.treatmentCount = 0;

  if (!next.flags) next.flags = {};
  next.flags.gymVisit = false;
  next.flags.libraryVisit = false;
  next.flags.meditationVisit = false;
  next.flags.jobSearchCount = 0;
  next.flags.isDrivingAttempted = false;
  next.flags.isSocialMediaPosted = false;
  next.flags.isDrugAttempted = false;

  // --- 1.1 GLOBAL RELATION AGING ---
  next.relations = next.relations.map((relation) => {
    if (relation.isDead) return relation;
    return {
      ...relation,
      age: relation.age + 1,
      bond: clamp(relation.bond + (rng() > 0.5 ? 1 : -1)),
      support: clamp(relation.support + (rng() > 0.5 ? 1 : -1)),
    };
  });

  let grossIncome = 0;

  // --- 2. PRE-CALCULATE FINANCES ---
  if (next.family.isBankrupt) {
    next.family.monthlyIncome = 1_500_000;
  }

  const { savings: famSavings, monthlyIncome: famIncome } = next.family;
  if (famSavings > 500_000_000 && famIncome > 20_000_000) {
    next.family.wealthStatus = "rich";
  } else if (famSavings < 50_000_000 && famIncome < 5_000_000) {
    next.family.wealthStatus = "poor";
  } else if (famSavings >= 50_000_000 && famIncome >= 5_000_000) {
    next.family.wealthStatus = "middle";
  }

  const yearlyIncome = next.family.monthlyIncome * 12;

  // Taxes
  let taxes = 0;
  if (yearlyIncome > 500_000_000) {
    taxes = Math.floor((yearlyIncome - 500_000_000) * 0.30 + (250_000_000 * 0.15) + (190_000_000 * 0.05));
  } else if (yearlyIncome > 250_000_000) {
    taxes = Math.floor((yearlyIncome - 250_000_000) * 0.15 + (190_000_000 * 0.05));
  } else if (yearlyIncome > 60_000_000) {
    taxes = Math.floor((yearlyIncome - 60_000_000) * 0.05);
  }

  // Lifestyle
  let lifestyleMult = 1.0;
  const lifestyle = next.financial.lifestyle || "normal";
  if (lifestyle === "hemat") {
    lifestyleMult = 0.8;
    next.stats.happy = clamp(next.stats.happy - 2);
  } else if (lifestyle === "mewah") {
    lifestyleMult = 1.6;
    next.stats.happy = clamp(next.stats.happy + 3);
  }

  const expenseRatio = next.family.wealthStatus === "poor" ? 0.75 : next.family.wealthStatus === "middle" ? 0.6 : 0.35;
  const basicExpenses = Math.floor(yearlyIncome * expenseRatio * lifestyleMult);

  // --- SPOUSE INCOME & CHILDCARE FOR PLAYER ---
  const spouse = next.relations.find(r => r.status === "spouse" && !r.isDead);
  if (spouse) {
    // Spouse contributes to Joint Account
    let spouseYearlyIncome = 45_000_000;
    if (lifestyle === "mewah") spouseYearlyIncome = 150_000_000;
    else if (lifestyle === "hemat") spouseYearlyIncome = 25_000_000;
    
    grossIncome += spouseYearlyIncome;
    pushLog(next, `Pasanganmu (${spouse.name}) berkontribusi gaji sebesar Rp${spouseYearlyIncome.toLocaleString("id-ID")} ke rekening bersama.`);
  }

  // Childcare for Player's own children
  const myChildren = next.relations.filter(r => r.label === "Anak" && !r.isDead);
  let playerChildcareCost = 0;
  myChildren.forEach(child => {
    let cost = 0;
    if (child.age <= 4) cost = 4_000_000;
    else if (child.age <= 12) cost = 2_000_000;
    else if (child.age <= 18) cost = 5_000_000;
    
    // Scale by player lifestyle
    if (lifestyle === "mewah") cost *= 5;
    else if (lifestyle === "hemat") cost *= 0.5;
    
    playerChildcareCost += cost;
  });

  if (playerChildcareCost > 0) {
    next.money -= playerChildcareCost;
    pushLog(next, `Kamu membayar biaya kebutuhan ${myChildren.length} anak sebesar Rp${playerChildcareCost.toLocaleString("id-ID")}.`);
  }

  // Automatic Birth Chance (20% per year if married and fertile age)
  if (spouse && next.age >= 20 && next.age <= 45 && !next.family.isKB && rng() < 0.20) {
    const childGender = rng() > 0.5 ? "Laki-laki" : "Perempuan";
    const childName = generateRandomName(childGender === "Laki-laki" ? "male" : "female");
    
    next.relations.push({
      id: `child_${Date.now()}_${Math.floor(rng() * 1000)}`,
      name: childName,
      label: "Anak",
      status: "family",
      gender: childGender === "Laki-laki" ? "M" : "F",
      age: 0,
      relationship: 100,
      bond: 100,
      support: 100,
      isDead: false,
      lastInteractionAge: -1
    });
    
    let birthCost = 15_000_000;
    if (lifestyle === "mewah") birthCost = 50_000_000;
    else if (lifestyle === "hemat") birthCost = 5_000_000;
    
    next.money -= birthCost;
    
    pushLog(next, `Kabar gembira! Pasanganmu melahirkan seorang anak ${childGender} yang diberi nama ${childName}. Biaya persalinan: Rp${birthCost.toLocaleString("id-ID")}.`);
    pushNotification(next, {
      title: "Kelahiran Anak",
      message: `Selamat! Kamu memiliki seorang anak baru bernama ${childName}. (Biaya RS: Rp${birthCost.toLocaleString("id-ID")})`,
      icon: "success"
    });
  }

  // Childcare
  let childcareCost = 0;
  if (next.age <= 4) childcareCost = 4_000_000;
  else if (next.age <= 12) childcareCost = 2_000_000;
  else if (next.age <= 18) childcareCost = 5_000_000;

  if (next.family.wealthStatus === "rich") childcareCost *= 15;
  else if (next.family.wealthStatus === "middle") childcareCost *= 2.5;
  else if (next.family.wealthStatus === "poor") childcareCost *= 0.25;

  childcareCost = Math.floor(childcareCost * lifestyleMult);

  // Transport
  const assets = next.family.assets || { motor: false, car: false };
  let transportCost = 3_000_000;
  if (next.family.wealthStatus === "poor") transportCost = 1_200_000;
  if (assets.car) {
    transportCost = next.family.wealthStatus === "rich" ? 45_000_000 : 15_000_000;
  } else if (assets.motor) {
    transportCost = 1_500_000;
  }

  // --- 3. LOGGING PHASE ---
  const isMilestoneAge = [6, 12, 15, 17, 18].includes(next.age);
  let otherEvents = isMilestoneAge;

  let eventCost = 0;

  // Family Finances Log
  if (!next.profile.isIndependent) {
    const totalDeduction = taxes + basicExpenses + childcareCost + transportCost;
    next.family.savings += (yearlyIncome - totalDeduction);

    const savingsBeforeEvent = next.family.savings;
    eventCost = Math.max(0, savingsBeforeEvent - next.family.savings);

    // --- LOGGING: NARRATIVE & FORMAL (FAMILY) ---
    if (taxes > 0) {
      pushLog(next, `Orang tua ku baru saja membayar pajak penghasilan tahunan mereka.`);
    }
    pushLog(next, `Orang tua ku membelikan semua kebutuhan pokok dan keperluan pribadi ku tahun ini.`);

    const report = `[Laporan Keuangan Keluarga] Pajak: Rp${taxes.toLocaleString("id-ID")}, Hidup: Rp${basicExpenses.toLocaleString("id-ID")}, Anak: Rp${childcareCost.toLocaleString("id-ID")}, Transport: Rp${transportCost.toLocaleString("id-ID")}${eventCost > 0 ? `, Lain-lain: Rp${eventCost.toLocaleString("id-ID")}` : ""}`;
    pushLog(next, report);

    // --- POCKET MONEY (Uang Jajan) ---
    if (next.age >= 6 && !next.legal.isCaughtThisYear && !next.legal.inJail) {
      const pocketMoney = next.family.wealthStatus === "rich" ? 1_000_000 : next.family.wealthStatus === "middle" ? 350_000 : 75_000;
      next.money += pocketMoney;
      pushLog(next, `Orang tuamu memberimu uang jajan sebesar Rp${pocketMoney.toLocaleString("id-ID")} tahun ini.`);
    } else if (next.legal.isCaughtThisYear || next.legal.inJail) {
      pushLog(next, `Tahun ini kamu tidak mendapatkan uang jajan sebagai hukuman karena kenakalanmu.`);
    }
  }

  let yearlyFee = 0;

  // Education Cost Logic
  if (next.education.level !== "none") {
    // 2. Education Cost Logic (Scaled by Wealth)
    const educationCosts = {
      elementary: { poor: 0, middle: 5_000_000, rich: 45_000_000 },
      junior_high: { poor: 0, middle: 8_000_000, rich: 65_000_000 },
      high_school: { poor: 0, middle: 12_000_000, rich: 90_000_000 },
      university: { poor: 5_000_000, middle: 35_000_000, rich: 250_000_000 },
    };

    const costConfig = educationCosts[next.education.level];
    yearlyFee = costConfig ? costConfig[next.family.wealthStatus] : 0;

    // --- SCHOLARSHIP MANAGEMENT ---
    if (!next.family.activeScholarships) next.family.activeScholarships = [];
    next.family.activeScholarships = next.family.activeScholarships.map(s => ({
      ...s,
      yearsLeft: s.yearsLeft - 1
    })).filter(s => s.yearsLeft > 0);

    // Auto-grant for POOR families
    if (next.family.wealthStatus === "poor" && next.education.yearsStudied === 1) {
      if (!next.family.activeScholarships.some(s => s.type === "pemerintah")) {
        next.family.activeScholarships.push({
          id: `gov_${next.education.level}_${Date.now()}`,
          name: "Beasiswa Bantuan Pemerintah (KIP)",
          type: "pemerintah",
          coverage: "full",
          amount: 100,
          yearsLeft: 12
        });
        pushLog(next, "Kamu mendapatkan bantuan pendidikan gratis dari Pemerintah karena kondisi ekonomi keluarga.");
      }
    }

    // --- APPLY DISCOUNTS ---
    let totalDiscount = 0;
    next.family.activeScholarships.forEach(s => {
      if (s.coverage === "full") totalDiscount = yearlyFee;
      else if (s.coverage === "partial") totalDiscount += (yearlyFee * (s.amount / 100));
      else if (s.coverage === "fixed") totalDiscount += s.amount;
    });

    yearlyFee = Math.max(0, yearlyFee - totalDiscount);
    if (totalDiscount > 0) {
      pushLog(next, `Beasiswa memotong biaya sekolahmu sebesar Rp${totalDiscount.toLocaleString("id-ID")}.`);
    }

    next.family.savings -= yearlyFee;
    if (yearlyFee > 0) {
      pushLog(next, `Keluargamu membayar biaya sekolah sebesar Rp${yearlyFee.toLocaleString("id-ID")}.`);
    } else {
      pushLog(next, `Kamu bersekolah secara gratis tahun ini.`);
    }

    // Financial Crisis check
    const isBasicEdu = ["elementary", "junior_high"].includes(next.education.level);
    const debtLimit = isBasicEdu ? -10_000_000 : -(yearlyFee * 2);

    // If scholarship covers the fee (yearlyFee is 0), don't force DO for financial reasons
    if (yearlyFee > 0 && next.family.savings < debtLimit) {
      const updated = dropOutAction(next, "financial");
      Object.assign(next, updated);
      return next; 
    } else if (next.family.savings < 0) {
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

  // --- STATS BRACKETED DELTA (Legacy script.js lines 703-713) ---
  const randRange = (min, max) => Math.floor(rng() * max) + min;

  if (next.age <= 18) {
    next.stats = applyStatDelta(next.stats, {
      happy: randRange(-2, 5),
      health: randRange(-2, 5),
      smarts: randRange(-2, 5),
      looks: randRange(-2, 5),
    });
  } else if (next.age <= 40) {
    next.stats = applyStatDelta(next.stats, {
      happy: randRange(-2, 5),
      health: randRange(-2, 4),
      smarts: randRange(-2, 5),
      looks: randRange(-1, 5),
    });
  } else if (next.age <= 60) {
    next.stats = applyStatDelta(next.stats, {
      happy: randRange(-3, 6),
      health: randRange(-3, 5),
      smarts: randRange(-2, 5),
      looks: randRange(-3, 4),
    });
  } else if (next.age <= 80) {
    next.stats = applyStatDelta(next.stats, {
      happy: randRange(-4, 6),
      health: randRange(-4, 5),
      smarts: randRange(-2, 5),
      looks: randRange(-4, 4),
    });
  } else {
    next.stats = applyStatDelta(next.stats, {
      happy: randRange(-4, 6),
      health: randRange(-5, 5),
      smarts: randRange(-2, 4),
      looks: randRange(-6, 6),
    });
  }

  if (next.legal.inJail) {
    // EXPULSION LOGIC: If jailed while in school, they get expelled
    if (next.education.level !== "none") {
      const msgExpel = `Kamu dikeluarkan dari ${next.education.schoolName} karena harus menjalani masa hukuman di penjara.`;
      pushLog(next, msgExpel);
      pushNotification(next, { title: "Sekolah", message: msgExpel, icon: "error" });
      next.education.level = "none";
      next.education.yearsStudied = 0;

      // Scholarships are cancelled
      if (next.family.activeScholarships && next.family.activeScholarships.length > 0) {
        next.family.activeScholarships = [];
        const msg = "Semua beasiswa aktifmu telah dicabut karena pelanggaran perilaku.";
        pushLog(next, msg);
        pushNotification(next, { title: "Beasiswa", message: msg, icon: "warning" });
      }
    }

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
      // --- RETIREMENT LOGIC (Automatic at 60) ---
      if (next.age >= 60 && !next.career.isRetired) {
        const salaryWithBoost = computeYearlySalary(next, job);
        const pesangon = Math.floor(salaryWithBoost * next.career.yearsWorked * 0.5);
        const pensionYearly = Math.floor(salaryWithBoost * 0.3);
        
        next.money += pesangon;
        next.career.isRetired = true;
        next.career.pensionAmount = pensionYearly;
        next.career.jobId = null; // No longer employed
        
        pushLog(next, `Selamat! Kamu telah mencapai usia pensiun (60 tahun). Kamu berhenti bekerja sebagai ${job.name} dan menerima uang pesangon sebesar Rp${pesangon.toLocaleString("id-ID")}.`);
        pushNotification(next, {
          title: "Pensiun",
          message: `Kamu resmi pensiun! Nikmati masa tuamu dengan uang pensiun tahunan Rp${pensionYearly.toLocaleString("id-ID")}.`,
          icon: "success"
        });
      } else {
        // --- SALARY INCREASE (Legacy script.js line 2114) ---
        next.career.yearsWorked += 1;
        next.career.yearsInRole += 1;

        if (next.career.yearsWorked % 5 === 0) {
          const raise = 1.05 + rng() * 0.05;
          pushLog(next, `Kamu mendapat kenaikan gaji karena sudah bekerja selama ${next.career.yearsWorked} tahun!`);
        }

        // --- FIRING LOGIC ---
        let fired = false;
        let fireReason = "";

        if (next.flags.isDrugAttempted && job.id !== "petani") {
          fired = true;
          fireReason = "Gagal tes narkoba";
        } else if (next.stats.happy < 30 || next.stats.health < 30) {
          const performanceSensitive = ["firefighter", "police", "security", "garbage_collector"];
          if (performanceSensitive.includes(job.id)) {
            fired = true;
            fireReason = "Performa buruk (Kebahagiaan/Kesehatan rendah)";
          }
        }

        if (fired) {
          pushLog(next, `KABAR BURUK: Kamu dipecat dari pekerjaan sebagai ${job.name}. Alasan: ${fireReason}.`);
          next.career.jobId = null;
          next.career.yearsInRole = 0;
        } else {
          const salaryWithBoost = computeYearlySalary(next, job);
          grossIncome += salaryWithBoost;
          next.stats = applyStatDelta(next.stats, job.delta);
          pushLog(next, `Pendapatan kotor tahunan dari ${job.name}: Rp${salaryWithBoost.toLocaleString("id-ID")}.`);

          const promotionTarget = getPromotionTarget(next);
          if (promotionTarget) {
            otherEvents = true;
            const msg = `Promosi otomatis! Kamu naik menjadi ${promotionTarget.name}.`;
            next.career.jobId = promotionTarget.id;
            next.career.yearsInRole = 0;
            next.career.promotions += 1;
            pushLog(next, msg);
            pushNotification(next, { title: "Pekerjaan", message: msg, icon: "success" });
          }
        }
      }
    }
  }

  // --- 9.1 PENSION INCOME ---
  if (next.career.isRetired && next.career.pensionAmount > 0) {
    grossIncome += next.career.pensionAmount;
    pushLog(next, `Kamu menerima uang pensiun tahunan sebesar Rp${next.career.pensionAmount.toLocaleString("id-ID")}.`);
  }

  // --- 10. TAX & ECONOMY CALCULATION (Moved here for accuracy) ---
  if (next.profile.isIndependent) {
    const hasHouse = next.assets?.some(a => a.id === "small_house" || a.id === "luxury_house");
    let baseRent = (next.profile.livingWithParents || hasHouse) ? 0 : 7_000_000;
    let baseFoodMisc = 8_000_000;
    let playerExpenses = baseRent + baseFoodMisc + transportCost;

    // Taxes for player (based on total gross income including spouse)
    let playerTaxes = 0;
    if (grossIncome > 60_000_000) {
      playerTaxes = Math.floor((grossIncome - 60_000_000) * 0.05);
    }

    playerExpenses += playerTaxes;

    if (next.money < playerExpenses) {
      next.stats.happy -= 15;
      next.stats.health -= 5;
      pushLog(next, `Uangmu tidak cukup untuk membayar sewa kos dan makan! Kamu terpaksa berhutang dan makan seadanya.`);
      next.money = 0; 
    } else {
      next.money -= playerExpenses;
    }

    const report = `[Pengeluaran Pribadi] Pajak: Rp${playerTaxes.toLocaleString("id-ID")}, ${baseRent > 0 ? `Kos: Rp${baseRent.toLocaleString("id-ID")}, ` : ""}Makan: Rp${baseFoodMisc.toLocaleString("id-ID")}, Transport: Rp${transportCost.toLocaleString("id-ID")}`;
    pushLog(next, report);
  }

  // Lifestyle & Budgeting Logic
  const lifestyleNames = { hemat: "Hemat", normal: "Normal", mewah: "Mewah" };

  if (grossIncome > 0) {
    let expensesRatio = 0.5; // normal

    if (lifestyle === "hemat") {
      expensesRatio = 0.2;
    } else if (lifestyle === "mewah") {
      expensesRatio = 0.9;
    }

    const expenses = Math.floor(grossIncome * expensesRatio);
    const netIncome = grossIncome - expenses;
    next.money += netIncome;

    pushLog(next, `Dengan gaya hidup ${lifestyleNames[lifestyle]}, biaya hidupmu Rp${expenses.toLocaleString("id-ID")}. Sisa uang bersih yang ditabung: Rp${netIncome.toLocaleString("id-ID")}.`);
  } else if (next.age > 18 && next.money > 0 && !next.legal.inJail) {
    let expenses = 2000000;
    if (lifestyle === "mewah") expenses = 10000000;
    if (lifestyle === "hemat") expenses = 500000;

    expenses = Math.min(expenses, next.money);
    next.money -= expenses;
    next.stats = applyStatDelta(next.stats, { happy: -2 }); // Stres karena menguras tabungan
    pushLog(next, `Kamu tidak memiliki pendapatan tahun ini. Tabunganmu terkuras Rp${expenses.toLocaleString("id-ID")} untuk menyambung biaya hidup.`);
  }

  // Health progression
  if (next.healthStatus.condition !== "healthy") {
    // Spontaneous recovery for specific illnesses after 1 year (as per user request)
    const autoHeal = ["flu", "diarrhea", "cold", "coronavirus"];
    if (autoHeal.includes(next.healthStatus.illnessId) && next.healthStatus.untreatedYears >= 0) {
      const illness = getIllnessById(next.healthStatus.illnessId);
      const illnessName = illness ? illness.name : "penyakit";
      next.healthStatus.condition = "healthy";
      next.healthStatus.illnessId = null;
      next.healthStatus.severity = "mild";
      next.healthStatus.untreatedYears = 0;
      pushLog(next, `Saya sudah sembuh dari ${illnessName}.`);
    } else {
      applyIllnessProgression(next, rng);
      if (!next.life.isAlive) {
        pushLog(next, `Saya meninggal karena ${next.life.causeOfDeath}.`);
      } else if (next.healthStatus.condition !== "healthy") {
        pushLog(next, "Kondisi kesehatanmu memburuk karena belum ditangani.");
      }
    }
  }

  const isFatherAlive = next.relations.find(r => r.id === "father")?.isDead === false;
  const isMotherAlive = next.relations.find(r => r.id === "mother")?.isDead === false;
  const isAnyParentAlive = isFatherAlive || isMotherAlive;

  // --- PLAYER DEATH CHANCE (OLD AGE & HEALTH) ---
  if (next.life.isAlive && next.age >= 60) {
    const deathRoll = rng();
    
    // 1. Base Chance based on Age (Minimum risk at 100% health)
    let baseChance = 0.01; // 60-70
    if (next.age > 90) baseChance = 0.25;
    else if (next.age > 80) baseChance = 0.10;
    else if (next.age > 70) baseChance = 0.03;

    // 2. Health Modifier (Penalty for low health)
    // Formula: multiplier = 1 + (100 - health) / 25
    // If health 100 -> 1.0x
    // If health 50  -> 3.0x
    // If health 0   -> 5.0x
    const healthMod = 1 + ((100 - next.stats.health) / 25);
    
    // 3. Happiness Penalty (Sudden death if depressed)
    let happyPenalty = 0;
    if (next.stats.happy < 15) happyPenalty = 0.05;

    const totalDeathChance = (baseChance * healthMod) + happyPenalty;

    if (deathRoll < totalDeathChance) {
      next.life.isAlive = false;
      
      const deathCauses = [
        "meninggal karena sebab alamiah",
        "meninggal karena usia tua",
        "meninggal dunia saat tidur dengan tenang"
      ];
      
      if (next.stats.health < 30) {
        deathCauses.push("meninggal akibat kondisi kesehatan yang terus memburuk");
        deathCauses.push("meninggal setelah berjuang melawan komplikasi penyakit");
      }
      if (next.stats.happy < 15) {
        deathCauses.push("meninggal secara mendadak akibat kondisi mental yang sangat tertekan");
      }

      next.life.causeOfDeath = deathCauses[Math.floor(rng() * deathCauses.length)];
      pushLog(next, `Kamu ${next.life.causeOfDeath} pada usia ${next.age} tahun.`);
    }
  }

  if (next.stats.health <= 0 && next.life.isAlive) {
    next.life.isAlive = false;
    next.life.causeOfDeath = "Kesehatan kritis";
    pushLog(next, "Karakter meninggal karena kesehatan mencapai 0.");
  }

  // --- 4. MILESTONES & EDUCATION ---
  if (!next.legal.inJail && next.life.isAlive) {
    // Education Progression (Increment years and smarts for any active level)
    if (next.education.level !== "none") {
      const edu = educationCatalog.find(e => e.id === next.education.level) || (next.education.level === "university" ? { smartsPerYear: 5 } : null);
      if (edu) {
        next.education.yearsStudied += 1;
        next.stats.smarts = clamp(next.stats.smarts + (edu.smartsPerYear || 2));
      }
    }


    // Age 6: Start SD
    if (next.age === 6 && next.education.level === "none") {
      const num = Math.floor(rng() * 300) + 1;
      next.education.level = "elementary";
      next.education.yearsStudied = 0;
      next.education.schoolName = `SDN ${num} ${next.profile.city}`;

      pushLog(next, `Saya bersekolah di ${next.education.schoolName}.`);
      pushNotification(next, { title: "Sekolah", message: `Kamu bersekolah di ${next.education.schoolName}.`, icon: "info" });
    }
    // Age 12: Graduate SD -> Start SMP
    else if (next.age === 12 && (next.education.level === "elementary" || next.education.level === "none")) {
      if (next.education.level === "elementary") {
        next.education.completed.push("elementary");
        pushLog(next, `Lulus! Kamu telah menyelesaikan pendidikan di ${next.education.schoolName}.`);
      }
      let num = next.profile.city === "Jakarta" ? Math.floor(rng() * 295) + 1 : Math.floor(rng() * 9) + 1;
      next.education.level = "junior_high";
      next.education.yearsStudied = 0;
      next.education.schoolName = `SMPN ${num} ${next.profile.city}`;

      pushLog(next, `Saya bersekolah di ${next.education.schoolName}.`);
      pushNotification(next, { title: "Sekolah", message: `Kamu bersekolah di ${next.education.schoolName}.`, icon: "info" });
    }
    // Age 15: Graduate SMP -> Start SMA
    else if (next.age === 15 && (next.education.level === "junior_high" || next.education.level === "none")) {
      if (next.education.level === "junior_high") {
        next.education.completed.push("junior_high");
        pushLog(next, `Lulus! Kamu telah menyelesaikan pendidikan di ${next.education.schoolName}.`);
      }
      let sman = (rng() < 0.5 || next.stats.smarts < 25) ? "SMAN" : "SMKN";
      let num = next.profile.city === "Jakarta" ? Math.floor(rng() * (sman === "SMAN" ? 117 : 74)) + 1 : Math.floor(rng() * (sman === "SMAN" ? 5 : 3)) + 1;
      next.education.level = "high_school";
      next.education.yearsStudied = 0;
      next.education.schoolName = `${sman} ${num} ${next.profile.city}`;

      pushLog(next, `Saya bersekolah di ${next.education.schoolName}.`);
      pushNotification(next, { title: "Sekolah", message: `Kamu bersekolah di ${next.education.schoolName}.`, icon: "info" });
    }
    // Age 18: Graduate SMA (Decision Phase)
    // Age 18-22: Graduation SMA & Gap Year Decision Phase
    else if (next.age >= 18 && next.age <= 22 && next.education.level === "none" && !next.education.completed.includes("university")) {
      const isGraduationYear = next.age === 18;
      const title = isGraduationYear ? "Kelulusan SMA" : "Keputusan Masa Depan";
      const message = isGraduationYear 
        ? `Selamat! Kamu lulus dari SMA. Apa langkahmu selanjutnya?`
        : `Kamu masih dalam masa Gap Year. Apa rencanamu tahun ini?`;

      if (isGraduationYear) {
        next.education.completed.push("high_school");
        next.education.yearsStudied = 0;
        next.education.schoolName = "";
        next.family.isScholarshipActive = false;
      }

      pushNotification(next, {
        title,
        message,
        icon: isGraduationYear ? "success" : "question",
        type: "confirm",
        eventId: "graduation_sma",
        options: [
          { id: "ptn", label: "Ikut Seleksi PTN (Negeri)" },
          { id: "swasta", label: "Daftar Swasta (Langsung)" },
          { id: "job", label: "Cari Kerja & Mandiri" },
          { id: "gap_year", label: "Ambil Gap Year" }
        ],
        payload: {}
      });
    }
    // Age 17: SIM Test
    else if (next.age === 17) {
      pushNotification(next, {
        title: "Ujian SIM",
        message: "Dapet SIM?",
        icon: "question",
        type: "confirm",
        eventId: "sim_test",
        options: [
          { id: "yes", label: "Ya" },
          { id: "no", label: "Tidak" }
        ],
        payload: {}
      });
    }

    // University Progression & Graduation
    const eduEntry = educationCatalog.find(e => e.id === next.education.level);
    const isInUni = next.education.level === "university" || (next.education.level && (next.education.level.startsWith("university_") || next.education.level.startsWith("college_")));
    
    if (isInUni) {
      const yearsToComplete = eduEntry?.yearsToComplete || 4;

      if (!next.profile.isIndependent && isAnyParentAlive) {
        // Consolidated billing: yearlyFee already deducted in the block above
        if (yearlyFee > 0 && next.family.savings < -(yearlyFee * 2)) {
          const updated = dropOutAction(next, "financial");
          Object.assign(next, updated);
        }
      } else if (next.profile.isIndependent) {
        next.money -= yearlyFee;
        pushLog(next, `Saya membayar biaya pendidikan tahunan sebesar Rp${yearlyFee.toLocaleString("id-ID")}.`);
        
        if (yearlyFee > 0 && next.money < -(yearlyFee * 2)) {
          const updated = dropOutAction(next, "financial");
          Object.assign(next, updated);
        }
      }

      if (next.education.yearsStudied >= yearsToComplete) {
        otherEvents = true;
        next.education.completed.push(next.education.level);
        next.education.level = "none";
        next.education.yearsStudied = 0;
        next.stats.smarts += 10;
        
        const gradMsg = "Selamat! Kamu telah resmi menyandang gelar sarjana. Bagaimana rencana hidupmu selanjutnya?";
        pushLog(next, gradMsg);
        
        pushNotification(next, {
          title: "Kelulusan Universitas",
          message: gradMsg,
          icon: "success",
          type: "confirm",
          eventId: "graduation_university",
          options: [
            { id: "independent", label: "Hidup Mandiri (Pindah Keluar)" },
            { id: "with_parents", label: "Tinggal Bareng Ortu (Hemat Biaya)" }
          ]
        });
      }
    }
  }

  // --- 5. ASSET PURCHASES BY PARENTS ---
  if (!next.profile.isIndependent && !next.legal.inJail && next.life.isAlive && isAnyParentAlive) {
    if (!next.family.assets) next.family.assets = { motor: false, car: false };
    const { assets: famAssets, savings } = next.family;
    const rngVal = rng();
    if (next.family.wealthStatus === "poor") {
      if (!famAssets.motor && savings > 12_000_000 && rngVal < 0.10 && next.age > 4) {
        otherEvents = true;
        next.family.savings -= 8_000_000;
        next.family.assets.motor = true;
        const msg = `Orang tua ku membeli motor bekas agar bisa menghemat ongkos harian (Rp8.000.000).`;
        pushLog(next, msg);
        pushNotification(next, { title: "Kabar Baik", message: msg, icon: "success" });
      }
    } else {
      if (!famAssets.motor && !famAssets.car && savings > 40_000_000 && rngVal < 0.15 && next.age > 4) {
        otherEvents = true;
        const cost = next.family.wealthStatus === "rich" ? 65_000_000 : 25_000_000;
        next.family.savings -= cost;
        next.family.assets.motor = true;
        const msg = `Orang tua ku baru saja membeli motor baru untuk transportasi keluarga (Rp${cost.toLocaleString("id-ID")}).`;
        pushLog(next, msg);
        pushNotification(next, { title: "Kabar Baik", message: msg, icon: "success" });
      }
      const carThreshold = next.family.wealthStatus === "rich" ? 800_000_000 : 250_000_000;
      if (!famAssets.car && savings > carThreshold && rngVal < 0.10 && next.age > 6) {
        otherEvents = true;
        const cost = next.family.wealthStatus === "rich" ? 750_000_000 : 280_000_000;
        next.family.savings -= cost;
        next.family.assets.car = true;
        const dreamMsg = isFatherAlive ? "Impian Ayah akhirnya tercapai." : "Alhamdulillah, akhirnya kita punya mobil.";
        const msg = `Keluargaku baru saja membeli mobil baru! ${dreamMsg} (Rp${cost.toLocaleString("id-ID")}).`;
        pushLog(next, msg);
        pushNotification(next, { title: "Kabar Baik", message: msg, icon: "success" });
      }
    }
  }

  // --- 8. AGE UP LOG ---
  if (next.life.isAlive) {
    pushLog(next, `Kamu bertambah umur menjadi ${next.age} tahun.`);

    // --- 9. RELATIONS & FRIENDS (Death & Inheritance) ---
    next.relations = next.relations.map(rel => {
      if (rel.isDead) return rel;
      rel.age = (rel.age || next.age) + 1;

      // Death probability check
      const deathProb = rel.age < 18 ? 0.001 : rel.age < 45 ? 0.005 : rel.age < 65 ? 0.01 : rel.age < 75 ? 0.02 : rel.age < 85 ? 0.04 : rel.age < 90 ? 0.10 : 0.20;

      if (rng() < deathProb) {
        otherEvents = true;
        rel.isDead = true;

        // Stats penalty for death
        next.stats.happy = clamp(next.stats.happy - 50);

        let inheritanceMsg;
        const canInherit = ["father", "mother"].includes(rel.id) || ["spouse", "husband", "wife"].includes(rel.status);

        const firstName = rel.name ? rel.name.split(" ")[0] : "Keluarga";
        if (canInherit && rel.relationship > 30) {
          const mult = next.family.wealthStatus === "rich" ? 10 : next.family.wealthStatus === "poor" ? 0.2 : 1;
          const amount = Math.floor((rng() * 90_000_000 + 10_000_000) * mult);
          next.money += amount;
          next.stats.happy = clamp(next.stats.happy + 10);
          inheritanceMsg = `${rel.label}mu, ${firstName} sudah meninggal! Kamu diwariskan Rp${amount.toLocaleString("id-ID")}.`;
        }
        else {
          inheritanceMsg = `${rel.label}mu, ${firstName} sudah meninggal!`
        }
        pushLog(next, inheritanceMsg);

        // --- NEW: Income Reduction Logic ---
        if (rel.id === "father") {
          const oldIncome = next.family.monthlyIncome;
          next.family.monthlyIncome = Math.floor(next.family.monthlyIncome * 0.4); // Loss of 60%
          pushLog(next, `Ekonomi keluarga menurun drastis karena Bapak sudah tidak bekerja. (Pendapatan: Rp${next.family.monthlyIncome.toLocaleString("id-ID")}/bln)`);
        } else if (rel.id === "mother") {
          const oldIncome = next.family.monthlyIncome;
          next.family.monthlyIncome = Math.floor(next.family.monthlyIncome * 0.6); // Loss of 40%
          pushLog(next, `Ekonomi keluarga menurun karena Ibu sudah tidak bekerja. (Pendapatan: Rp${next.family.monthlyIncome.toLocaleString("id-ID")}/bln)`);
        }


        next.currentEvent = {
          id: "funeral_decision",
          label: "Kematian",
          summary: inheritanceMsg,
          isInteractive: true,
          options: [
            {
              id: "attend",
              label: "Hadiri Pemakaman",
              color: "blue"
            },
            {
              id: "ignore",
              label: "Abaikan Pemakaman"
            }
          ],
          payload: { relationId: rel.id, relationName: rel.name }
        };
      }
      return rel;
    });
  }

  // --- 9. NEW RELATIONSHIPS (School, Campus, & Workplace) ---
  const isInSchool = next.education.level && next.education.level !== "none";
  const hasJob = !!next.career.jobId;
  const friendChance = isInSchool ? 0.30 : (hasJob ? 0.25 : 0.10);

  if (next.age >= 6 && rng() < friendChance) {
    // Smart Gender Balancing: If player has too many of one gender, increase chance for the other
    const maleCount = next.relations.filter(r => r.gender === "male" && !r.isDead && r.status === "friend").length;
    const femaleCount = next.relations.filter(r => r.gender === "female" && !r.isDead && r.status === "friend").length;
    
    let genderChance = 0.5;
    if (maleCount > femaleCount + 2) genderChance = 0.8; // More likely to get female
    else if (femaleCount > maleCount + 2) genderChance = 0.2; // More likely to get male

    const gender = rng() < genderChance ? "female" : "male";
    const newName = generateRandomName(gender);
    
    let friendLabel = "Teman";
    if (isInSchool) {
      const isUni = next.education.level.startsWith("university_") || next.education.level.startsWith("college_");
      friendLabel = isUni ? "Teman Kampus" : "Teman Sekolah";
    } else if (hasJob) {
      friendLabel = "Rekan Kantor";
    }

    next.relations.push({
      id: `friend_${next.age}_${Date.now()}`,
      label: friendLabel,
      name: newName,
      age: next.age + (Math.floor(rng() * 5) - 2), // Friends around same age
      relationship: 45,
      support: 45,
      gender,
      status: "friend",
      lastInteractionAge: -1
    });

    pushLog(next, `Kamu berkenalan dengan ${friendLabel} baru bernama ${newName}.`);
  }

  // --- 10. FEATURE UNLOCKS (ABSOLUTE BOTTOM) ---
  if (next.age === 6) pushLog(next, "FITUR TERBUKA: Kamu sekarang sudah cukup umur untuk berteman. Menu [Hubungan] kini tersedia!");
  if (next.age === 10) pushLog(next, "FITUR TERBUKA: Kamu mulai menginginkan barang-barang pribadi. Menu [Aset] kini tersedia!");
  if (next.age === 12) pushLog(next, "FITUR TERBUKA: Kehidupan sosial dimulai. Kamu sekarang bisa ikut Ekstrakurikuler di menu Aktivitas!");
  if (next.age === 15) pushLog(next, "FITUR TERBUKA: Kamu sudah cukup besar untuk mencari uang saku sendiri. Menu [Karir] kini tersedia!");

  // --- 10b. SCRIPTED DISEASE: CORONAVIRUS (2020-2022) ---
  if (next.life.isAlive && next.healthStatus.condition === "healthy") {
    const currentYear = Number(next.profile.birthDate.year) + next.age;
    let covidChance = 0;
    if (currentYear === 2020) covidChance = 0.05;
    else if (currentYear === 2021) covidChance = 0.15;
    else if (currentYear === 2022) covidChance = 0.10;

    if (rng() < covidChance) {
      otherEvents = true;
      next.healthStatus.condition = "ill";
      next.healthStatus.illnessId = "coronavirus";
      next.healthStatus.severity = "severe";
      next.healthStatus.untreatedYears = 0;
      pushNotification(next, {
        title: "Penyakit",
        message: "Kamu terkena Coronavirus.",
        icon: "warning"
      });
      pushLog(next, "Saya didiagnosis menderita Coronavirus.");
    }
  }

  if (!otherEvents && next.life.isAlive) {
    triggerRandomEvent(next, rng);
    if (next.currentEvent && !next.currentEvent.payload) {
      next.currentEvent.payload = {};
    }
  }

  // --- 11. FAMILY EVENTS (Independent of otherEvents) ---
  if (!next.profile.isIndependent && next.life.isAlive && isAnyParentAlive) {
    // A. Masalah Rumah Tangga (Household Crisis)
    if (next.age >= 5 && next.age <= 18) {
      if (rng() < 0.08) {
        const repairs = [];
        if (isFatherAlive) {
          repairs.push({ msg: "Atap rumah kami bocor dan Ayah harus memanggil tukang untuk memperbaikinya.", cost: 2_500_000 });
          repairs.push({ msg: "Motor Bapak tiba-tiba mogok dan butuh servis besar agar bisa dipakai kerja lagi.", cost: 1_500_000 });
          repairs.push({ msg: "Pompa air di rumah mati, Bapak harus menggantinya dengan yang baru.", cost: 1_200_000 });
        }
        if (isMotherAlive) {
          repairs.push({ msg: "Pipa air di rumah kami pecah, Ibu sibuk membersihkan air yang menggenang.", cost: 800_000 });
        }
        // Possible double crisis (must be different events)
        const count = rng() < 0.2 ? 2 : 1;
        const availableRepairs = [...repairs];
        for (let i = 0; i < count; i++) {
          if (availableRepairs.length === 0) break;
          const idx = Math.floor(rng() * availableRepairs.length);
          const picked = availableRepairs.splice(idx, 1)[0];
          next.family.savings -= picked.cost;
          pushLog(next, picked.msg);
        }
      }
    }

    // B. Orang Tua Sakit (Parent Sick)
    const sicknessChance = next.family.wealthStatus === "poor" ? 0.08 : 0.04;
    ["Bapak", "Ibu"].forEach(person => {
      const isAlive = person === "Bapak" ? isFatherAlive : isMotherAlive;
      if (isAlive && rng() < sicknessChance) {
        let cost = 5_000_000;
        if (next.family.wealthStatus === "rich") cost = 35_000_000;
        if (next.family.wealthStatus === "poor") cost = 500_000;

        next.family.savings -= cost;
        next.stats.happy = clamp(next.stats.happy - 10);
        pushLog(next, `${person} ku jatuh sakit dan harus dirawat di rumah sakit. Beruntung ada BPJS sehingga biaya tidak terlalu mencekik.`);
      }
    });

    // C. Krisis Ekonomi (PHK) & Pemulihan Karier (Exclusive per year)
    let careerTriggered = false;
    // PHK
    if (!next.family.isBankrupt && next.family.wealthStatus !== "poor") {
      if (rng() < 0.03) {
        const availableParents = [];
        if (isFatherAlive) availableParents.push("Ayah");
        if (isMotherAlive) availableParents.push("Ibu");

        if (availableParents.length > 0) {
          careerTriggered = true;
          next.family.isBankrupt = true;
          next.family.monthlyIncome = 1_500_000;
          next.stats.happy = clamp(next.stats.happy - 25);
          const person = availableParents[Math.floor(rng() * availableParents.length)];
          pushLog(next, `${person} mu terkena PHK mendadak akibat perusahaannya bangkrut. Ekonomi keluargamu kini dalam krisis besar.`);
        }
      }
    }
    // Recovery (Only if PHK didn't happen this year)
    if (!careerTriggered && next.family.isBankrupt) {
      if (rng() < 0.15) {
        const availableParents = [];
        if (isFatherAlive) availableParents.push("Ayah");
        if (isMotherAlive) availableParents.push("Ibu");

        if (availableParents.length > 0) {
          next.family.isBankrupt = false;
          const isSerabutan = rng() > 0.4;
          const person = availableParents[Math.floor(rng() * availableParents.length)];
          if (isSerabutan) {
            next.family.monthlyIncome = 3_500_000;
            next.stats.happy = clamp(next.stats.happy + 10);
            pushLog(next, `${person} mu akhirnya mendapat pekerjaan baru, meski gajinya lebih kecil dari sebelumnya. Paling tidak keluarga kita bisa bernapas lega.`);
          } else {
            next.family.monthlyIncome = 8_000_000 + Math.floor(rng() * 5_000_000);
            next.stats.happy = clamp(next.stats.happy + 20);
            pushLog(next, `Kabar gembira! ${person} mu diterima bekerja di perusahaan besar dengan gaji yang mapan. Masa krisis telah berlalu.`);
          }
        }
      }
    }
  }

  return next;
}
