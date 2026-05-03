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
  const initialLogCount = next.logs ? next.logs.length : 0;

  if (!next.life.isAlive) {
    return next;
  }

  next.age += 1;
  const isStudentAtHome = next.profile.livingWithParents && next.education.level !== "none";

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

  // Childcare for Player's own children (Only for non-independent children)
  const myChildren = next.relations.filter(r => r.label === "Anak" && !r.isDead && !r.isIndependent);
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
      education: "Belum Sekolah",
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

  // --- 3.5 CHILD SCHOOLING MILESTONES ---
  next.relations = next.relations.map(rel => {
    if (rel.label !== "Anak" || rel.isDead) return rel;

    let schoolingFee = 0;
    let schoolLevel = "";

    if (rel.age === 6) { schoolingFee = 5_000_000; schoolLevel = "SD"; rel.education = "SD"; }
    else if (rel.age === 12) { schoolingFee = 10_000_000; schoolLevel = "SMP"; rel.education = "SMP"; }
    else if (rel.age === 15) { schoolingFee = 15_000_000; schoolLevel = "SMA"; rel.education = "SMA"; }
    else if (rel.age === 18) { schoolingFee = 50_000_000; schoolLevel = "Universitas"; rel.education = "Universitas"; }

    if (schoolingFee > 0) {
      if (lifestyle === "mewah") schoolingFee *= 5;
      else if (lifestyle === "hemat") schoolingFee *= 0.5;
      next.money -= schoolingFee;
      pushLog(next, `Tahun ini ${rel.name} (${rel.age} Th) mulai masuk ${schoolLevel}. Kamu membayar biaya pendaftaran sebesar Rp${schoolingFee.toLocaleString("id-ID")}.`);
    }

    if (!rel.education || rel.education === "Belum Sekolah") {
      if (rel.age >= 22) rel.education = "Lulus Kuliah";
      else if (rel.age >= 18) rel.education = "Universitas";
      else if (rel.age >= 15) rel.education = "SMA";
      else if (rel.age >= 12) rel.education = "SMP";
      else if (rel.age >= 6) rel.education = "SD";
      else rel.education = "Belum Sekolah";
    }
    return rel;
  });

  // --- 3.5.1 CHILD INDEPENDENCE CHECK ---
  next.relations = next.relations.map(rel => {
    if (rel.label === "Anak" && !rel.isDead && rel.age === 23 && !rel.isIndependent) {
      rel.isIndependent = true;
      rel.education = "Bekerja";

      // Decision: Stay at home vs Move out
      const staysAtHome = rng() < 0.40;
      rel.livingStatus = staysAtHome ? "stay_home" : "moved_out";

      const statusMsg = staysAtHome
        ? "memutuskan untuk tetap tinggal bersamamu sementara waktu."
        : "memutuskan untuk pindah rumah dan hidup mandiri sepenuhnya.";

      pushLog(next, `${rel.name} sudah dewasa dan ${statusMsg}`);
      pushNotification(next, {
        title: "Anak Mandiri",
        message: `${rel.name} sekarang sudah dewasa dan ${staysAtHome ? "tetap tinggal bersamamu" : "pindah rumah"}.`,
        icon: "info"
      });
    }
    return rel;
  });

  // --- 3.5.2 BAKTI ANAK (Contribution from children at home) ---
  const childrenAtHome = next.relations.filter(r => r.label === "Anak" && !r.isDead && r.isIndependent && r.livingStatus === "stay_home");
  childrenAtHome.forEach(child => {
    const contribution = 1_000_000 + (Math.floor(rng() * 3) * 1_000_000); // 1jt - 3jt
    next.money += contribution;
    pushLog(next, `${child.name} memberikan uang bakti sebesar Rp${contribution.toLocaleString("id-ID")} hasil dari kerjanya tahun ini.`);
  });

  // --- 3.5.3 GRANDCHILDREN LOGIC (Cucu) ---
  const adultChildren = next.relations.filter(r => r.label === "Anak" && !r.isDead && r.isIndependent && r.age >= 25);
  adultChildren.forEach(child => {
    // 10% chance per year to have a grandchild
    if (rng() < 0.10) {
      const grandchildGender = rng() > 0.5 ? "Laki-laki" : "Perempuan";
      const grandchildName = generateRandomName(grandchildGender === "Laki-laki" ? "male" : "female");

      next.relations.push({
        id: `grandchild_${Date.now()}_${Math.floor(rng() * 1000)}`,
        name: grandchildName,
        label: "Cucu",
        status: "grandchild",
        gender: grandchildGender === "Laki-laki" ? "M" : "F",
        age: 0,
        parentName: child.name,
        relationship: 80,
        bond: 80,
        support: 80,
        isDead: false,
        lastInteractionAge: -1
      });

      next.stats.happy = clamp(next.stats.happy + 20);
      pushLog(next, `Kabar Bahagia! ${child.name} baru saja dikaruniai seorang anak bernama ${grandchildName}. Kamu sekarang resmi menjadi Kakek/Nenek!`);
      pushNotification(next, {
        title: "Cucu Baru!",
        message: `Selamat! Kamu memiliki cucu baru bernama ${grandchildName}.`,
        icon: "success"
      });
    }
  });

  // --- 3.6 RANDOM CHILD EVENTS ---
  const schoolingChildren = myChildren.filter(c => c.age >= 6 && c.age <= 22);
  if (schoolingChildren.length > 0 && rng() < 0.10) {
    const targetChild = schoolingChildren[Math.floor(rng() * schoolingChildren.length)];
    const eventRoll = rng();

    if (eventRoll < 0.4) {
      // Sick
      const medicalCost = 2_000_000;
      next.money -= medicalCost;
      pushLog(next, `${targetChild.name} jatuh sakit dan harus dibawa ke dokter. Biaya pengobatan: Rp${medicalCost.toLocaleString("id-ID")}.`);
    } else if (eventRoll < 0.7) {
      // Achievement
      next.stats.happy = clamp(next.stats.happy + 10);
      pushLog(next, `Bangga sekali! ${targetChild.name} mendapatkan juara di sekolahnya. Ini membuatmu sangat bahagia.`);
    } else {
      // Request money/toy
      const toyCost = 500_000;
      next.money -= toyCost;
      pushLog(next, `${targetChild.name} merengek minta dibelikan mainan baru. Kamu tidak tega menolaknya. (-Rp${toyCost.toLocaleString("id-ID")})`);
    }
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
  if (!next.profile.isIndependent && next.profile.livingWithParents) {
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
    otherEvents = true; // Family support counts as an event

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
    const eduEntry = educationCatalog.find(e => e.id === next.education.level);
    yearlyFee = eduEntry ? (eduEntry.costPerYear || 0) : 0;

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
  if (next.age >= 6 && next.age <= 18 && !next.legal.inJail) {
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

      const isAnyParentAlive = next.relations.some(r => (r.id === "father" || r.id === "mother") && !r.isDead);

      if (next.age < 18) {
        if (isAnyParentAlive) {
          next.profile.livingWithParents = true;
          pushLog(next, "Keluargamu menjemputmu di depan lapas. Kamu pun pulang kembali ke rumah orang tuamu.");
        } else {
          // If orphan, return to the relative logic check (handled later in script or automatic)
          pushLog(next, "Kamu keluar dari penjara sebagai yatim piatu. Kamu harus mencari jalan hidupmu sendiri.");
        }
      } else {
        // Adult choice
        otherEvents = true; // Trigger choice
        pushNotification(next, {
          title: "Bebas dari Penjara",
          message: "Kamu telah menyelesaikan masa hukumanmu. Ke mana kamu akan pergi sekarang?",
          icon: "success",
          type: "confirm",
          eventId: "prison_release_choice",
          options: [
            { id: "parents", label: isAnyParentAlive ? "Kembali ke Rumah Orang Tua" : "Kembali ke Rumah Keluarga" },
            { id: "independent", label: "Hidup Mandiri (Cari Kos)" }
          ]
        });
      }
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

  // --- 9.2 SPOUSE DYNAMICS (Random Events) ---
  if (spouse && rng() < 0.15 && next.life.isAlive) {
    const eventRoll = rng();
    if (eventRoll < 0.4) {
      // Small Request
      const cost = next.family.wealthStatus === "rich" ? 15_000_000 : 2_000_000;
      if (next.money >= cost) {
        next.money -= cost;
        spouse.relationship = clamp(spouse.relationship + 10);
        pushLog(next, `${spouse.name} ingin membeli barang baru untuk rumah. Kamu memberikan Rp${cost.toLocaleString("id-ID")}. Pasanganmu senang.`);
      }
    } else if (eventRoll < 0.7) {
      // Conflict
      const happyLoss = 15;
      next.stats.happy = clamp(next.stats.happy - happyLoss);
      spouse.relationship = clamp(spouse.relationship - 10);
      pushLog(next, `Kamu bertengkar hebat dengan ${spouse.name} karena masalah sepele. Suasana rumah menjadi tegang.`);
    } else {
      // Anniversary / Sweet Moment
      next.stats.happy = clamp(next.stats.happy + 15);
      spouse.relationship = clamp(spouse.relationship + 15);
      pushLog(next, `Kamu dan ${spouse.name} merayakan momen spesial bersama. Kamu merasa sangat dicintai.`);
    }
  }

  // --- 9.3 CHILD EDUCATION EXPENSES ---
  if (next.profile.isIndependent && next.life.isAlive) {
    const children = next.relations.filter(r => (r.status === "child" || r.status === "grandchild") && !r.isDead);
    let totalChildSchoolFees = 0;

    children.forEach(child => {
      let fee = 0;
      let schoolLevel = "";

      if (child.age >= 7 && child.age <= 12) {
        schoolLevel = "SD";
        fee = lifestyle === "mewah" ? 45_000_000 : lifestyle === "normal" ? 5_000_000 : 500_000;
      } else if (child.age >= 13 && child.age <= 15) {
        schoolLevel = "SMP";
        fee = lifestyle === "mewah" ? 65_000_000 : lifestyle === "normal" ? 8_000_000 : 800_000;
      } else if (child.age >= 16 && child.age <= 18) {
        schoolLevel = "SMA";
        fee = lifestyle === "mewah" ? 90_000_000 : lifestyle === "normal" ? 12_000_000 : 1_200_000;
      } else if (child.age >= 19 && child.age <= 22) {
        schoolLevel = "Kuliah";
        fee = lifestyle === "mewah" ? 250_000_000 : lifestyle === "normal" ? 35_000_000 : 5_000_000;
      }

      if (fee > 0) {
        totalChildSchoolFees += fee;
        pushLog(next, `[Biaya Keluarga] Kamu membayar biaya pendidikan ${schoolLevel} untuk ${child.name} sebesar Rp${fee.toLocaleString("id-ID")}.`);
      }

      // --- NEW: Child Milestone Logs ---
      if (child.age === 12) pushLog(next, `🎉 Kabar Gembira! ${child.name} baru saja lulus dari Sekolah Dasar (SD).`);
      if (child.age === 15) pushLog(next, `🎉 Kebanggaan! ${child.name} resmi lulus dari SMP dan siap masuk SMA.`);
      if (child.age === 18) pushLog(next, `🎉 Selamat! ${child.name} telah menyelesaikan masa SMA-nya.`);
      if (child.age === 22) {
        pushLog(next, `🎓 Momen Haru! Kamu menghadiri wisuda ${child.name}. Dia kini telah menyandang gelar sarjana.`);
        child.education = "Sarjana"; // Custom field for info
      }

      // --- NEW: Child Independence (University Age) ---
      if (child.age === 19 && child.livingStatus !== "moved_out" && rng() < 0.4) {
        child.livingStatus = "moved_out";
        pushLog(next, `🏠 ${child.name} memutuskan untuk pindah ke kos-kosan dekat kampusnya agar bisa belajar hidup mandiri.`);
      }

      // --- NEW: Child Career Start (Post-University) ---
      if (child.age === 23) {
        pushLog(next, `💼 ${child.name} memberikan kabar bahwa dia sudah mendapatkan pekerjaan pertamanya. Dia sangat bersyukur atas dukunganmu selama ini.`);
      }

      // --- NEW: Child Giving Back (Random Gift from working child) ---
      if (child.age > 23 && rng() < 0.05) {
        const gift = 2_000_000 + Math.floor(rng() * 5_000_000);
        next.money += gift;
        pushLog(next, `🎁 ${child.name} mengirimkan uang sebesar Rp${gift.toLocaleString("id-ID")} sebagai tanda bakti dan terima kasih kepada orang tuanya.`);
      }
    });

    if (totalChildSchoolFees > 0) {
      next.money -= totalChildSchoolFees;
    }
  }

  // --- 9.4 FAMILY WEALTH STATUS UPDATE (Dynamic based on savings) ---
  if (next.family.savings < 10_000_000) {
    next.family.wealthStatus = "poor";
  } else if (next.family.savings < 500_000_000) {
    next.family.wealthStatus = "middle";
  } else {
    next.family.wealthStatus = "rich";
  }

  // --- 9.5 AUTO INDEPENDENCE CHECK ---
  if (next.age >= 18 && !next.profile.livingWithParents) {
    next.profile.isIndependent = true;
  }

  // --- 10. TAX & ECONOMY CALCULATION (Refactored for transparency) ---
  if (next.profile.isIndependent && !next.legal.inJail) {
    const hasHouse = next.assets?.some(a => a.id === "small_house" || a.id === "luxury_house");
    let baseRent = (next.profile.livingWithParents || hasHouse) ? 0 : 7_000_000;

    // Base survival costs
    let baseFoodMisc = 8_000_000;
    if (lifestyle === "mewah") baseFoodMisc = 25_000_000;
    else if (lifestyle === "hemat") baseFoodMisc = 3_000_000;

    let playerExpenses = baseRent + baseFoodMisc + transportCost;

    // Taxes (5% for income above 60jt)
    let playerTaxes = 0;
    if (grossIncome > 60_000_000) {
      playerTaxes = Math.floor((grossIncome - 60_000_000) * 0.05);
    }
    playerExpenses += playerTaxes;

    // Lifestyle Variable Costs (Savings vs Spending)
    let netSavings = 0;
    if (grossIncome > 0) {
      let lifestyleRatio = 0.5; // normal
      if (lifestyle === "hemat") lifestyleRatio = 0.2;
      else if (lifestyle === "mewah") lifestyleRatio = 0.9;

      const variableSpending = Math.floor(grossIncome * lifestyleRatio);
      netSavings = grossIncome - variableSpending;

      // Deduct fixed expenses from the net savings
      next.money += (netSavings - playerExpenses);

      pushLog(next, `Dengan gaya hidup ${lifestyle.toUpperCase()}, kamu menyisihkan Rp${netSavings.toLocaleString("id-ID")} dari pendapatan kotor.`);
    } else {
      // No income: Drain savings for fixed expenses
      next.money -= playerExpenses;
      next.stats.happy = clamp(next.stats.happy - 2);
      pushLog(next, `Kamu tidak memiliki pendapatan tahun ini. Seluruh biaya hidup diambil dari tabunganmu.`);
    }

    // Comprehensive Financial Report
    const report = `[Ekonomi Pribadi] Pajak: Rp${playerTaxes.toLocaleString("id-ID")}, ${baseRent > 0 ? `Kos: Rp${baseRent.toLocaleString("id-ID")}, ` : ""}Makan: Rp${baseFoodMisc.toLocaleString("id-ID")}, Transport: Rp${transportCost.toLocaleString("id-ID")}`;
    pushLog(next, report);

    if (next.money < 0) {
      next.stats.happy = clamp(next.stats.happy - 15);
      next.stats.health = clamp(next.stats.health - 5);
      pushLog(next, `PERINGATAN: Tabunganmu minus! Kamu terpaksa berhutang untuk menutupi biaya hidup.`);
    }
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
      const edu = educationCatalog.find(e => e.id === next.education.level) || 
                  (next.education.level.startsWith("university_") ? { id: next.education.level, smartsPerYear: 5, yearsToComplete: 4, name: "Universitas" } : 
                  (next.education.level === "university" ? { id: "university", smartsPerYear: 5, yearsToComplete: 4 } : null));
      if (edu) {
        // Randomize class group every year for SD and SMP only
        const isBasicSchool = ["elementary", "junior_high"].includes(next.education.level);
        if (isBasicSchool) {
          next.education.classGroup = ["A", "B", "C", "D", "E", "F", "G", "H"][Math.floor(rng() * 8)];
        } else {
          next.education.classGroup = ""; // No group for SMA/SMK/Uni
        }

        // Increment years and smarts
        next.education.yearsStudied += 1;
        next.stats.smarts = clamp(next.stats.smarts + (edu.smartsPerYear || 2));

        const isInUni = next.education.level.startsWith("university_") || next.education.level.startsWith("college_") || next.education.level === "university";
        if (isInUni) {
          pushLog(next, `Saya sedang menjalani tahun ke-${next.education.yearsStudied} kuliah (S1) di ${next.education.schoolName || "Universitas"}.`);
        } else if (next.education.level === "elementary") {
          pushLog(next, `Saya sekarang naik ke Kelas ${next.education.yearsStudied + 1}${next.education.classGroup || ""} di ${next.education.schoolName}.`);
        } else if (next.education.level === "junior_high") {
          pushLog(next, `Saya sekarang naik ke Kelas ${next.education.yearsStudied + 7}${next.education.classGroup || ""} di ${next.education.schoolName}.`);
        } else if (next.education.level === "sma" || next.education.level === "smk") {
          pushLog(next, `Saya sekarang naik ke Kelas ${next.education.yearsStudied + 10} di ${next.education.schoolName}.`);
        }

        // --- GRADUATION CHECK (After increment) ---
        if (next.education.yearsStudied >= edu.yearsToComplete) {
          const isPaket = next.education.level.startsWith("paket_");

          next.education.completed.push(next.education.level);
          const oldLevel = next.education.level;
          next.education.level = "none";
          next.education.yearsStudied = 0;
          next.stats.smarts = clamp(next.stats.smarts + 10);

          if (isInUni) {
            const gradMsg = "Selamat! Kamu telah resmi menyandang gelar sarjana (S1). Bagaimana rencana hidupmu selanjutnya?";
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
          } else if (oldLevel === "sma" || oldLevel === "smk" || oldLevel === "paket_c") {
            const isPaketC = oldLevel === "paket_c";
            const gradMsg = `Selamat! Kamu telah lulus ${isPaketC ? "Paket C" : oldLevel.toUpperCase()}. Ijazah setara ${isPaketC ? "SMA" : oldLevel.toUpperCase()} kini ada di tanganmu.`;
            pushLog(next, gradMsg);

            pushNotification(next, {
              title: isPaketC ? "Lulus Paket C" : `Lulus ${oldLevel.toUpperCase()}`,
              message: "Selamat! Kamu telah menyelesaikan masa pendidikan menengah. Pilih langkahmu selanjutnya untuk masa depan.",
              icon: "success",
              type: "confirm",
              eventId: "graduation_path_selection",
              options: [
                { id: "snbp", label: "Ikut Jalur SNBP (Prestasi)", color: "green" },
                { id: "snbt", label: next.age <= 25 ? "Ikut Jalur SNBT (UTBK)" : "UTBK (Hanya < 25 thn)", color: "blue", disabled: next.age > 25 },
                { id: "mandiri", label: "Daftar Jalur Mandiri (PTN)", color: "orange" },
                { id: "swasta", label: "Daftar Kampus Swasta", color: "purple" },
                { id: "terbuka", label: "Universitas Terbuka (UT)", color: "cyan" },
                { id: "work", label: "Langsung Cari Kerja", color: "gray" }
              ]
            });
          } else if (oldLevel === "junior_high") {
            const sman = (rng() < 0.5 || next.stats.smarts < 25) ? "SMAN" : "SMKN";
            const num = next.profile.city === "Jakarta" ? Math.floor(rng() * (sman === "SMAN" ? 117 : 74)) + 1 : Math.floor(rng() * (sman === "SMAN" ? 5 : 3)) + 1;
            next.education.level = sman === "SMAN" ? "sma" : "smk";
            next.education.yearsStudied = 0;
            next.education.schoolName = `${sman} ${num} ${next.profile.city}`;
            const gradMsg = `Selamat! Kamu lulus SMP dan melanjutkan ke ${next.education.schoolName}.`;
            pushLog(next, gradMsg);
            pushNotification(next, { title: "Lulus SMP", message: gradMsg, icon: "success" });
          } else if (isPaket) {
            const paketType = oldLevel.split("_")[1].toUpperCase();
            const gradMsg = `Selamat! Kamu telah lulus ${edu.name}. Kini kamu memegang ijazah setara ${paketType === "B" ? "SMP" : "SMA"}.`;
            pushLog(next, gradMsg);
            pushNotification(next, { title: "Kelulusan Kejar Paket", message: gradMsg, icon: "success" });
          }
        }
      }
    }


    // Age 6: Start SD
    if (next.age === 6 && next.education.level === "none") {
      const num = Math.floor(rng() * 300) + 1;
      const classGroup = ["A", "B", "C", "D", "E", "F", "G", "H"][Math.floor(rng() * 8)];
      next.education.level = "elementary";
      next.education.yearsStudied = 0;
      next.education.classGroup = classGroup;
      next.education.schoolName = `SDN ${num} ${next.profile.city}`;

      pushLog(next, `Saya bersekolah di ${next.education.schoolName}.`);
      pushNotification(next, { title: "Sekolah", message: `Kamu bersekolah di ${next.education.schoolName}.`, icon: "info" });
    }
    // Milestone: Graduate SD -> Start SMP
    else if ((next.age >= 12 && next.education.level === "elementary" && next.education.yearsStudied >= 6) ||
      (next.age >= 12 && next.age < 15 && next.education.level === "none" && !next.education.completed.includes("junior_high") && next.education.completed.includes("elementary"))) {
      if (next.education.level === "elementary") {
        if (!next.education.completed.includes("elementary")) {
          next.education.completed.push("elementary");
        }
        pushLog(next, `Lulus! Kamu telah menyelesaikan pendidikan di ${next.education.schoolName}.`);
      }
      let num = next.profile.city === "Jakarta" ? Math.floor(rng() * 295) + 1 : Math.floor(rng() * 9) + 1;
      const classGroup = ["A", "B", "C", "D", "E", "F", "G", "H"][Math.floor(rng() * 8)];
      next.education.level = "junior_high";
      next.education.yearsStudied = 0;
      next.education.classGroup = classGroup;
      next.education.schoolName = `SMPN ${num} ${next.profile.city}`;

      pushLog(next, `Saya bersekolah di ${next.education.schoolName}.`);
      pushNotification(next, { title: "Sekolah", message: `Kamu bersekolah di ${next.education.schoolName}.`, icon: "info" });
    }
    // Milestone: Graduate SMP -> Start SMA
    else if ((next.age >= 15 && next.education.level === "junior_high" && next.education.yearsStudied >= 3) ||
      (next.age >= 15 && next.age < 18 && next.education.level === "none" && !next.education.completed.includes("sma") && !next.education.completed.includes("smk") && next.education.completed.includes("junior_high"))) {
      if (next.education.level === "junior_high") {
        if (!next.education.completed.includes("junior_high")) {
          next.education.completed.push("junior_high");
        }
        pushLog(next, `Lulus! Kamu telah menyelesaikan pendidikan di ${next.education.schoolName}.`);
      }
      let sman = (rng() < 0.5 || next.stats.smarts < 25) ? "SMAN" : "SMKN";
      let num = next.profile.city === "Jakarta" ? Math.floor(rng() * (sman === "SMAN" ? 117 : 74)) + 1 : Math.floor(rng() * (sman === "SMAN" ? 5 : 3)) + 1;
      next.education.level = sman === "SMAN" ? "sma" : "smk";
      next.education.yearsStudied = 0;
      next.education.classGroup = ""; // No group for SMA/SMK
      next.education.schoolName = `${sman} ${num} ${next.profile.city}`;

      pushLog(next, `Saya bersekolah di ${next.education.schoolName}.`);
      pushNotification(next, { title: "Sekolah", message: `Kamu bersekolah di ${next.education.schoolName}.`, icon: "info" });
    }
    // Milestone: Graduate SMA (Decision Phase)
    else if ((next.age >= 18 && (next.education.level === "sma" || next.education.level === "smk") && next.education.yearsStudied >= 3) ||
      (next.age >= 18 && next.age <= 22 && next.education.level === "none" && !next.education.completed.includes("university") && (next.education.completed.includes("sma") || next.education.completed.includes("smk")))) {
      const isGraduationYear = next.education.level === "sma" || next.education.level === "smk";
      const eduName = isGraduationYear ? (next.education.level === "sma" ? "SMA" : "SMK") : "Sekolah Menengah";
      const title = isGraduationYear ? `Kelulusan ${eduName}` : "Keputusan Masa Depan";
      const message = isGraduationYear
        ? `Selamat! Kamu lulus dari ${eduName}. Apa langkahmu selanjutnya?`
        : `Kamu masih dalam masa Gap Year. Apa rencanamu tahun ini?`;

      if (isGraduationYear) {
        if (!next.education.completed.includes(next.education.level)) {
          next.education.completed.push(next.education.level);
        }
        next.education.graduationYear = Number(next.profile.birthDate.year) + next.age;
        next.education.yearsStudied = 0;
        next.education.schoolName = "";
        next.education.level = "none"; // Official graduation
        next.family.isScholarshipActive = false;
      }

      // PTN Eligibility Check (Max 2 years after graduation)
      const currentYear = Number(next.profile.birthDate.year) + next.age;
      const yearsSinceGrad = currentYear - (next.education.graduationYear || 0);
      const canApplyPTN = yearsSinceGrad <= 2 && (next.education.completed.includes("sma") || next.education.completed.includes("smk"));

      const availableOptions = [
        { id: "swasta", label: "Daftar Swasta (Langsung)" },
        { id: "job", label: isAnyParentAlive ? "Cari Kerja & Mandiri" : "Cari Kerja" },
        { id: "gap_year", label: "Ambil Gap Year" }
      ];

      if (canApplyPTN) {
        availableOptions.unshift({ id: "ptn", label: "Ikut Seleksi PTN (Negeri)" });
      }

      pushNotification(next, {
        title,
        message,
        icon: isGraduationYear ? "success" : "question",
        type: "confirm",
        eventId: "graduation_sma",
        options: availableOptions,
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
        eventId: "driving_test",
        options: [
          { id: "yes", label: "Ya" },
          { id: "no", label: "Tidak" }
        ],
        payload: {}
      });
    }

    // --- 4.1 EDUCATION PROGRESSION & GRADUATION ---
    const eduEntry = educationCatalog.find(e => e.id === next.education.level);
    const isPaket = next.education.level?.startsWith("paket_");
    const isInUni = next.education.level === "university" || (next.education.level && (next.education.level.startsWith("university_") || next.education.level.startsWith("college_")));

    if (eduEntry) {
      const yearsToComplete = eduEntry.yearsToComplete;

      // Handle Tuition/Fees for Independent/Adult students (Kejar Paket/Uni)
      if (isInUni || isPaket) {
        if (!next.profile.isIndependent && isAnyParentAlive) {
          if (yearlyFee > 0 && next.family.savings < -(yearlyFee * 2)) {
            const updated = dropOutAction(next, "financial");
            Object.assign(next, updated);
          }
        } else if (next.profile.isIndependent) {
          next.money -= yearlyFee;
          if (yearlyFee > 0) pushLog(next, `Saya membayar biaya pendidikan tahunan sebesar Rp${yearlyFee.toLocaleString("id-ID")}.`);

          if (yearlyFee > 0 && next.money < -(yearlyFee * 2)) {
            const updated = dropOutAction(next, "financial");
            Object.assign(next, updated);
          }
        }
      }

      // Graduation check handled at the top of education progression section
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


  // --- 9. RELATIONS & FRIENDS (Death & Inheritance) ---
  next.relations = next.relations.map(rel => {
    if (rel.isDead) return rel;
    // rel.age is already incremented at the top of ageUpYear in section 1.1

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

  // --- 9.1 ORPHAN CHECK (Automatic vs Relative Support) ---
  const isFatherDead = next.relations.find(r => r.id === "father")?.isDead === true;
  const isMotherDead = next.relations.find(r => r.id === "mother")?.isDead === true;

  if (isFatherDead && isMotherDead && !next.profile.isIndependent) {
    if (next.age >= 18) {
      // Adult: Automatic Independence
      next.profile.isIndependent = true;
      next.profile.livingWithParents = false;
      const orphanMsg = "Sangat menyedihkan, kini kedua orang tuamu telah tiada. Kamu harus hidup mandiri dan berjuang sendiri demi masa depanmu.";
      pushLog(next, orphanMsg);
      pushNotification(next, {
        title: "Duka Mendalam",
        message: "Kedua orang tuamu telah meninggal. Kamu kini resmi hidup mandiri.",
        icon: "info"
      });
    } else {
      // Underage: Trigger Adoption/Relative Choice
      otherEvents = true; // Block other random events
      pushNotification(next, {
        title: "Tragedi Keluarga",
        message: "Kedua orang tuamu telah tiada. Sebagai anak di bawah umur, apa yang akan kamu lakukan?",
        icon: "error",
        type: "confirm",
        eventId: "orphan_crisis",
        options: [
          { id: "relative", label: "Ikut Keluarga Besar (Paman/Bibi)" },
          { id: "street", label: "Hidup di Jalanan (Mandiri)" }
        ]
      });
    }
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

  const hasNewLogs = (next.logs ? next.logs.length : 0) > initialLogCount;
  if (!hasNewLogs && !next.currentEvent && next.life.isAlive) {
    pushLog(next, `Kamu bertambah umur menjadi ${next.age} tahun.`);
  }

  return next;
}
