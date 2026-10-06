import { useSyncExternalStore } from "react";
import { rules } from "@/config/marketplace-rules";
import { createLocalStore } from "@/lib/local-store";

/* Saved listings (B4). Kept in localStorage until accounts exist; the API matches what a
   server-backed store will need, so only this file changes then. */

const saved = createLocalStore<readonly string[]>("ws:saved", [], (raw) =>
  Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string") : [],
);

export function useSavedIds() {
  return useSyncExternalStore(saved.subscribe, saved.get, () => saved.initial);
}

export function useIsSaved(listingId: string) {
  return useSavedIds().includes(listingId);
}

/** "full" when the list is at its cap (R-027): nothing is dropped to make room. */
export function saveListing(listingId: string): "saved" | "already" | "full" {
  const ids = saved.get();
  if (ids.includes(listingId)) return "already";
  if (ids.length >= rules.saved.maxListings) return "full";
  saved.set([listingId, ...ids]);
  return "saved";
}

export function unsaveListing(listingId: string) {
  saved.set(saved.get().filter((id) => id !== listingId));
}
