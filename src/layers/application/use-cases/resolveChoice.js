import { cloneState, pushLog, clamp, clampStatus, pushNotification } from "@/layers/domain/entities/stateUtils";
import { jobsCatalog } from "@/layers/infrastructure/catalogs/jobsCatalog";
import { educationCatalog } from "@/layers/infrastructure/catalogs/educationCatalog";
import { takeEducationAction } from "@/layers/application/use-cases/takeEducationAction";

export function resolveChoice(state, eventId, choiceId, payload = {}) {
  const next = cloneState(state);
  const isAnyParentAlive = next.relations.some(r => (r.id === "father" || r.id === "mother") && !r.isDead);

  if (eventId === "graduation_path_selection") {
    if (choiceId === "job" || choiceId === "work") {
      next.profile.isIndependent = true;
      next.education.isFocusingOnWork = true;
      pushLog(next, "Kamu memutuskan untuk tidak melanjutkan kuliah dan langsung fokus mencari kerja. Semoga sukses!");
      return next;
    }

    if (choiceId === "gap_year") {
      next.stats.happy = clamp(next.stats.happy + 10);
      next.education.isFocusingOnWork = false;
      pushLog(next, "Kamu memutuskan untuk mengambil Gap Year. Kamu akan mencoba lagi tahun depan.");
      return next;
    }

    // Helper: trigger funding popup after successful admission
    const triggerFundingPopup = (title) => {
      pushNotification(next, {
        title,
        message: "Selamat! Kamu resmi diterima. Siapa yang akan membiayai kuliah kamu?",
        icon: "success",
        type: "confirm",
        eventId: "university_funding",
        options: [
          { id: "parents", label: "Dibayarin Orang Tua" },
          { id: "self", label: "Bayar Sendiri (Mandiri)" }
        ]
      });
    };

    if (choiceId === "terbuka") {
      const firstYearUKT = 2_500_000;
      const currentMoney = next.profile.isIndependent ? next.money : next.family.savings;

      if (currentMoney < firstYearUKT) {
        pushLog(next, `Bahkan untuk Universitas Terbuka pun tabunganmu tidak mencukupi (Butuh Rp${firstYearUKT.toLocaleString("id-ID")}).`);
        pushNotification(next, {
          title: "Dana Tidak Cukup",
          message: "Bahkan Universitas Terbuka tidak terjangkau saat ini. Apa yang ingin kamu lakukan?",
          icon: "error",
          type: "confirm",
          eventId: "graduation_path_selection",
          options: [
            { id: "gap_year", label: "Ambil Gap Year Dulu", color: "yellow" },
            { id: "job", label: "Fokus Cari Kerja", color: "gray" }
          ]
        });
        return next;
      }

      next.education.level = "university_terbuka";
      next.education.yearsStudied = 0;
      next.education.schoolName = "Universitas Terbuka";
      next.education.isPTNPass = false;
      next.education.isFocusingOnWork = false;
      pushLog(next, "Kamu mendaftar di Universitas Terbuka agar bisa belajar secara fleksibel.");
      triggerFundingPopup("Daftar Universitas Terbuka");
      return next;
    }

    if (choiceId === "swasta") {
      const upInitial = 50_000_000;
      const firstYearUKT = 45_000_000;
      const totalNeeded = upInitial + firstYearUKT;
      const currentMoney = next.profile.isIndependent ? next.money : next.family.savings;

      if (currentMoney < totalNeeded) {
        pushLog(next, `Tabungan tidak cukup untuk Universitas Swasta (Butuh Rp${totalNeeded.toLocaleString("id-ID")}).`);
        pushNotification(next, {
          title: "Dana Tidak Cukup",
          message: `Universitas Swasta butuh Rp${totalNeeded.toLocaleString("id-ID")}. Mau coba pilihan lain?`,
          icon: "error",
          type: "confirm",
          eventId: "graduation_path_selection",
          options: [
            { id: "snbt", label: "Ikut SNBT (UTBK)", color: "blue" },
            { id: "mandiri", label: "Jalur Mandiri (PTN)", color: "orange" },
            { id: "terbuka", label: "Universitas Terbuka (UT)", color: "cyan" },
            { id: "gap_year", label: "Ambil Gap Year", color: "yellow" },
            { id: "job", label: "Fokus Kerja", color: "gray" }
          ]
        });
        return next;
      }

      next.education.level = "university_swasta";
      next.education.yearsStudied = 0;
      next.education.schoolName = "Universitas Swasta";
      next.education.isPTNPass = false;
      next.education.isFocusingOnWork = false;
      pushLog(next, "Kamu mendaftar di Universitas Swasta.");
      triggerFundingPopup("Daftar Universitas Swasta");
      return next;
    }

    if (choiceId === "snbp") {
      const chance = next.stats.smarts > 80 ? 0.35 : 0.05;
      if (Math.random() < chance) {
        next.education.level = "university_ptn_snbp";
        next.education.yearsStudied = 0;
        next.education.schoolName = "Universitas Negeri (SNBP)";
        next.education.isPTNPass = true;
        pushLog(next, "LUAR BIASA! Kamu lulus jalur SNBP. Kamu masuk universitas negeri tanpa tes dan biaya semester sangat murah!");
        triggerFundingPopup("Lolos SNBP!");
      } else {
        const failMsg = "Maaf, kamu tidak lolos seleksi SNBP. Jangan menyerah, masih ada jalur lain.";
        pushLog(next, failMsg);
        pushNotification(next, {
          title: "Gagal SNBP",
          message: failMsg,
          icon: "error",
          type: "confirm",
          eventId: "graduation_path_selection",
          options: [
            { id: "snbt", label: "Ikut SNBT (UTBK)", color: "blue" },
            { id: "mandiri", label: "Daftar Jalur Mandiri (PTN)", color: "orange" },
            { id: "swasta", label: "Daftar Kampus Swasta", color: "purple" },
            { id: "terbuka", label: "Universitas Terbuka (UT)", color: "cyan" },
            { id: "gap_year", label: "Ambil Gap Year", color: "yellow" },
            { id: "job", label: "Langsung Kerja", color: "gray" }
          ]
        });
      }
      return next;
    }

    if (choiceId === "snbt") {
      const passChance = 0.2 + (next.stats.smarts / 200);
      if (Math.random() < passChance) {
        next.education.level = "university_ptn_snbt";
        next.education.yearsStudied = 0;
        next.education.schoolName = "Universitas Negeri (SNBT)";
        next.education.isPTNPass = true;
        pushLog(next, "SELAMAT! Kamu lulus UTBK dan diterima di PTN impianmu melalui jalur SNBT.");
        triggerFundingPopup("Lulus UTBK!");
      } else {
        const failMsg = "Kamu gagal dalam seleksi UTBK. Nilaimu belum mencukupi untuk bersaing di PTN tujuanmu.";
        pushLog(next, failMsg);
        pushNotification(next, {
          title: "Gagal SNBT",
          message: failMsg,
          icon: "error",
          type: "confirm",
          eventId: "graduation_path_selection",
          options: [
            { id: "mandiri", label: "Daftar Jalur Mandiri (PTN)", color: "orange" },
            { id: "swasta", label: "Daftar Kampus Swasta", color: "purple" },
            { id: "terbuka", label: "Universitas Terbuka (UT)", color: "cyan" },
            { id: "job", label: "Langsung Kerja", color: "gray" }
          ]
        });
      }
      return next;
    }

    if (choiceId === "mandiri") {
      const upInitial = 35_000_000;
      const firstYearUKT = 15_000_000;
      const totalNeeded = upInitial + firstYearUKT;
      const currentMoney = next.profile.isIndependent ? next.money : next.family.savings;

      if (currentMoney < totalNeeded) {
        pushLog(next, `Tabungan tidak cukup untuk jalur Mandiri (Butuh Rp${totalNeeded.toLocaleString("id-ID")}).`);
        pushNotification(next, {
          title: "Dana Tidak Cukup",
          message: `Jalur Mandiri butuh Rp${totalNeeded.toLocaleString("id-ID")}. Mau coba pilihan lain?`,
          icon: "error",
          type: "confirm",
          eventId: "graduation_path_selection",
          options: [
            { id: "swasta", label: "Daftar Kampus Swasta", color: "purple" },
            { id: "terbuka", label: "Universitas Terbuka (UT)", color: "cyan" },
            { id: "gap_year", label: "Ambil Gap Year", color: "yellow" },
            { id: "job", label: "Fokus Kerja", color: "gray" }
          ]
        });
        return next;
      }

      // Deduct uang pangkal upfront
      if (next.profile.isIndependent) next.money -= upInitial;
      else next.family.savings -= upInitial;

      next.education.level = "university_ptn_mandiri";
      next.education.yearsStudied = 0;
      next.education.schoolName = "Universitas Negeri (Mandiri)";
      next.education.isPTNPass = true;
      next.education.isFocusingOnWork = false;
      next.education.fundingSource = next.profile.isIndependent ? "self" : "parents";
      pushLog(next, `Kamu masuk PTN melalui jalur Mandiri dengan membayar uang pangkal Rp${upInitial.toLocaleString("id-ID")}.`);

      // Mandiri skips funding (already paid), go straight to housing
      // If already independent, skip housing choice
      if (next.profile.isIndependent) {
        next.profile.livingWithParents = false;
        pushLog(next, "Karena kamu sudah hidup mandiri, kamu memutuskan untuk tinggal di kos-kosan dekat kampus selama masa kuliah.");
      } else {
        pushNotification(next, {
          title: "Berhasil Masuk PTN (Mandiri)",
          message: "Uang pangkal sudah dibayar. Di mana kamu akan tinggal selama kuliah?",
          icon: "question",
          type: "confirm",
          eventId: "housing_decision_18",
          options: [
            { id: "stay_home", label: "Tetap di Rumah Orang Tua" },
            { id: "move_out", label: "Pindah Keluar / Kos" }
          ]
        });
      }
      return next;
    }
  }


  if (eventId === "graduation_university") {
    next.profile.isIndependent = true; // Financial autonomy
    next.education.level = "none";
    next.education.yearsStudied = 0;
    next.education.schoolName = "";
    if (choiceId === "independent") {
      next.profile.livingWithParents = false;
      next.stats.happy = clamp(next.stats.happy + 15);
      pushLog(next, "Kamu memutuskan untuk pindah keluar dan hidup mandiri sepenuhnya. Selamat berjuang di dunia nyata!");
    } else if (choiceId === "with_parents") {
      // Safety check: even if the popup appeared, don't allow moving back if already independent
      if (next.profile.isIndependent && next.profile.livingWithParents === false) {
        next.profile.livingWithParents = false;
        pushLog(next, "Meskipun sempat terpikir untuk kembali ke rumah, kamu menyadari bahwa kamu sudah hidup mandiri.");
      } else {
        const isAnyParentAlive = next.relations.some(r => (r.id === "father" || r.id === "mother") && !r.isDead);
        next.profile.livingWithParents = true;
        next.stats.happy = clamp(next.stats.happy + 5);
        if (isAnyParentAlive) {
          pushLog(next, "Kamu memutuskan untuk tetap tinggal bersama orang tua sambil menabung untuk masa depanmu.");
        } else {
          pushLog(next, "Kamu memutuskan untuk tetap tinggal di rumah keluarga dan menabung untuk masa depanmu.");
        }
      }
    }
  }

  if (eventId === "orphan_crisis") {
    if (choiceId === "relative") {
      next.family.savings = Math.floor(next.family.savings * 0.2); // Most assets lost or tied up
      next.family.monthlyIncome = 3_500_000; // Relative's basic support
      next.family.wealthStatus = "middle";
      next.family.isBankrupt = false;
      next.profile.isIndependent = false;
      next.profile.livingWithParents = true; // Living with extended family
      next.stats.happy = clamp(next.stats.happy - 15);
      pushLog(next, "Kamu kini tinggal bersama paman dan bibimu. Mereka berjanji akan menjagamu dan memastikan kamu tetap bisa melanjutkan sekolah.");
    } else if (choiceId === "street") {
      next.profile.isIndependent = true;
      next.profile.livingWithParents = false;
      next.education.level = "none"; // Forced drop out
      next.stats.happy = clamp(next.stats.happy - 50);
      pushLog(next, "Kamu memilih untuk pergi dari rumah dan berjuang sendiri di jalanan. Hidup terasa sangat berat, dan kamu terpaksa putus sekolah.");
    }
  }

  if (eventId === "job_interview") {
    const { jobId, jobName } = payload;
    const job = jobsCatalog.find(j => j.id === jobId);
    const track = job?.track || "informal";
    const tier = job?.tier || 1;

    // 1. Lower Base Chance (Harder than before)
    let baseChance = 0.15;

    // 2. Intelligence Factor (Smarts)
    // bonus based on how much you exceed the requirement
    const smartsDiff = next.stats.smarts - (job?.minSmarts || 0);
    baseChance += (smartsDiff / 200);

    // 3. Health Factor (Physical Fitness)
    const isPhysicalJob = ["medical", "law", "tech", "informal"].includes(track);
    if (next.stats.health < 50) {
      const penalty = isPhysicalJob ? 0.30 : 0.15;
      baseChance -= penalty;
      if (isPhysicalJob) pushLog(next, "HRD memperhatikan kondisi fisikmu yang tampak sangat tidak bugar untuk pekerjaan ini.");
    } else if (next.stats.health > 85) {
      baseChance += 0.05;
    }

    // 4. Looks Factor (Appearance)
    const isPublicJob = ["service", "media", "corporate"].includes(track);
    if (isPublicJob) {
      if (next.stats.looks < 50) {
        baseChance -= 0.25;
        pushLog(next, "Penampilanmu dinilai kurang representatif untuk posisi publik ini.");
      } else if (next.stats.looks > 80) {
        baseChance += 0.15;
        pushLog(next, "Penampilanmu yang menarik memberikan kesan positif pertama yang kuat.");
      }
    }

    // 5. Education & Experience
    if (next.education.completed.includes("university")) baseChance += 0.15;
    const generalExpBoost = Math.min(0.20, (next.career.yearsWorked || 0) * 0.01);
    baseChance += generalExpBoost;

    // 6. Tier Penalty (Executive positions are VERY hard)
    if (tier === 2) baseChance -= 0.15;
    else if (tier === 3) baseChance -= 0.40;
    else if (tier >= 4) baseChance -= 0.60;

    // 7. Choice Impact
    const isHighLevel = tier >= 3;
    if (choiceId === "confident") {
      if (next.stats.smarts < 45) {
        baseChance -= 0.30;
        pushLog(next, "Kepercayaan dirimu dianggap sebagai kesombongan karena tidak dibarengi kualifikasi yang kuat.");
      } else {
        baseChance += (isHighLevel || ["corporate", "tech", "law"].includes(track)) ? 0.25 : 0.10;
      }
    } else if (choiceId === "polite") {
      baseChance += (["service", "education", "medical"].includes(track)) ? 0.25 : 0.10;
    } else if (choiceId === "nervous") {
      baseChance -= 0.35;
      pushLog(next, "Kamu terlalu gugup, membuat pewawancara meragukan kapabilitasmu.");
    }

    // Final RNG Check
    if (Math.random() < baseChance) {
      next.career.jobId = jobId;
      next.career.yearsInRole = 0;
      const successMsg = `SELAMAT! HRD terkesan dengan ${choiceId === "confident" ? "kepercayaan dirimu" : "kesopananmu"}. Kamu diterima sebagai ${jobName}.`;
      pushLog(next, successMsg);
      pushNotification(next, { title: "Diterima!", message: successMsg, icon: "success" });
    } else {
      next.stats.happy = Math.max(0, next.stats.happy - 10);
      const failMsg = `Maaf, lamaranmu sebagai ${jobName} ditolak. ${choiceId === "nervous" ? "Kamu harus lebih tenang lain kali." : "Mungkin kamu kurang cocok dengan posisi ini."}`;
      pushLog(next, failMsg);
      pushNotification(next, { title: "Ditolak", message: failMsg, icon: "error" });
    }
  }

  if (eventId === "prison_release_choice") {
    if (choiceId === "parents") {
      next.profile.livingWithParents = true;
      // next.profile.isIndependent = false; // Removed: once independent, always independent
      pushLog(next, "Kamu memutuskan untuk kembali ke rumah keluarga untuk menata kembali hidupmu setelah bebas.");
    } else if (choiceId === "independent") {
      next.profile.isIndependent = true;
      next.profile.livingWithParents = false;
      pushLog(next, "Kamu memilih untuk langsung hidup mandiri dan berjanji akan menjadi pribadi yang lebih baik.");
    }
  }

  if (eventId === "university_funding") {
    let program = educationCatalog.find(p => p.id === next.education.level);
    if (!program && payload && payload.targetId) {
      program = educationCatalog.find(p => p.id === payload.targetId);
    }

    // 1. Calculate Costs
    const tuition = program ? program.costPerYear : (next.education.isPTNPass ? 15_000_000 : 45_000_000);
    let admissionFee = 0; // Uang Pangkal
    const levelId = program ? program.id : next.education.level;

    if (levelId === "university_ptn_mandiri") admissionFee = 35_000_000;
    else if (levelId === "university_swasta") admissionFee = 50_000_000;

    const totalNeeded = tuition + admissionFee;

    if (choiceId === "parents") {
      if (next.family.savings >= totalNeeded) {
        // Success: Set level and deduct
        if (payload && payload.targetId && program) {
          next.education.level = program.id;
          next.education.schoolName = program.name;
        }

        next.education.yearsStudied = 0;
        next.education.fundingSource = "parents";
        // Only override isPTNPass if enrolling in swasta/terbuka
        if (levelId === "university_swasta" || levelId === "university_terbuka") {
          next.education.isPTNPass = false;
        }
        next.family.savings -= totalNeeded;

        const successMsg = `Orang tuamu membayar total Rp${totalNeeded.toLocaleString("id-ID")} (UKT + Uang Pangkal) untuk kuliahmu di ${next.education.schoolName}.`;
        pushLog(next, successMsg);
        pushNotification(next, { title: "Pembayaran Berhasil", message: successMsg, icon: "success" });

        // If already independent, skip housing choice
        if (next.profile.isIndependent) {
          next.profile.livingWithParents = false;
          pushLog(next, "Karena kamu sudah hidup mandiri, kamu memutuskan untuk tinggal di kos-kosan dekat kampus selama masa kuliah.");
        } else {
          pushNotification(next, {
            title: "Tempat Tinggal",
            message: "Kamu sudah resmi menjadi mahasiswa. Di mana kamu akan tinggal selama kuliah?",
            icon: "info",
            type: "confirm",
            eventId: "housing_decision_18",
            options: [
              { id: "stay_home", label: "Tetap di Rumah Ortu (Gratis)" },
              { id: "move_out", label: "Pindah Keluar / Kos (Butuh Biaya)" }
            ]
          });
        }
      } else {
        // FAILURE: Reset level — offer alternative schools (NOT re-exam options)
        next.education.level = "none";
        pushLog(next, `Pendaftaran ke ${program?.name || "Universitas"} GAGAL karena tabungan keluarga (Rp${next.family.savings.toLocaleString("id-ID")}) tidak mencukupi biaya masuk Rp${totalNeeded.toLocaleString("id-ID")}.`);

        // Build contextual options — no re-exam, only cheaper/other schools
        const parentFailOptions = [];
        if (next.money >= totalNeeded) {
          parentFailOptions.push({ id: "self", label: "Coba Bayar Sendiri", color: "blue" });
        }
        if (levelId !== "university_ptn_mandiri" && levelId !== "university_swasta") {
          parentFailOptions.push({ id: "mandiri", label: "Coba Jalur Mandiri (PTN)", color: "orange" });
        }
        if (levelId !== "university_swasta") {
          parentFailOptions.push({ id: "swasta", label: "Daftar Kampus Swasta", color: "purple" });
        }
        if (levelId !== "university_terbuka") {
          parentFailOptions.push({ id: "terbuka", label: "Universitas Terbuka (UT)", color: "cyan" });
        }
        parentFailOptions.push({ id: "gap_year", label: "Ambil Gap Year", color: "yellow" });
        parentFailOptions.push({ id: "job", label: "Batalkan & Cari Kerja", color: "gray" });

        pushNotification(next, {
          title: "Pendaftaran Gagal",
          message: "Orang tuamu tidak mampu membiayai. Pilih jalur lain (sudah lolos seleksi, tidak perlu ujian ulang):",
          icon: "error",
          type: "confirm",
          eventId: "graduation_path_selection",
          options: parentFailOptions
        });
      }
    } else if (choiceId === "self") {
      if (next.money >= totalNeeded) {
        next.profile.isIndependent = true;
        if (payload && payload.targetId && program) {
          next.education.level = program.id;
          next.education.schoolName = program.name;
        }

        next.education.yearsStudied = 0;
        next.education.fundingSource = "self";
        // Only override isPTNPass if enrolling in swasta/terbuka
        if (levelId === "university_swasta" || levelId === "university_terbuka") {
          next.education.isPTNPass = false;
        }
        next.money -= totalNeeded;

        const successMsg = `Kamu membayar total Rp${totalNeeded.toLocaleString("id-ID")} (UKT + Uang Pangkal) secara mandiri untuk kuliah di ${next.education.schoolName}.`;
        pushLog(next, successMsg);
        pushNotification(next, { title: "Pembayaran Berhasil", message: successMsg, icon: "success" });

        // If already independent, skip housing choice
        if (next.profile.isIndependent) {
          next.profile.livingWithParents = false;
          pushLog(next, "Karena kamu sudah hidup mandiri, kamu memutuskan untuk tinggal di kos-kosan dekat kampus selama masa kuliah.");
        } else {
          pushNotification(next, {
            title: "Tempat Tinggal",
            message: "Kamu sudah resmi menjadi mahasiswa. Di mana kamu akan tinggal selama kuliah?",
            icon: "info",
            type: "confirm",
            eventId: "housing_decision_18",
            options: [
              { id: "stay_home", label: "Tetap di Rumah Ortu" },
              { id: "move_out", label: "Pindah Keluar / Kos" }
            ]
          });
        }
      } else {
        // FAILURE: Reset level, show re-selection popup (NO re-exam — already accepted!)
        next.education.level = "none";
        pushLog(next, `Pendaftaran GAGAL. Uangmu (Rp${next.money.toLocaleString("id-ID")}) tidak cukup untuk membayar biaya masuk Rp${totalNeeded.toLocaleString("id-ID")}.`);

        // Build contextual options — skip exam options since player is already post-admission
        const selfFailOptions = [];
        if (isAnyParentAlive && next.family.savings >= totalNeeded) {
          selfFailOptions.push({ id: "parents", label: "Coba Minta Orang Tua", color: "green" });
        }
        if (levelId !== "university_ptn_mandiri") {
          selfFailOptions.push({ id: "mandiri", label: "Coba Jalur Mandiri (PTN)", color: "orange" });
        }
        if (levelId !== "university_swasta") {
          selfFailOptions.push({ id: "swasta", label: "Daftar Kampus Swasta", color: "purple" });
        }
        if (levelId !== "university_terbuka") {
          selfFailOptions.push({ id: "terbuka", label: "Universitas Terbuka (UT)", color: "cyan" });
        }
        selfFailOptions.push({ id: "gap_year", label: "Ambil Gap Year", color: "yellow" });
        selfFailOptions.push({ id: "job", label: "Batalkan & Cari Kerja", color: "gray" });

        pushNotification(next, {
          title: "Uang Tidak Cukup",
          message: `Dana mandirimu (Rp${next.money.toLocaleString("id-ID")}) kurang. Pilih jalur lain (tidak perlu ujian ulang):`,
          icon: "error",
          type: "confirm",
          eventId: "graduation_path_selection",
          options: selfFailOptions
        });
      }
    } else if (choiceId === "job") {
      next.profile.isIndependent = true;
      next.education.level = "none";
      next.education.yearsStudied = 0;
      pushLog(next, "Kamu membatalkan pendaftaran kuliah dan memilih untuk langsung mencari pekerjaan.");
    }
  }

  if (eventId === "retirement_choice") {
    const { pesangon, pensionYearly, jobName } = payload;
    if (choiceId === "retire") {
      next.money += pesangon;
      next.career.isRetired = true;
      next.career.pensionAmount = pensionYearly;
      next.career.jobId = null;
      pushLog(next, `Kamu resmi pensiun dari pekerjaan sebagai ${jobName}. Kamu menerima pesangon Rp${pesangon.toLocaleString("id-ID")} dan akan menerima uang pensiun Rp${pensionYearly.toLocaleString("id-ID")} setiap tahunnya.`);
    } else {
      pushLog(next, `Kamu memutuskan untuk tetap bekerja sebagai ${jobName} meskipun sudah memasuki masa pensiun.`);
    }
    return next;
  }

  if (eventId === "housing_decision_18") {
    if (choiceId === "stay_home") {
      next.profile.livingWithParents = true;
      pushLog(next, "Kamu memilih untuk tetap tinggal di rumah orang tua selama masa kuliah agar bisa lebih fokus belajar dan menghemat biaya.");
    } else if (choiceId === "move_out") {
      next.profile.livingWithParents = false;
      next.profile.isIndependent = true; // Moving out always requires independence
      pushLog(next, "Kamu memutuskan untuk pindah ke kos-kosan dekat kampus. Kamu ingin belajar hidup mandiri sepenuhnya sejak dini.");
    }
    return next;
  }

  if (eventId === "driving_test") {
    if (choiceId === "yes") {
      const cost = 250_000;
      const canAfford = next.profile?.isIndependent ? next.money >= cost : (next.money >= cost || next.family.savings >= cost);

      if (!canAfford) {
        pushLog(next, "Saya tidak memiliki cukup uang untuk membayar biaya administrasi ujian SIM.");
        return next;
      }

      // Deduct money
      if (next.profile?.isIndependent || next.money >= cost) {
        next.money -= cost;
      } else {
        next.family.savings -= cost;
      }

      // 70% base chance + boost from smarts
      const passChance = 0.6 + (next.stats.smarts / 250);
      if (Math.random() < passChance) {
        if (!next.profile.licenses) next.profile.licenses = [];
        if (!next.profile.licenses.includes("SIM A/C")) {
          next.profile.licenses.push("SIM A/C");
        }
        next.stats.happy = clamp(next.stats.happy + 15);
        pushLog(next, "Selamat! Saya berhasil lulus ujian SIM secara resmi dan sekarang bisa berkendara.");
      } else {
        next.stats.happy = clamp(next.stats.happy - 10);
        pushLog(next, "Sayang sekali, saya gagal dalam ujian praktik karena menabrak tiang. Uang administrasi saya hangus.");
      }
    } else {
      pushLog(next, "Saya memutuskan untuk menunda mengambil ujian SIM tahun ini.");
    }
  }

  if (eventId === "scholarship_offer") {
    if (choiceId === "yes") {
      const chance = 0.35 + (next.stats.smarts - 75) * 0.02;
      if (Math.random() < chance) {
        if (!next.family.activeScholarships) next.family.activeScholarships = [];
        next.family.activeScholarships.push({
          id: `sch_offer_${Date.now()}`,
          name: "Beasiswa Prestasi (Pilihan)",
          coverage: "partial",
          amount: 50,
          yearsLeft: 3
        });
        next.stats.happy = clamp(next.stats.happy + 10);
        pushLog(next, "Luar biasa! Saya memenangkan beasiswa prestasi (Diskon 50% selama 3 tahun).");
      } else {
        pushLog(next, "Sayang sekali, Saya belum berhasil mendapatkan beasiswa kali ini.");
      }
    } else {
      pushLog(next, "Saya melewatkan kesempatan beasiswa tersebut.");
    }
  }

  if (eventId === "funeral_decision") {
    if (choiceId === "ignore") {
      pushLog(next, "Saya tidak bisa menghadiri pemakamannya.");
    } else {
      pushLog(next, "Saya menghadiri pemakaman tersebut.");
    }
  }

  if (eventId === "osis_election") {
    if (choiceId === "chairman") {
      const winChance = 0.3 + (next.stats.smarts / 200) + (next.stats.looks / 200);
      if (Math.random() < winChance) {
        next.stats.smarts = clamp(next.stats.smarts + 10);
        next.stats.happy = clamp(next.stats.happy + 20);
        pushLog(next, "LUAR BIASA! Kamu terpilih sebagai Ketua OSIS. Reputasimu di sekolah meningkat tajam.");
      } else {
        next.stats.happy = clamp(next.stats.happy - 10);
        pushLog(next, "Kamu kalah dalam pemilihan Ketua OSIS. Meskipun kecewa, kamu tetap mendapat rasa hormat dari teman-teman.");
      }
    } else if (choiceId === "member") {
      next.stats.smarts = clamp(next.stats.smarts + 5);
      next.stats.happy = clamp(next.stats.happy + 5);
      pushLog(next, "Kamu bergabung sebagai pengurus OSIS. Pengalaman organisasi ini sangat berharga.");
    } else {
      pushLog(next, "Kamu memilih untuk tidak ikut campur dalam urusan organisasi sekolah.");
    }
  }

  else if (eventId === "national_competition_invite") {
    if (choiceId === "accept") {
      const winChance = 0.2 + (next.stats.smarts / 150);
      if (Math.random() < winChance) {
        const prize = 10_000_000;
        next.money += prize;
        next.stats.smarts = clamp(next.stats.smarts + 15);
        next.stats.happy = clamp(next.stats.happy + 25);
        pushLog(next, `MENANG! Kamu menjuarai Lomba Sains Nasional dan membawa pulang hadiah Rp${prize.toLocaleString("id-ID")}.`);
      } else {
        next.stats.smarts = clamp(next.stats.smarts + 5);
        next.stats.happy = clamp(next.stats.happy - 5);
        pushLog(next, "Kamu gagal memenangkan lomba, tapi ilmu yang kamu dapatkan sangat bermanfaat.");
      }
    } else {
      pushLog(next, "Kamu menolak tawaran ikut lomba karena ingin fokus pada hal lain.");
    }
  }

  else if (eventId === "first_crush") {
    const crushName = payload.crushName || "dia";
    if (choiceId === "confess") {
      const chance = 0.2 + (next.stats.looks / 150);
      if (Math.random() < chance) {
        // Find the relation and make them partner
        const relation = next.relations.find(r => r.id === payload.crushId);
        if (relation) {
          relation.status = "partner";
          relation.relationship = 100;
        }
        next.stats.happy = clamp(next.stats.happy + 30);
        pushLog(next, `Diterima! ${crushName} ternyata juga menyukaimu. Kalian resmi berpacaran.`);
      } else {
        next.stats.happy = clamp(next.stats.happy - 25);
        pushLog(next, `Ditolak... ${crushName} hanya menganggapmu sebagai teman biasa. Rasanya sakit sekali.`);
      }
    } else if (choiceId === "wait") {
      pushLog(next, `Kamu memilih untuk memendam perasaanmu pada ${crushName} dan menunggu saat yang tepat.`);
    } else {
      pushLog(next, "Kamu memutuskan untuk mengubur perasaan ini agar tidak mengganggu belajarmu.");
    }
  }

  if (eventId === "truancy_invitation") {
    if (choiceId === "join") {
      const caughtChance = 0.3;
      if (Math.random() < caughtChance) {
        next.stats.happy = clamp(next.stats.happy - 20);
        next.stats.health = clamp(next.stats.health - 5);
        pushLog(next, "GAWAT! Kamu ketahuan bolos oleh Guru BK. Orang tuamu dipanggil ke sekolah dan kamu dihukum berat.");
      } else {
        next.stats.happy = clamp(next.stats.happy + 10);
        pushLog(next, "Bolos yang seru! Kamu bersenang-senang dengan teman-teman tanpa ketahuan guru.");
      }
    } else {
      next.stats.smarts = clamp(next.stats.smarts + 2);
      pushLog(next, "Kamu menolak ajakan bolos dan tetap fokus belajar di kelas.");
    }
  }

  if (eventId === "bullying_intervention") {
    if (choiceId === "help") {
      if (Math.random() < 0.6) {
        next.stats.happy = clamp(next.stats.happy + 15);
        pushLog(next, "Kamu membela siswa tersebut. Kakak kelas akhirnya pergi dan kamu dianggap pahlawan.");
      } else {
        next.stats.health = clamp(next.stats.health - 15);
        next.stats.happy = clamp(next.stats.happy - 10);
        pushLog(next, "Kamu mencoba membela, tapi malah ikut dihajar. Kamu terluka tapi merasa telah melakukan hal yang benar.");
      }
    } else if (choiceId === "report") {
      pushLog(next, "Kamu melaporkan kejadian ini ke guru. Masalah selesai dengan cara yang lebih aman.");
    } else {
      next.stats.happy = clamp(next.stats.happy - 5);
      pushLog(next, "Kamu memilih untuk tidak ikut campur. Ada rasa bersalah yang menghantuimu.");
    }
  }

  if (eventId === "graduation_sd_selection" || eventId === "graduation_paket_a_selection") {
    if (choiceId === "smp") {
      const num = next.profile.city === "Jakarta" ? Math.floor(Math.random() * 295) + 1 : Math.floor(Math.random() * 9) + 1;
      next.education.level = "junior_high";
      next.education.yearsStudied = 0;
      next.education.schoolName = `SMPN ${num} ${next.profile.city}`;
      pushLog(next, `Kamu memutuskan untuk melanjutkan ke ${next.education.schoolName}.`);
    } else if (choiceId === "paket_b") {
      return takeEducationAction(next, "paket_b");
    } else {
      pushLog(next, "Kamu memutuskan untuk tidak melanjutkan sekolah reguler dan memilih mencari pekerjaan atau kegiatan lain.");
    }
    return next;
  }

  if (eventId === "education_suggest_paket") {
    // Recursively call takeEducationAction for the chosen paket
    return takeEducationAction(next, choiceId);
  }

  if (eventId === "graduation_smp_selection" || eventId === "graduation_paket_b_selection") {
    if (choiceId === "sma" || choiceId === "smk") {
      const sman = choiceId === "sma" ? "SMAN" : "SMKN";
      const num = next.profile.city === "Jakarta" ? Math.floor(Math.random() * (choiceId === "sma" ? 117 : 74)) + 1 : Math.floor(Math.random() * (choiceId === "sma" ? 5 : 3)) + 1;
      next.education.level = choiceId;
      next.education.yearsStudied = 0;
      next.education.schoolName = `${sman} ${num} ${next.profile.city}`;
      pushLog(next, `Kamu memutuskan untuk melanjutkan ke ${next.education.schoolName}.`);
    } else if (choiceId === "paket_c") {
      next.education.level = "paket_c";
      next.education.yearsStudied = 0;
      next.education.schoolName = "Program Paket C";
      pushLog(next, "Kamu memutuskan untuk mengambil Program Kejar Paket C.");
    } else {
      pushLog(next, "Kamu memutuskan untuk berhenti sekolah dan mulai mencari pekerjaan.");
    }
    return next;
  }

  if (eventId === "graduation_sma_legacy") {
    const { oldSchool } = payload;
    pushLog(next, `Saya lulus dari ${oldSchool}.`);

    if (choiceId === "univ") {
      pushLog(next, "Saya kuliah di universitas.");
      const hasJob = !!next.career?.jobId;
      const smaOptions = [
        { id: "snbp", label: "Daftar Jalur SNBP (Prestasi)", color: "green" },
        { id: "snbt", label: "Ikut SNBT (UTBK)", color: "blue" },
        { id: "mandiri", label: "Daftar Jalur Mandiri (PTN)", color: "orange" },
        { id: "swasta", label: "Daftar Kampus Swasta", color: "purple" },
        { id: "terbuka", label: "Universitas Terbuka (UT)", color: "cyan" }
      ];

      if (hasJob) {
        smaOptions.push({ id: "job", label: "Fokus Karir Saat Ini", color: "gray" });
      } else {
        smaOptions.push({ id: "job", label: "Langsung Cari Kerja", color: "gray" });
      }

      smaOptions.push({ id: "gap_year", label: "Ambil Gap Year", color: "yellow" });

      pushNotification(next, {
        title: "Pilihan Universitas",
        message: "Apa langkahmu selanjutnya untuk pendidikan tinggi?",
        icon: "question",
        type: "confirm",
        eventId: "graduation_path_selection",
        options: smaOptions
      });
    } else if (choiceId === "job") {
      pushLog(next, "Saya memutuskan untuk melihat-lihat beberapa lowongan pekerjaan.");
    } else {
      pushLog(next, "Saya memutuskan untuk mengambil cuti beberapa waktu.");
    }
    return next;
  }

  return next;
}
