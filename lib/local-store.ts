/*
 * A tiny external store over localStorage for useSyncExternalStore (PLAN §7 Q4: no state
 * library yet). Storage can be missing or throw (private mode, blocked site data), so
 * every read and write is guarded and the store keeps working in memory. The server
 * and the first client render see `initial`, which keeps hydration consistent.
 */
export type LocalStore<T> = {
  get(): T;
  set(next: T): void;
  subscribe(listener: () => void): () => void;
  readonly initial: T;
};

export function createLocalStore<T>(key: string, initial: T, parse: (raw: unknown) => T): LocalStore<T> {
  let value = initial;
  let loaded = false;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  function load() {
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      value = raw === null ? initial : parse(JSON.parse(raw));
    } catch {
      value = initial;
    }
  }

  function onStorage(e: StorageEvent) {
    if (e.key !== key) return;
    load();
    emit();
  }

  return {
    initial,
    get() {
      if (!loaded && typeof window !== "undefined") load();
      return value;
    },
    set(next) {
      value = next;
      loaded = true;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Keep the in-memory value; it just won't survive a reload.
      }
      emit();
    },
    subscribe(listener) {
      if (listeners.size === 0) window.addEventListener("storage", onStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
  };
}
