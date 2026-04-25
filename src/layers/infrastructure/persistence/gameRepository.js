import { SAVE_VERSION, createInitialGameState } from "@/layers/domain/entities/gameState";

const STORAGE_KEY = "ampulife-layered-save";

function parseSave(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (parsed.version !== SAVE_VERSION) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function loadGameState() {
  if (typeof window === "undefined") {
    return createInitialGameState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createInitialGameState();
  }

  return parseSave(raw) ?? createInitialGameState();
}

export function saveGameState(state) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearGameState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
