import { useSyncExternalStore } from 'react';
import { readJson, writeJson } from '@/lib/offline/fileStore';

/**
 * How planned calls are made:
 *  - 'territory'   → the default doctor-by-doctor flow (current behavior).
 *  - 'institution' → group / walking calls (no doctor listing).
 */
export type CallMode = 'territory' | 'institution';

const STORAGE_KEY = 'call-mode';

let currentMode: CallMode = 'territory';
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

// Hydrate the persisted preference once on load.
void (async () => {
  const saved = await readJson<CallMode>(STORAGE_KEY);
  if (saved === 'territory' || saved === 'institution') {
    currentMode = saved;
    emit();
  }
})();

export function getCallMode(): CallMode {
  return currentMode;
}

export function setCallMode(mode: CallMode) {
  if (mode === currentMode) return;
  currentMode = mode;
  emit();
  void writeJson(STORAGE_KEY, mode);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** React hook: `{ callMode, setCallMode }`. */
export function useCallMode() {
  const callMode = useSyncExternalStore(subscribe, getCallMode, getCallMode);
  return { callMode, setCallMode };
}
