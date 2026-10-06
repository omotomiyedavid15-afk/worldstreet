import { useSyncExternalStore } from "react";
import { toast } from "@/components/ui";
import { createLocalStore } from "@/lib/local-store";

/*
 * MOCK SESSION. A stand-in for real auth so gated actions can follow R-004 now: a guest
 * who taps a gated action is asked to sign in, and the action they tapped runs once
 * they have. Phase 4 swaps the toast prompt for SignInSheet + useAuthGate; callers of
 * requireAuth() don't change.
 */

const session = createLocalStore("ws:mock-session", { signedIn: false }, (raw) => ({
  signedIn: typeof raw === "object" && raw !== null && (raw as { signedIn?: unknown }).signedIn === true,
}));

let pending: (() => void) | null = null;

export function useSession() {
  return useSyncExternalStore(session.subscribe, session.get, () => session.initial);
}

/** Runs `action` now if signed in; otherwise asks the guest to sign in and runs it after. */
export function requireAuth(reason: string, action: () => void) {
  if (session.get().signedIn) {
    action();
    return;
  }
  pending = action;
  toast({ message: `Sign in to ${reason}`, action: { label: "Sign in", onClick: signIn } });
}

export function signIn() {
  session.set({ signedIn: true });
  const resume = pending;
  pending = null;
  resume?.();
}

export function signOut() {
  pending = null;
  session.set({ signedIn: false });
}
