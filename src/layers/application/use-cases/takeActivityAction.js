import { pushLog, cloneState } from "@/layers/domain/entities/stateUtils";

export function takeActivityAction(state, activityId) {
  let newState = cloneState(state);
  let message = "";

  // Ensure lastActivityAges exists (for backward compatibility)
  if (!newState.lastActivityAges) newState.lastActivityAges = {};

  // Check if already done this year
  if (newState.lastActivityAges[activityId] === newState.age) {
    return state; // No change if already done
  }

  // Record that it was done this year
  newState.lastActivityAges[activityId] = newState.age;

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
      } else if (newState.family.activeScholarships && newState.family.activeScholarships.length > 0) {
        message = "Kamu sudah memiliki beasiswa yang aktif. Selesaikan dulu atau tunggu sampai masa berlakunya habis.";
      } else {
        const smarts = newState.stats.smarts;
        const roll = Math.random();

        if (smarts < 75) {
          message = "Nilai akademikmu belum cukup memuaskan untuk mendapatkan beasiswa.";
        } else if (roll < 0.7) { // 30% success chance if smart
          // Success! Determine type
          const typeRoll = Math.random();
          let scholarship = {
            id: `sch_${Date.now()}`,
            yearsLeft: Math.floor(Math.random() * 3) + 1 // 1-3 years
          };

          if (typeRoll < 0.2) {
            scholarship.name = "Beasiswa Prestasi Swasta (Full)";
            scholarship.coverage = "full";
            scholarship.amount = 100;
          } else if (typeRoll < 0.6) {
            scholarship.name = "Beasiswa Bakti Swasta (Partial 50%)";
            scholarship.coverage = "partial";
            scholarship.amount = 50;
          } else {
            const fixedAmount = 5_000_000 + (Math.floor(Math.random() * 5) * 1_000_000);
            scholarship.name = `Beasiswa Dana Pendidikan (Rp${fixedAmount.toLocaleString("id-ID")})`;
            scholarship.coverage = "fixed";
            scholarship.amount = fixedAmount;
          }

          if (!newState.family.activeScholarships) newState.family.activeScholarships = [];
          newState.family.activeScholarships.push(scholarship);
          message = `SELAMAT! Kamu berhasil mendapatkan ${scholarship.name} selama ${scholarship.yearsLeft} tahun.`;
        } else {
          message = "Maaf, lamaran beasiswamu ditolak. Coba lagi tahun depan dengan prestasi yang lebih baik.";
        }
      }
      break;

    case "work_part_time":
      if (newState.age < 15) {
        message = "Kamu terlalu muda untuk bekerja part-time.";
      } else {
        const salary = 500_000 + Math.floor(Math.random() * 500_000); // Gaji harian/mingguan yang dikumpulkan setahun
        newState.money += salary;
        newState.stats.health = Math.max(0, newState.stats.health - 5);
        newState.stats.happy = Math.max(0, newState.stats.happy - 3);
        message = `Kamu bekerja sampingan setelah sekolah dan mendapatkan Rp${salary.toLocaleString("id-ID")} untuk uang sakumu.`;
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

    case "driving_test":
      const simCost = 250_000;
      const canAfford = newState.profile?.isIndependent ? newState.money >= simCost : (newState.money >= simCost || newState.family.savings >= simCost);
      
      if (canAfford) {
        if (newState.profile?.isIndependent || newState.money >= simCost) {
          newState.money -= simCost;
        } else {
          newState.family.savings -= simCost;
        }

        const passChance = 0.5 + (newState.stats.smarts / 200);
        if (Math.random() < passChance) {
          if (!newState.profile.licenses) newState.profile.licenses = [];
          if (!newState.profile.licenses.includes("SIM A/C")) {
            newState.profile.licenses.push("SIM A/C");
          }
          newState.stats.happy = Math.min(100, newState.stats.happy + 10);
          message = "LULUS! Kamu berhasil melewati ujian teori dan praktik di Satpas. Sekarang kamu resmi memiliki SIM A/C.";
        } else {
          newState.stats.happy = Math.max(0, newState.stats.happy - 5);
          message = "GAGAL! Kamu melakukan kesalahan fatal saat ujian praktik. Silakan coba lagi tahun depan.";
        }
      } else {
        message = "Uangmu tidak cukup untuk membayar biaya administrasi ujian SIM.";
      }
      break;

    default:
      message = "Aktivitas tidak dikenal.";
  }

  pushLog(newState, message);
  return newState;
}
