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

    default:
      message = "Aktivitas tidak dikenal.";
  }

  pushLog(newState, message);
  return newState;
}
