import { cloneState, pushLog, clamp, clampStatus, pushNotification } from "@/layers/domain/entities/stateUtils";
import { jobsCatalog } from "@/layers/infrastructure/catalogs/jobsCatalog";

export function resolveChoice(state, eventId, choiceId, payload = {}) {
  const next = cloneState(state);
  const isAnyParentAlive = next.relations.some(r => (r.id === "father" || r.id === "mother") && !r.isDead);

  if (eventId === "graduation_path_selection") {
    if (choiceId === "job" || choiceId === "work") {
      pushLog(next, "Kamu memutuskan untuk tidak melanjutkan kuliah dan langsung fokus mencari kerja. Semoga sukses!");
      return next;
    }

    if (choiceId === "gap_year") {
      next.stats.happy = clamp(next.stats.happy + 10);
      pushLog(next, "Saya memutuskan untuk mengambil Gap Year. Saya akan mencoba lagi tahun depan.");
      return next;
    }

    if (choiceId === "terbuka") {
      next.education.level = "university_terbuka";
      next.education.yearsStudied = 0;
      next.education.schoolName = "Universitas Terbuka";
      pushLog(next, "Kamu mendaftar di Universitas Terbuka agar bisa belajar secara fleksibel sambil melakukan aktivitas lain.");
      pushNotification(next, { title: "Daftar UT", message: "Kamu resmi menjadi mahasiswa Universitas Terbuka.", icon: "success" });
      return next;
    }

    if (choiceId === "swasta") {
      next.education.level = "university_swasta";
      next.education.yearsStudied = 0;
      next.education.schoolName = "Universitas Swasta";
      pushLog(next, "Kamu mendaftar di Universitas Swasta. Biaya kuliah mungkin lebih tinggi, namun fasilitasnya cukup memadai.");
      pushNotification(next, { title: "Daftar Swasta", message: "Kamu resmi terdaftar di Universitas Swasta.", icon: "success" });
      return next;
    }

    if (choiceId === "snbp") {
      const chance = next.stats.smarts > 80 ? 0.35 : 0.05;
      if (Math.random() < chance) {
        next.education.level = "university_ptn_snbp";
        next.education.yearsStudied = 0;
        next.education.schoolName = "Universitas Negeri (SNBP)";
        const msg = "LUAR BIASA! Kamu lulus jalur SNBP. Kamu masuk universitas negeri tanpa tes dan biaya semester sangat murah!";
        pushLog(next, msg);
        pushNotification(next, { title: "Lolos SNBP!", message: msg, icon: "success" });
      } else {
        const failMsg = "Maaf, kamu tidak lolos seleksi SNBP. Jangan menyerah, masih ada jalur tes (SNBT) atau Mandiri.";
        pushLog(next, failMsg);
        pushNotification(next, { 
          title: "Gagal SNBP", 
          message: failMsg, 
          icon: "error",
          type: "confirm",
          eventId: "graduation_path_selection",
          options: [
            { id: "snbt", label: "Ikut SNBT (UTBK)", color: "blue", disabled: next.age > 25 },
            { id: "mandiri", label: "Daftar Jalur Mandiri", color: "orange" },
            { id: "swasta", label: "Daftar Swasta", color: "purple" },
            { id: "work", label: "Langsung Kerja", color: "gray" }
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
        const msg = "SELAMAT! Kamu lulus UTBK dan diterima di PTN impianmu melalui jalur SNBT.";
        pushLog(next, msg);
        pushNotification(next, { title: "Lulus UTBK!", message: msg, icon: "success" });
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
            { id: "work", label: "Langsung Kerja", color: "gray" }
          ]
        });
      }
      return next;
    }

    if (choiceId === "mandiri") {
      const upInitial = 35_000_000;
      const currentMoney = next.profile.isIndependent ? next.money : next.family.savings;
      
      if (currentMoney < upInitial) {
        pushNotification(next, { title: "Dana Kurang", message: "Tabunganmu tidak mencukupi untuk membayar uang pangkal jalur Mandiri (Rp35jt).", icon: "warning" });
        return next;
      }

      if (next.profile.isIndependent) next.money -= upInitial;
      else next.family.savings -= upInitial;

      next.education.level = "university_ptn_mandiri";
      next.education.yearsStudied = 0;
      next.education.schoolName = "Universitas Negeri (Mandiri)";
      const msg = `Kamu masuk PTN melalui jalur Mandiri dengan membayar uang pangkal Rp${upInitial.toLocaleString("id-ID")}.`;
      pushLog(next, msg);
      pushNotification(next, { title: "Berhasil Masuk", message: msg, icon: "success" });
      return next;
    }
  }

  if (eventId === "graduation_sma") {
    if (choiceId === "ptn") {
      // PTN Selection (Harder but cheaper)
      const passChance = 0.3 + (next.stats.smarts / 200); // Max 80% if smarts is 100
      const isAnyParentAlive = next.relations.some(r => (r.id === "father" || r.id === "mother") && !r.isDead);

      if (Math.random() < passChance) {
        next.education.isPTNPass = true; // Mark as PTN passer
        pushLog(next, "LUAR BIASA! Kamu lulus seleksi PTN (Negeri). Biaya kuliahmu akan jauh lebih terjangkau.");
        
        if (!isAnyParentAlive) {
          next.education.fundingSource = "self";
          next.profile.isIndependent = true;
          pushLog(next, "Karena tidak ada orang tua yang membiayai, kamu memutuskan untuk kuliah di Universitas Negeri dengan biaya sendiri (berjuang mandiri).");
        } else {
          pushNotification(next, {
            title: "Pendanaan Kuliah (PTN)",
            message: "Siapa yang akan membiayai kuliah PTN kamu?",
            icon: "question",
            type: "confirm",
            eventId: "university_funding",
            options: [
              { id: "parents", label: "Orang Tua (Jika Mampu)" },
              { id: "self", label: "Bayar Sendiri (Kerja Sampingan)" }
            ]
          });
        }
      } else {
        pushLog(next, "Sayang sekali, kamu gagal dalam seleksi PTN tahun ini.");
        // Trigger fallback options
        pushNotification(next, {
          title: "Seleksi PTN Gagal",
          message: "Kamu gagal masuk PTN. Ingin mencoba universitas swasta atau cari kerja?",
          icon: "error",
          type: "confirm",
          eventId: "graduation_sma",
          options: [
            { id: "swasta", label: "Daftar Swasta" },
            { id: "job", label: "Cari Kerja" }
          ]
        });
      }
    } else if (choiceId === "swasta") {
      next.education.isPTNPass = false; // Ensure it's marked as swasta
      pushLog(next, "Kamu memutuskan untuk mendaftar di universitas Swasta.");
      
      if (!isAnyParentAlive) {
        next.profile.isIndependent = true;
        next.education.level = "university_swasta";
        next.education.yearsStudied = 0;
        next.education.schoolName = "Universitas Swasta";
        next.education.fundingSource = "self";
        pushLog(next, "Karena tidak ada orang tua yang membiayai, kamu memutuskan untuk kuliah di Universitas Swasta dengan biaya sendiri (berjuang mandiri).");
      } else {
        // Trigger funding selection for Swasta
        pushNotification(next, {
          title: "Pendanaan Kuliah (Swasta)",
          message: "Biaya Swasta cukup mahal. Siapa yang akan membayarnya?",
          icon: "question",
          type: "confirm",
          eventId: "university_funding",
          options: [
            { id: "parents", label: "Orang Tua (Butuh Tabungan Besar)" },
            { id: "self", label: "Bayar Sendiri (Wajib Mandiri)" }
          ]
        });
      }
    } else if (choiceId === "job") {
      const isAnyParentAlive = next.relations.some(r => (r.id === "father" || r.id === "mother") && !r.isDead);
      next.profile.isIndependent = true;
      next.stats.happy = clamp(next.stats.happy + 5);
      if (isAnyParentAlive) {
        pushLog(next, "Saya memutuskan untuk hidup mandiri, mencari kos-kosan, dan mengelola keuangan Saya sendiri mulai sekarang.");
      } else {
        pushLog(next, "Saya memutuskan untuk mulai mencari kerja dan berjuang sendiri demi masa depan.");
      }
    } else if (choiceId === "gap_year") {
      next.stats.happy = clamp(next.stats.happy + 10);
      pushLog(next, "Saya memutuskan untuk mengambil Gap Year. Saya akan mencoba lagi tahun depan.");
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
    
    // Base chance from stats
    let baseChance = 0.35 + (next.stats.smarts / 300) + (next.stats.looks / 600);
    
    // Education Boost
    let eduBoost = 0;
    if (next.education.completed.includes("university")) eduBoost = 0.15;
    else if (next.education.completed.includes("sma") || next.education.completed.includes("smk") || next.education.completed.includes("paket_c")) eduBoost = 0.05;
    
    baseChance += eduBoost;

    const track = job?.track || "informal";
    const tier = job?.tier || 1;
    if (tier === 2) baseChance -= 0.10;
    else if (tier === 3) baseChance -= 0.25;
    else if (tier >= 4) baseChance -= 0.40;

    // Experience Boost
    const totalYearsWorked = next.career.yearsWorked || 0;
    const generalExpBoost = Math.min(0.20, totalYearsWorked * 0.01); // Max +20%
    baseChance += generalExpBoost;

    // Industry Relevance Boost (Same track as last job)
    if (next.career.lastJobId) {
      const lastJob = jobsCatalog.find(j => j.id === next.career.lastJobId);
      if (lastJob && lastJob.track === track && track !== "informal") {
        baseChance += 0.15;
      }
    }

    const isHighLevel = (job?.tier || 1) >= 3;

    // Track Preferences
    // A. Corporate/Tech/Finance/Media prefer Confidence
    const prefersConfidence = ["corporate", "tech", "finance", "media", "law"].includes(track);
    // B. Service/Education/Medical prefer Politeness
    const prefersPoliteness = ["service", "education", "medical"].includes(track);

    if (choiceId === "confident") {
       if (next.stats.smarts < 40) {
         // Arrogant without brains
         baseChance -= 0.25;
         pushLog(next, "HRD merasa kamu terlalu sombong padahal kualifikasimu meragukan.");
       } else if (prefersConfidence || isHighLevel) {
         baseChance += 0.30;
       } else if (prefersPoliteness) {
         baseChance -= 0.10; // Arrogant for a service job
       } else {
         baseChance += 0.10;
       }
    } else if (choiceId === "polite") {
       if (prefersPoliteness) {
         baseChance += 0.30;
       } else if (prefersConfidence) {
         baseChance += 0.10; // Safe but not exciting
       } else {
         baseChance += 0.15;
       }
    } else if (choiceId === "nervous") {
       baseChance -= 0.25;
       pushLog(next, "Kamu terlihat sangat gugup saat wawancara, membuat HRD ragu.");
    }

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
      next.profile.isIndependent = false; 
      pushLog(next, "Kamu memutuskan untuk kembali ke rumah keluarga untuk menata kembali hidupmu setelah bebas.");
    } else if (choiceId === "independent") {
      next.profile.isIndependent = true;
      next.profile.livingWithParents = false;
      pushLog(next, "Kamu memilih untuk langsung hidup mandiri dan berjanji akan menjadi pribadi yang lebih baik.");
    }
  }

  if (eventId === "university_funding") {
    const isPTN = next.education.isPTNPass === true;
    const tuition = isPTN ? 15_000_000 : 45_000_000; // Yearly tuition

    if (choiceId === "parents") {
      if (next.family.savings >= tuition) {
        next.education.level = isPTN ? "university_ptn_snbt" : "university_swasta";
        next.education.yearsStudied = 0;
        next.education.schoolName = isPTN ? "Universitas Negeri" : "Universitas Swasta";
        next.education.fundingSource = "parents";
        next.education.isPTNPass = false; // Reset flag after use
        pushLog(next, `Orang tuamu setuju membiayai kuliahmu di ${next.education.schoolName}.`);
      } else {
        pushLog(next, "Orang tuamu minta maaf karena tabungan mereka tidak cukup untuk membiayai kuliahmu.");
        // Fallback to self-funded or dropout
        pushNotification(next, {
          title: "Dana Tidak Cukup",
          message: "Orang tuamu tidak mampu membiayai. Apa pilihanmu?",
          icon: "error",
          type: "confirm",
          eventId: "university_funding",
          options: [
            { id: "self", label: "Bayar Sendiri (Berjuang Mandiri)" },
            { id: "job", label: "Batalkan Kuliah & Cari Kerja" }
          ]
        });
      }
    } else if (choiceId === "self") {
      next.profile.isIndependent = true;
      next.education.level = isPTN ? "university_ptn_snbt" : "university_swasta";
      next.education.yearsStudied = 0;
      next.education.schoolName = isPTN ? "Universitas Negeri" : "Universitas Swasta";
      next.education.fundingSource = "self";
      next.education.isPTNPass = false; // Reset flag after use
      pushLog(next, `Kamu memutuskan untuk kuliah di ${next.education.schoolName} dengan biaya sendiri. Kamu sekarang mandiri secara finansial.`);
    } else if (choiceId === "job") {
      next.profile.isIndependent = true;
      next.education.level = "none";
      next.education.isPTNPass = false; // Reset flag
      next.education.fundingSource = "parents"; // Reset
      pushLog(next, "Karena kendala biaya, kamu terpaksa membatalkan niat kuliah dan langsung mencari kerja.");
    }
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
      next.stats.happy = clamp(next.stats.happy - 15);
      next.relations = next.relations.map(r => {
        if (!r.isDead && (["father", "mother", "sister", "brother"].includes(r.id) || r.status === "family")) {
          r.relationship = clamp( (r.relationship || 0) - 12);
        }
        return r;
      });
      pushLog(next, "Saya tidak bisa menghadiri pemakamannya. Keluarga besar merasa sedikit kecewa.");
    } else {
      next.stats.happy = clamp(next.stats.happy + 10);
      next.relations = next.relations.map(r => {
        if (!r.isDead && (["father", "mother", "sister", "brother"].includes(r.id) || r.status === "family")) {
          r.relationship = clamp( (r.relationship || 0) + 8);
        }
        return r;
      });
      pushLog(next, "Saya menghadiri pemakaman tersebut untuk memberikan penghormatan terakhir.");
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

  return next;
}
