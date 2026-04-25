import { cloneState, pushLog } from "@/layers/domain/entities/stateUtils";

export function changeLifestyleAction(state, lifestyleId) {
  const next = cloneState(state);

  const lifestyleNames = { hemat: "Hemat", normal: "Normal", mewah: "Mewah" };
  
  if (!next.financial) {
    next.financial = { lifestyle: "normal" };
  }

  if (next.financial.lifestyle === lifestyleId) {
    return next; // No change
  }

  next.financial.lifestyle = lifestyleId;
  pushLog(next, `Kamu mengubah gaya hidupmu menjadi [${lifestyleNames[lifestyleId]}].`);

  return next;
}
