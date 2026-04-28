import { cloneState, applyStatDelta, pushLog } from "@/layers/domain/entities/stateUtils";
import { assetsCatalog } from "@/layers/infrastructure/catalogs/assetsCatalog";

export function takeAssetAction(state, assetId) {
  const next = cloneState(state);
  const asset = assetsCatalog.find((item) => item.id === assetId);

  if (!asset) {
    return next;
  }

  if (next.assets.some((owned) => owned.id === asset.id)) {
    pushLog(next, `${asset.name} sudah kamu miliki.`);
    return next;
  }

  if (next.age < asset.minAge) {
    pushLog(next, `Umur belum cukup untuk membeli ${asset.name}.`);
    return next;
  }

  const isIndependent = next.profile?.isIndependent;
  const availableFunds = isIndependent ? next.money : next.family.savings;

  if (availableFunds < asset.price) {
    pushLog(next, `Dana tidak cukup untuk membeli ${asset.name}.`);
    return next;
  }

  if (isIndependent) {
    next.money -= asset.price;
  } else {
    next.family.savings -= asset.price;
  }

  next.assets.push({ id: asset.id, name: asset.name, boughtAtAge: next.age });
  next.stats = applyStatDelta(next.stats, asset.delta);

  const buyer = isIndependent ? "Kamu membeli" : "Orang tuamu membelikan";
  pushLog(next, `${buyer} ${asset.name} seharga Rp${asset.price.toLocaleString("id-ID")}.`);
  return next;
}
