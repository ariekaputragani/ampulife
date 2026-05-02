import { cloneState, pushLog, clamp, clampStatus, pushNotification } from "@/layers/domain/entities/stateUtils";

export function resolveChoice(state, eventId, choiceId, payload = {}) {
  const next = cloneState(state);

  if (eventId === "graduation_sma") {
    if (choiceId === "ptn") {
      // PTN Selection (Harder but cheaper)
      const passChance = 0.3 + (next.stats.smarts / 200); // Max 80% if smarts is 100
      const isAnyParentAlive = next.relations.some(r => (r.id === "father" || r.id === "mother") && !r.isDead);

      if (Math.random() < passChance) {
        next.education.isPTNPass = true; // Mark as PTN passer
        pushLog(next, "LUAR BIASA! Kamu lulus seleksi PTN (Negeri). Biaya kuliahmu akan jauh lebih terjangkau.");
        
        if (!isAnyParentAlive) {
          next.profile.isIndependent = true;
          next.education.level = "university_ptn";
          next.education.yearsStudied = 0;
          next.education.schoolName = "Universitas Negeri";
          next.education.isPTNPass = false;
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
      
      const isAnyParentAlive = next.relations.some(r => (r.id === "father" || r.id === "mother") && !r.isDead);
      
      if (!isAnyParentAlive) {
        next.profile.isIndependent = true;
        next.education.level = "university_swasta";
        next.education.yearsStudied = 0;
        next.education.schoolName = "Universitas Swasta";
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
        next.education.level = isPTN ? "university_ptn" : "university_swasta";
        next.education.yearsStudied = 0;
        next.education.schoolName = isPTN ? "Universitas Negeri" : "Universitas Swasta";
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
      next.education.level = isPTN ? "university_ptn" : "university_swasta";
      next.education.yearsStudied = 0;
      next.education.schoolName = isPTN ? "Universitas Negeri" : "Universitas Swasta";
      next.education.isPTNPass = false; // Reset flag after use
      pushLog(next, `Kamu memutuskan untuk kuliah di ${next.education.schoolName} dengan biaya sendiri. Kamu sekarang hidup mandiri.`);
    } else if (choiceId === "job") {
      next.profile.isIndependent = true;
      next.education.level = "none";
      next.education.isPTNPass = false; // Reset flag
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
        next.family.isScholarshipActive = true;
        next.stats.happy = clamp(next.stats.happy + 10);
        pushLog(next, "Luar biasa! Saya memenangkan beasiswa tersebut.");
      } else {
        pushLog(next, "Sayang sekali, Saya belum berhasil mendapatkan beasiswa kali ini.");
      }
    } else {
      pushLog(next, "Saya melewatkan kesempatan beasiswa tersebut.");
    }
  }

  if (eventId === "funeral_decision") {
    if (choiceId === "ignore") {
      // next.stats.happy = clamp(next.stats.happy - 30);
      // next.relations = next.relations.map(r => {
      //   if (!r.isDead && (["father", "mother", "sister", "brother"].includes(r.id) || r.status === "family")) {
      //     r.relationship = clampStatus(r.relationship - 20);
      //   }
      //   return r;
      // });
      pushLog(next, "Saya tidak bisa menghadiri pemakamannya.");
    } else {
      // next.stats.happy = clamp(next.stats.happy + 5);
      // next.relations = next.relations.map(r => {
      //   if (!r.isDead && (["father", "mother", "sister", "brother"].includes(r.id) || r.status === "family")) {
      //     r.relationship = clampStatus(r.relationship + 10);
      //   }
      //   return r;
      // });
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

  return next;
}
