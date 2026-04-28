import { cloneState, applyStatDelta, pushLog, clamp } from "@/layers/domain/entities/stateUtils";
import { assetsCatalog } from "@/layers/infrastructure/catalogs/assetsCatalog";

export function askParentsAction(state, assetId) {
  const next = cloneState(state);
  const asset = assetsCatalog.find((item) => item.id === assetId);

  if (!asset || next.profile.isIndependent) {
    return next;
  }

  // Check if already owned
  if (next.assets.some((owned) => owned.id === asset.id)) {
    return next;
  }

  // Calculate Success Chance
  let chance = 0.4; // Base 40%
  
  if (asset.isProductive) {
    chance += 0.3; // More likely to get productive items
  } else {
    chance -= 0.2; // Harder to get toys/games
  }

  // Impact of Smarts (New Logic)
  let smartsBonus = 0;
  if (next.stats.smarts < 40) {
    // Heavy penalty for low smarts: scales from 0 to -0.7
    smartsBonus = -0.7 * (1 - (next.stats.smarts / 40));
  } else if (next.stats.smarts > 80) {
    // Small bonus for high smarts: scales from 0 to +0.2
    smartsBonus = 0.2 * ((next.stats.smarts - 80) / 20);
  } else {
    // Linear transition between 40 and 80: scales from -0.1 to +0.1 roughly
    smartsBonus = (next.stats.smarts - 60) / 200; 
  }
  chance += smartsBonus;

  // Impact of Relationship (New Logic)
  const father = next.relations.find(r => r.id === "father");
  const mother = next.relations.find(r => r.id === "mother");
  const avgBond = ((father?.relationship ?? 50) + (mother?.relationship ?? 50)) / 2;
  
  // Relationship bonus: -0.4 to +0.4
  const bondBonus = (avgBond - 50) / 125; 
  chance += bondBonus;

  // Clamp chance between 5% and 95%
  chance = Math.max(0.05, Math.min(0.95, chance));

  const roll = Math.random();
  if (roll < chance) {
    // SUCCESS
    if (next.family.savings >= asset.price) {
      next.family.savings -= asset.price;
      next.assets.push({ id: asset.id, name: asset.name, boughtAtAge: next.age });
      next.stats = applyStatDelta(next.stats, asset.delta);
      pushLog(next, `HORE! Setelah merayu dan menunjukkan prestasimu, orang tuamu setuju membelikan ${asset.name}!`);
    } else {
      pushLog(next, `Orang tuamu sebenarnya ingin membelikan ${asset.name}, tapi tabungan keluarga sedang tidak cukup.`);
    }
  } else {
    // FAILURE
    next.stats.happy = clamp(next.stats.happy - 15);
    pushLog(next, `Yah... orang tuamu menolak membelikan ${asset.name}. Mereka bilang kamu harus lebih rajin belajar dulu. Kamu merasa sangat sedih.`);
  }

  return next;
}
