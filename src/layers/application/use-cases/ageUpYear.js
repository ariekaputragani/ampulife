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
  next.legal.crimeAttemptsThisYear = 0;
  next.legal.isCaughtThisYear = false;
  next.healthStatus.treatmentCount = 0;

  let grossIncome = 0;

  // --- DYNAMIC WEALTH & PHK LOGIC ---
  if (next.family.isBankrupt) {
    // Survival mode income
    next.family.monthlyIncome = 1_500_000;
  }

  // Dynamic Wealth Status evaluation
  const { savings: famSavings, monthlyIncome: famIncome } = next.family;
  if (famSavings > 500_000_000 && famIncome > 20_000_000) {
    next.family.wealthStatus = "rich";
  } else if (famSavings < 50_000_000 && famIncome < 5_000_000) {
    next.family.wealthStatus = "poor";
  } else if (famSavings >= 50_000_000 && famIncome >= 5_000_000) {
    next.family.wealthStatus = "middle";
  }

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
  let lifestyleMult = 1.0;
  const lifestyle = next.financial.lifestyle || "normal";

  if (lifestyle === "hemat") {
    lifestyleMult = 0.8;
    next.stats.happy = clamp(next.stats.happy - 4);
  } else if (lifestyle === "mewah") {
    lifestyleMult = 1.6;
    next.stats.happy = clamp(next.stats.happy + 8);
  }

  const expenseRatio = next.family.wealthStatus === "poor" ? 0.75 : next.family.wealthStatus === "middle" ? 0.6 : 0.35;
  const basicExpenses = Math.floor(yearlyIncome * expenseRatio * lifestyleMult);

  // --- CHILDCARE COSTS (Player's Needs) ---
  let childcareCost = 0;
  if (next.age <= 4) childcareCost = 4_000_000;
  else if (next.age <= 12) childcareCost = 2_000_000;
  else if (next.age <= 18) childcareCost = 5_000_000;

  // Scale childcare cost by wealth (Rich families spend way more)
  if (next.family.wealthStatus === "rich") childcareCost *= 15;
  else if (next.family.wealthStatus === "middle") childcareCost *= 2.5;
  else if (next.family.wealthStatus === "poor") childcareCost *= 0.25; // Massive subsidy/family care

  // Apply lifestyle impact to childcare as well
  childcareCost = Math.floor(childcareCost * lifestyleMult);

  // --- TRANSPORTATION COSTS ---
  const assets = next.family.assets || { motor: false, car: false }; // Fallback for old saves
  let transportCost = 3_000_000; // Default: Public transport

  if (next.family.wealthStatus === "poor") transportCost = 1_200_000; // Use cheaper options/walking

  if (assets.car) {
    transportCost = next.family.wealthStatus === "rich" ? 45_000_000 : 15_000_000;
  } else if (assets.motor) {
    transportCost = 1_500_000; // More efficient than public transport
  }

  // --- TOTAL DEDUCTION & INDEPENDENCE LOGIC ---
  let eventCost = 0;

  if (!next.profile.isIndependent) {
    const totalDeduction = taxes + basicExpenses + childcareCost + transportCost;
    next.family.savings += (yearlyIncome - totalDeduction);

    // --- TRIGGER RANDOM EVENT (Before report to capture costs) ---
    const savingsBeforeEvent = next.family.savings;
    triggerRandomEvent(next, rng);
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
  } else {
    // Independent Player Economy
    let playerExpenses = 15_000_000 + transportCost; // Base kos + makan + transport

    // Taxes for player
    let playerTaxes = 0;
    if (grossIncome > 60_000_000) {
      playerTaxes = Math.floor((grossIncome - 60_000_000) * 0.05);
    }

    playerExpenses += playerTaxes;

    if (next.money < playerExpenses) {
      next.stats.happy -= 15;
      next.stats.health -= 5;
      pushLog(next, `Uangmu tidak cukup untuk membayar sewa kos dan makan! Kamu terpaksa berhutang dan makan seadanya.`);
      next.money = 0; // or negative if we allow debt
    } else {
      next.money -= playerExpenses;
    }

    triggerRandomEvent(next, rng);

    const report = `[Pengeluaran Pribadi] Pajak: Rp${playerTaxes.toLocaleString("id-ID")}, Kos/Makan/Transport: Rp${playerExpenses.toLocaleString("id-ID")}`;
    pushLog(next, report);
  }

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
    let yearlyFee = costConfig ? costConfig[next.family.wealthStatus] : 0;

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
        pushLog(next, "✨ Kamu mendapatkan bantuan pendidikan gratis dari Pemerintah karena kondisi ekonomi keluarga.");
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
      pushLog(next, `Keluargamu membayar biaya sekolah ${next.education.level} sebesar Rp${yearlyFee.toLocaleString("id-ID")}.`);
    } else {
      pushLog(next, `Kamu bersekolah ${next.education.level} secara gratis tahun ini.`);
    }

    // 3. Family Asset Purchase (Chance-based)
    if (!next.family.assets) next.family.assets = { motor: false, car: false };
    const { assets: famAssets, savings } = next.family;
    const rngVal = rng();

    // Logic for POOR (Used Motor only)
    if (next.family.wealthStatus === "poor") {
      if (!famAssets.motor && savings > 12_000_000 && rngVal < 0.10 && next.age > 4) {
        const motorCost = 8_000_000;
        next.family.savings -= motorCost;
        next.family.assets.motor = true;
        pushLog(next, `Orang tua ku membeli motor bekas agar bisa menghemat ongkos harian (Rp${motorCost.toLocaleString("id-ID")}).`);
      }
    } else {
      // Logic for Middle & Rich
      // Buy Motor (if none and savings > 40M)
      if (!famAssets.motor && !famAssets.car && savings > 40_000_000 && rngVal < 0.15 && next.age > 4) {
        const motorCost = next.family.wealthStatus === "rich" ? 65_000_000 : 25_000_000;
        next.family.savings -= motorCost;
        next.family.assets.motor = true;
        pushLog(next, `Orang tua ku baru saja membeli motor baru untuk transportasi keluarga (Rp${motorCost.toLocaleString("id-ID")}).`);
      }

      // Buy Car (if none and savings > threshold)
      const carThreshold = next.family.wealthStatus === "rich" ? 800_000_000 : 250_000_000;
      if (!famAssets.car && savings > carThreshold && rngVal < 0.10 && next.age > 6) {
        const carCost = next.family.wealthStatus === "rich" ? 750_000_000 : 280_000_000;
        next.family.savings -= carCost;
        next.family.assets.car = true;
        pushLog(next, `Keluargaku baru saja membeli mobil baru! Impian Ayah akhirnya tercapai. (Rp${carCost.toLocaleString("id-ID")}).`);
      }
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
    // EXPULSION LOGIC: If jailed while in school, they get expelled
    if (next.education.level !== "none") {
      pushLog(next, `🚨 Kamu DIKELUARKAN dari sekolah ${next.education.level} karena harus menjalani masa hukuman di penjara.`);
      next.education.level = "none";
      next.education.yearsStudied = 0;

      // Scholarships are cancelled
      if (next.family.activeScholarships && next.family.activeScholarships.length > 0) {
        next.family.activeScholarships = [];
        pushLog(next, "Semua beasiswa aktifmu telah dicabut karena pelanggaran perilaku.");
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

          if (next.education.level === "university") {
            next.profile.isIndependent = true; // Lulus kuliah = wajib mandiri
          }

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

  // Feature Unlocks
  if (next.age === 7) {
    pushLog(next, "FITUR TERBUKA: Kamu sekarang bisa mencari Beasiswa di menu Aktivitas!");
  } else if (next.age === 12) {
    pushLog(next, "FITUR TERBUKA: Kehidupan sosial dimulai. Kamu sekarang bisa ikut Ekstrakurikuler di menu Aktivitas!");
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

  // --- PLAYER DEATH CHANCE (OLD AGE) ---
  // Normalizing life expectancy as per legacy script.js (lines 715-738)
  if (next.life.isAlive && next.age >= 60) {
    const deathRoll = rng();
    let deathChance = 0;
    if (next.age < 65) deathChance = 0.01;
    else if (next.age < 75) deathChance = 0.02;
    else if (next.age < 85) deathChance = 0.04;
    else if (next.age < 90) deathChance = 0.10;
    else deathChance = 0.20;

    if (deathRoll < deathChance) {
      next.life.isAlive = false;
      const deathCauses = [
        "meninggal karena sebab alamiah",
        "meninggal karena usia tua",
        "meninggal dunia saat tidur dengan tenang"
      ];
      next.life.causeOfDeath = deathCauses[Math.floor(rng() * deathCauses.length)];
      pushLog(next, `🪦 Kamu ${next.life.causeOfDeath} pada usia ${next.age} tahun.`);
    }
  }

  if (next.stats.health <= 0 && next.life.isAlive) {
    next.life.isAlive = false;
    next.life.causeOfDeath = "Kesehatan kritis";
    pushLog(next, "Karakter meninggal karena kesehatan mencapai 0.");
  }

  // --- RELATIONSHIP AGE & DEATHS ---
  next.relations = next.relations.map(rel => {
    if (rel.isDead) return rel;

    // Advance relation age
    rel.age = (rel.age || next.age) + 1;

    // Roll for death based on relation's age (Legacy logic 812-869)
    const relDeathRoll = rng();
    let relDeathChance = 0;
    if (rel.age < 65) relDeathChance = 0.01;
    else if (rel.age < 75) relDeathChance = 0.02;
    else if (rel.age < 85) relDeathChance = 0.04;
    else if (rel.age < 90) relDeathChance = 0.10;
    else relDeathChance = 0.20;

    if (relDeathRoll < relDeathChance) {
      rel.isDead = true;
      const relCauses = [
        "meninggal karena sebab alamiah",
        "meninggal karena usia tua",
        "meninggal dunia saat tidur dengan tenang"
      ];
      const finalCause = relCauses[Math.floor(rng() * relCauses.length)];
      
      pushLog(next, `🕯️ Kabar duka: ${rel.label} mu, ${rel.name}, ${finalCause} pada usia ${rel.age} tahun.`);
      next.stats.happy = Math.max(0, next.stats.happy - 25);
    } else {
      // Natural bond drift
      if (rel.status !== "family") {
        rel.relationship = Math.max(0, rel.relationship - 3);
      } else {
        rel.relationship = Math.min(100, Math.max(0, rel.relationship + (rng() > 0.6 ? 1 : -1)));
      }
    }
    return rel;
  }).filter(rel => {
    if (!rel.isDead && rel.status !== "family" && rel.relationship <= 0) {
      pushLog(next, `Kamu kehilangan kontak dengan ${rel.name} karena sudah terlalu lama tidak mengobrol.`);
      return false;
    }
    return true;
  });

  // Generate new friends at school milestones
  if ([6, 12, 15].includes(next.age)) {
    const isMale = rng() > 0.5;
    const namesM = ["Ade", "Adib", "Adit", "Aditya", "Agung", "Agus", "Ahmad", "Akbar", "Alamsyah",
      "Alif", "Ammar", "Ardi", "Arya", "Bayu", "Bimo", "Budi", "Danis", "Dedi",
      "Deni", "Didi", "Diaz", "Edi", "Eko", "Fadil", "Fajar", "Faozan", "Farhan",
      "Fauzan", "Fiki", "Gilang", "Gunawan", "Hendra", "Heru", "Hidayat", "Ilham",
      "Indra", "Irfan", "Iwan", "Joko", "Kevin", "Kurniawan", "Lukman", "Lutfi",
      "Maulana", "Mei", "Miko", "Muhammad", "Nizar", "Nova", "Novan", "Nugroho",
      "Oktavian", "Praditya", "Rafi", "Rian", "Rizky", "Rudi", "Rudy", "Salman",
      "Santoso", "Satria", "Setiawan", "Setya", "Slamet", "Suherman", "Surya",
      "Syafik", "Taufik", "Tito", "Tono", "Tubagus", "Vandi", "Veri", "Wahyu",
      "Wisnu", "Yusuf", "Zikri"];
    const namesF = ["Adinda", "Adiratna", "Aisyah", "Alya", "Amalia", "Amisha", "Angkasa", "Ani",
      "Anita", "Annisa", "Astuti", "Aulia", "Ayu", "Bella", "Budiwati", "Bulan",
      "Cahya", "Cindy", "Citra", "Defi", "Dewi", "Diah", "Dian", "Dina", "Dinda",
      "Dini", "Eka", "Elok", "Endah", "Eva", "Fani", "Farah", "Fitri", "Gemi",
      "Gita", "Guritno", "Hana", "Harum", "Icha", "Imelda", "Indah", "Intan",
      "Inten", "Irene", "Jayachandra", "Kartini", "Kemala", "Kemuning", "Kezia",
      "Kristiyana", "Lani", "Legi", "Lestari", "Lia", "Lusi", "Maharani", "Maria",
      "Marshanda", "Mawar", "Maya", "Mega", "Melati", "Mentari", "Merpati",
      "Misrina", "Murni", "Mustika", "Nabila", "Nadira", "Nadya", "Nanda", "Ndari",
      "Ningrat", "Ningrum", "Ningsih", "Nisa", "Nisi", "Nisrina", "Nova", "Novalia",
      "Novi", "Novia", "Novita", "Nur", "Nurul", "Permata", "Pertiwi", "Puji",
      "Puspita", "Putri", "Rani", "Rara", "Ratih", "Ratu", "Rika", "Rina", "Rini",
      "Sarah", "Sari", "Sarwendah", "Sella", "Setiawati", "Shinta", "Siska",
      "Siti", "Sri", "Susil", "Syifa", "Taman", "Tasya", "Tika", "Utama", "Vania",
      "Vina", "Wangi", "Wati", "Wening", "Wulan", "Yuni"];
    const newName = isMale ? namesM[Math.floor(rng() * namesM.length)] : namesF[Math.floor(rng() * namesF.length)];

    next.relations.push({
      id: `friend_${next.age}_${Date.now()}`,
      label: "Teman Sekolah",
      name: newName,
      age: next.age, // Seumuran
      relationship: 45,
      gender: isMale ? "male" : "female",
      status: "friend",
      lastInteractionAge: -1
    });
    pushLog(next, `Kamu berkenalan dengan teman baru bernama ${newName} di sekolah.`);
  }

  // --- FEATURE UNLOCK NOTIFICATIONS ---
  if (next.age === 5) {
    pushLog(next, "✨ FITUR TERBUKA: Kamu sekarang sudah cukup umur untuk berteman. Menu [Hubungan] kini tersedia!");
  } else if (next.age === 6) {
    pushLog(next, "🎒 FITUR TERBUKA: Waktunya sekolah! Menu [Aktivitas] kini tersedia untuk eksplorasi harian.");
  } else if (next.age === 10) {
    pushLog(next, "🎮 FITUR TERBUKA: Kamu mulai menginginkan barang-barang pribadi. Menu [Aset] kini tersedia!");
  } else if (next.age === 15) {
    pushLog(next, "💼 FITUR TERBUKA: Kamu sudah cukup besar untuk mencari uang saku sendiri. Menu [Karir] kini tersedia!");
  }

  // --- PROACTIVE EDUCATION REMINDER ---
  if (next.age > 18 && next.education.level === "none" && !next.education.completed.includes("high_school") && !next.legal.inJail) {
    const yearsSinceDropout = next.age - 18;
    if (yearsSinceDropout % 5 === 0) {
      pushLog(next, "💡 TIPS: Kamu belum memiliki ijazah SMA. Cek menu [Pendidikan] untuk mengambil Program Paket C agar bisa melamar pekerjaan yang lebih baik.");
    }
  }

  return next;
}
