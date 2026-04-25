import { cloneState, pushLog } from "@/layers/domain/entities/stateUtils";
import { eventsCatalog } from "@/layers/infrastructure/catalogs/eventsCatalog";

export function handleEventChoice(state, optionId) {
  if (!state.currentEvent) {
    return state;
  }

  const next = cloneState(state);
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

  next.currentEvent = null;
  return next;
}
