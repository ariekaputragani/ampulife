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

  if (next.money < asset.price) {
    pushLog(next, `Uang belum cukup untuk membeli ${asset.name}.`);
    return next;
  }

  next.money -= asset.price;
  next.assets.push({ id: asset.id, name: asset.name, boughtAtAge: next.age });
  next.stats = applyStatDelta(next.stats, asset.delta);

  pushLog(next, `Kamu membeli ${asset.name} seharga Rp${asset.price.toLocaleString("id-ID")}.`);
  return next;
}
