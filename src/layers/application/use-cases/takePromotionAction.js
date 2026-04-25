import { cloneState, pushLog } from "@/layers/domain/entities/stateUtils";
import { getPromotionTarget } from "@/layers/domain/services/careerEngine";

export function takePromotionAction(state) {
  const next = cloneState(state);
  const target = getPromotionTarget(next);

  if (!target) {
    pushLog(next, "Belum memenuhi syarat promosi.");
    return next;
  }

  next.career.jobId = target.id;
  next.career.yearsInRole = 0;
  next.career.promotions += 1;

  pushLog(next, `Kamu mendapat promosi menjadi ${target.name}.`);
  return next;
}
