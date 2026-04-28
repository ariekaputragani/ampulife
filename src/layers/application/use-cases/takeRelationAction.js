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
