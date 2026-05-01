import { cloneState, pushLog, clamp, clampStatus } from "@/layers/domain/entities/stateUtils";

export function resolveChoice(state, eventId, choiceId, payload = {}) {
  const next = cloneState(state);

  if (eventId === "graduation_sma") {
    if (choiceId === "college") {
      if (next.family.savings < 50_000_000) {
        next.profile.isIndependent = true;
        next.stats.happy = clamp(next.stats.happy - 10);
        pushLog(next, "Orang tua Saya tidak memiliki cukup tabungan untuk membiayai kuliah. Saya terpaksa mencari kerja dan hidup mandiri.");
      } else {
        next.education.level = "university";
        next.education.yearsStudied = 0;
        pushLog(next, "Saya memutuskan untuk melanjutkan kuliah. Orang tua Saya masih akan menanggung biaya hidup Saya.");
      }
    } else if (choiceId === "job") {
      next.profile.isIndependent = true;
      next.stats.happy = clamp(next.stats.happy + 5);
      pushLog(next, "Saya memutuskan untuk hidup mandiri, mencari kos-kosan, dan mengelola keuangan Saya sendiri mulai sekarang.");
    } else if (choiceId === "gap_year") {
      next.profile.isIndependent = true;
      next.stats.happy = clamp(next.stats.happy + 10);
      pushLog(next, "Saya memutuskan untuk mengambil cuti panjang (Gap Year) sebelum menentukan langkah hidup selanjutnya.");
    }
  }

  else if (eventId === "sim_test") {
    if (choiceId === "yes") {
      // 80% chance to pass
      const passChance = 0.8;
      if (Math.random() < passChance) {
        if (!next.profile.licenses) next.profile.licenses = [];
        if (!next.profile.licenses.includes("SIM A/C")) {
          next.profile.licenses.push("SIM A/C");
        }
        next.stats.happy = clamp(next.stats.happy + 15);
        pushLog(next, "Selamat! Saya berhasil lulus ujian SIM dan sekarang resmi bisa berkendara.");
      } else {
        next.stats.happy = clamp(next.stats.happy - 10);
        pushLog(next, "Sayang sekali, Saya gagal dalam ujian SIM tahun ini. Saya harus mencobanya lagi nanti.");
      }
    } else {
      pushLog(next, "Saya memutuskan untuk tidak mengambil ujian SIM tahun ini.");
    }
  }

  else if (eventId === "scholarship_offer") {
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

  else if (eventId === "funeral_decision") {
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

  else if (eventId === "osis_election") {
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

  else if (eventId === "truancy_invitation") {
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

  else if (eventId === "bullying_intervention") {
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
