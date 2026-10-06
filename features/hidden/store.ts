import { useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";

/* "Not interested" and "Hide seller" (spec §5.3 HideListingMenuItem). Kept on this
   device; it feeds personalisation once there's a backend. `recent` remembers what was
   hidden in this visit, so that card can offer Undo while older hides just vanish. */

type Hidden = { listings: readonly string[]; sellers: readonly string[] };

const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const store = createLocalStore<Hidden>("ws:hidden", { listings: [], sellers: [] }, (raw) => {
  const r = (raw ?? {}) as Partial<Record<keyof Hidden, unknown>>;
  return { listings: strings(r.listings), sellers: strings(r.sellers) };
});

/** `from` is the card the buyer used, which is the only one that offers Undo. */
let recent: { kind: "listing" | "seller"; id: string; from: string } | null = null;

export function useHidden() {
  return useSyncExternalStore(store.subscribe, store.get, () => store.initial);
}

export function hiddenThisVisit() {
  return recent;
}

export function hideListing(id: string) {
  const h = store.get();
  recent = { kind: "listing", id, from: id };
  if (!h.listings.includes(id)) store.set({ ...h, listings: [...h.listings, id] });
}

export function hideSeller(id: string, fromListing: string) {
  const h = store.get();
  recent = { kind: "seller", id, from: fromListing };
  if (!h.sellers.includes(id)) store.set({ ...h, sellers: [...h.sellers, id] });
}

export function unhide(kind: "listing" | "seller", id: string) {
  const h = store.get();
  if (recent?.kind === kind && recent.id === id) recent = null;
  store.set(kind === "listing" ? { ...h, listings: h.listings.filter((x) => x !== id) } : { ...h, sellers: h.sellers.filter((x) => x !== id) });
}
