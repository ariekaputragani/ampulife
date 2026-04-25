import { cloneState, clamp, pushLog } from "@/layers/domain/entities/stateUtils";

const RELATION_ACTIONS = {
  praise: { bond: 8, support: 2, text: "Kamu memuji" },
  spendTime: { bond: 10, support: 1, text: "Kamu menghabiskan waktu dengan" },
  insult: { bond: -14, support: -6, text: "Kamu menghina" },
};

export function takeRelationAction(state, relationId, actionKey) {
  const next = cloneState(state);
  const relation = next.relations.find((item) => item.id === relationId);
  const action = RELATION_ACTIONS[actionKey];

  if (!relation || !action) {
    return next;
  }

  relation.bond = clamp(relation.bond + action.bond);
  relation.support = clamp(relation.support + action.support);

  pushLog(next, `${action.text} ${relation.label} (${relation.name}).`);
  return next;
}
