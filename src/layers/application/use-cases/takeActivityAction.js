import { pushLog } from "@/layers/domain/entities/stateUtils";

export function takeActivityAction(state, activityId) {
  let newState = { ...state };
  let message = "";

  switch (activityId) {
    case "gym":
      if (newState.money >= 150000) {
        newState.money -= 150000;
        newState.stats.health = Math.min(100, newState.stats.health + 5);
        newState.stats.looks = Math.min(100, newState.stats.looks + 2);
        message = "Kamu pergi ke gym dan merasa lebih bugar.";
      } else {
        message = "Uangmu tidak cukup untuk pergi ke gym.";
      }
      break;

    case "library":
      newState.stats.smarts = Math.min(100, newState.stats.smarts + 5);
      newState.stats.happy = Math.min(100, newState.stats.happy + 2);
      message = "Kamu pergi ke perpustakaan dan membaca buku.";
      break;

    case "join_social":
      newState.socialMedia.isJoined = true;
      newState.socialMedia.followers = Math.floor(Math.random() * 10);
      message = "Kamu bergabung dengan media sosial.";
      break;

    case "post_social":
      newState.socialMedia.followers += Math.floor(Math.random() * 50);
      newState.stats.happy = Math.min(100, newState.stats.happy + 2);
      message = "Kamu memposting sesuatu di media sosial.";
      break;

    case "escape":
      if (Math.random() < 0.1 || (newState.stats.smarts > 80 && Math.random() < 0.3)) {
        newState.legal.inJail = false;
        newState.legal.sentenceLeft = 0;
        newState.stats.happy += 20;
        message = "KAMU BERHASIL KABUR DARI PENJARA!";
      } else {
        newState.legal.sentenceLeft += 2;
        newState.stats.health -= 10;
        message = "Gagal kabur! Hukumanmu ditambah 2 tahun.";
      }
      break;

    case "riot":
      if (Math.random() < 0.3) {
        newState.stats.happy += 10;
        newState.stats.health -= 20;
        message = "Kamu memulai kerusuhan. Beberapa orang terluka, termasuk kamu.";
      } else {
        newState.legal.sentenceLeft += 1;
        message = "Kerusuhan dipadamkan. Hukumanmu ditambah 1 tahun.";
      }
      break;

    case "apply_scholarship":
      if (newState.education.level === "none") {
        message = "Kamu harus sedang bersekolah untuk melamar beasiswa.";
      } else if (newState.family.isScholarshipActive) {
        message = "Kamu sudah memiliki beasiswa yang aktif.";
      } else {
        const smarts = newState.stats.smarts;
        const chance = 0.2 + (smarts - 75) * 0.02;
        if (smarts >= 75 && Math.random() < chance) {
          newState.family.isScholarshipActive = true;
          newState.stats.happy = Math.min(100, newState.stats.happy + 15);
          message = "SELAMAT! Lamaran beasiswamu diterima. Biaya sekolah tahun ini gratis!";
        } else {
          newState.stats.happy = Math.max(0, newState.stats.happy - 5);
          message = "Maaf, lamaran beasiswamu ditolak. Coba lagi tahun depan.";
        }
      }
      break;

    case "work_part_time":
      if (newState.age < 15) {
        message = "Kamu terlalu muda untuk bekerja part-time.";
      } else {
        const salary = 1_500_000 + Math.floor(Math.random() * 1_000_000);
        if (newState.profile?.isIndependent) {
          newState.money += salary;
          message = `Kamu bekerja part-time dan mendapat bayaran Rp${salary.toLocaleString("id-ID")}.`;
        } else {
          newState.family.savings += salary;
          message = `Kamu bekerja part-time dan menyumbang Rp${salary.toLocaleString("id-ID")} ke tabungan keluarga.`;
        }
        newState.stats.health = Math.max(0, newState.stats.health - 5);
        newState.stats.happy = Math.max(0, newState.stats.happy - 3);
      }
      break;

    case "join_extracurricular":
      if (newState.education.level === "none" || newState.education.level === "university") {
        message = "Kamu harus berada di SD, SMP, atau SMA untuk ikut ekstrakurikuler.";
      } else if (newState.money >= 150_000 || (!newState.profile?.isIndependent && newState.family.savings > 150_000)) {
        if (newState.profile?.isIndependent) {
          newState.money -= 150_000;
        } else {
          newState.family.savings -= 150_000;
        }
        newState.stats.happy = Math.min(100, newState.stats.happy + 5);
        newState.stats.smarts = Math.min(100, newState.stats.smarts + 3);
        newState.stats.looks = Math.min(100, newState.stats.looks + 2);
        message = "Kamu aktif mengikuti kegiatan ekstrakurikuler sekolah. Teman-teman barumu sangat seru!";
      } else {
        message = "Tidak ada cukup uang untuk membayar uang kas ekstrakurikuler.";
      }
      break;

    default:
      message = "Aktivitas tidak dikenal.";
  }

  pushLog(newState, message);
  return newState;
}
