import { eventsCatalog } from "@/layers/infrastructure/catalogs/eventsCatalog";
import { pushLog } from "@/layers/domain/entities/stateUtils";

function pickWeighted(items, rng = Math.random) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) {
    return null;
  }

  let roll = rng() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) {
      return item;
    }
  }

  return items[items.length - 1] ?? null;
}

export function triggerRandomEvent(state, rng = Math.random) {
  const candidates = eventsCatalog
    .filter((event) => state.age >= event.minAge && state.age <= event.maxAge)
    .map((event) => ({ event, weight: Math.max(0, event.weight(state)) }));

  if (candidates.length === 0) {
    return state;
  }

  const chance = 0.55;
  if (rng() > chance) {
    return state;
  }

  const picked = pickWeighted(candidates, rng);
  if (!picked) {
    return state;
  }

  if (picked.event.isInteractive) {
    const eventData = picked.event.apply(state);
    state.currentEvent = {
      id: picked.event.id,
      summary: eventData.summary,
      options: eventData.options.map((o) => ({ id: o.id, label: o.label })),
    };
  } else {
    const result = picked.event.apply(state);
    if (result && result.summary) {
      pushLog(state, `Event: ${result.summary}`);
    }
  }

  return state;
}
