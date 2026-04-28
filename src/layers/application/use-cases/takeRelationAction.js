import { cloneState, clamp, pushLog } from "@/layers/domain/entities/stateUtils";

export function takeRelationAction(state, relationId, actionKey) {
  const next = cloneState(state);
  const relation = next.relations.find((item) => item.id === relationId);

  if (!relation) return next;

  // Prevent multiple interactions in the same year
  if (relation.lastInteractionAge === next.age && actionKey !== "ask_out" && actionKey !== "propose") {
    return next;
  }

  if (actionKey === "chat") {
    relation.relationship = clamp(relation.relationship + 5);
    relation.lastInteractionAge = next.age;
    pushLog(next, `Kamu mengobrol santai dengan ${relation.name}. Kedekatan meningkat.`);
  } 
  
  else if (actionKey === "rant") {
    relation.relationship = clamp(relation.relationship + 8);
    next.stats.happy = clamp(next.stats.happy + 5);
    relation.lastInteractionAge = next.age;
    pushLog(next, `Kamu curhat panjang lebar kepada ${relation.name}. Kamu merasa lebih lega.`);
  }

  else if (actionKey === "ask_money") {
    if (relation.status !== "family") {
      pushLog(next, `Kamu tidak enak hati meminta uang kepada ${relation.name} karena dia bukan keluargamu.`);
      return next;
    }

    // --- CALCULATE SUCCESS CHANCE (Same logic as Asset Request) ---
    let chance = 0.5; // Base 50% for money

    // Smarts Impact
    if (next.stats.smarts < 40) {
      chance -= 0.7 * (1 - (next.stats.smarts / 40));
    } else if (next.stats.smarts > 80) {
      chance += 0.2 * ((next.stats.smarts - 80) / 20);
    } else {
      chance += (next.stats.smarts - 60) / 200;
    }

    // Relationship Impact
    const bondBonus = (relation.relationship - 50) / 125;
    chance += bondBonus;

    chance = Math.max(0.05, Math.min(0.95, chance));

    if (Math.random() < chance) {
      // SUCCESS
      const amount = next.family.wealthStatus === "rich" ? 200_000 : 50_000;
      next.money += amount;
      relation.relationship = clamp(relation.relationship - 3);
      relation.lastInteractionAge = next.age;
      pushLog(next, `Berhasil! ${relation.name} memberikanmu uang jajan tambahan sebesar Rp${amount.toLocaleString("id-ID")}.`);
    } else {
      // FAILURE
      relation.relationship = clamp(relation.relationship - 10);
      next.stats.happy = clamp(next.stats.happy - 10);
      relation.lastInteractionAge = next.age;
      pushLog(next, `${relation.name} menolak memberimu uang. "Cari uang itu susah, jangan cuma bisa minta!" katanya.`);
    }
  }

  else if (actionKey === "gift") {
    const cost = 1_000_000;
    if (next.money < cost) {
      pushLog(next, "Uangmu tidak cukup untuk membeli hadiah.");
      return next;
    }
    next.money -= cost;
    relation.relationship = clamp(relation.relationship + 15);
    relation.lastInteractionAge = next.age;
    pushLog(next, `Kamu memberikan hadiah spesial kepada ${relation.name}. Dia terlihat sangat senang!`);
  } 

  else if (actionKey === "ask_out") {
    if (next.age < 14) {
      pushLog(next, "Kamu masih terlalu kecil untuk memikirkan pacaran.");
      return next;
    }
    if (relation.gender === next.profile.gender) {
      pushLog(next, `Kamu merasa ${relation.name} adalah teman yang baik, tapi kamu hanya tertarik pada lawan jenis.`);
      return next;
    }
    if (relation.relationship < 60) {
      relation.relationship = clamp(relation.relationship - 10);
      pushLog(next, `${relation.name} menolak ajakan pacaranmu karena merasa kalian belum cukup dekat.`);
    } else {
      relation.status = "partner";
      relation.relationship = clamp(relation.relationship + 10);
      pushLog(next, `Luar biasa! ${relation.name} menerima pernyataan cintamu. Kalian sekarang resmi berpacaran.`);
    }
  }

  else if (actionKey === "propose") {
    if (relation.status !== "partner") {
      pushLog(next, "Kamu harus berpacaran dulu sebelum melamar.");
      return next;
    }
    const weddingCost = 50_000_000;
    if (next.money < weddingCost) {
      pushLog(next, `Kamu butuh setidaknya Rp${weddingCost.toLocaleString("id-ID")} untuk biaya pernikahan sederhana.`);
      return next;
    }

    if (relation.relationship < 90) {
      pushLog(next, `${relation.name} merasa belum siap untuk menikah denganmu.`);
    } else {
      next.money -= weddingCost;
      relation.status = "spouse";
      relation.relationship = 100;
      pushLog(next, `Selamat! Lamaranmu diterima. Kamu dan ${relation.name} kini resmi menikah dalam sebuah upacara yang indah.`);
    }
  }

  return next;
}
