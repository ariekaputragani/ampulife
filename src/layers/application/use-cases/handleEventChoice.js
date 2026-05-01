import { cloneState, pushLog } from "@/layers/domain/entities/stateUtils";
import { eventsCatalog } from "@/layers/infrastructure/catalogs/eventsCatalog";
import { resolveChoice } from "./resolveChoice";

export function handleEventChoice(state, optionId) {
  if (!state.currentEvent) {
    return state;
  }

  let next = cloneState(state);

  const catalogEvent = eventsCatalog.find((e) => e.id === next.currentEvent.id);

  if (catalogEvent && catalogEvent.isInteractive) {
    // Re-run apply to get the options with resolve functions
    const eventData = catalogEvent.apply(next);
    const option = eventData.options.find((o) => o.id === optionId);

    if (option) {
      const resultMessage = option.resolve(next);
      pushLog(next, resultMessage);
    }
  } 
  // Support inline events defined directly in currentEvent
  else if (next.currentEvent && next.currentEvent.options) {
    const eventId = next.currentEvent.id;
    const option = next.currentEvent.options.find((o) => o.id === optionId);
    
    if (option) {
      // Execute logic in resolveChoice if it's the funeral
      if (eventId === "funeral_decision") {
        next = resolveChoice(next, eventId, optionId);
      }
    }
  }

  next.currentEvent = null;
  return next;
}
