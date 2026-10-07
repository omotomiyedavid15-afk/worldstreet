import { useSyncExternalStore } from "react";
import { toast } from "@/components/ui";
import { createLocalStore } from "@/lib/local-store";

/*
 * MOCK SESSION. A stand-in for real auth so gated actions can follow R-004 now: a guest
 * who taps a gated action is asked to sign in, and the action they tapped runs once
 * they have. SignInSheet asks for a demo session; callers of requireAuth() keep their intent.
 * The toast fallback lets isolated component stories exercise the same contract.
 */

const session = createLocalStore("ws:mock-session", { signedIn: false }, (raw) => ({
  signedIn: typeof raw === "object" && raw !== null && (raw as { signedIn?: unknown }).signedIn === true,
}));

let pending: (() => void) | null = null;
let prompt: string | null = null;
const listeners = new Set<() => void>();
export function useAuthPrompt() {
  return useSyncExternalStore((listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => prompt, () => null);
}
function setPrompt(value: string | null) { prompt = value; listeners.forEach((listener) => listener()); }
export function requestSignIn() { setPrompt("continue"); }
export function cancelSignIn() { pending = null; setPrompt(null); }

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
  setPrompt(reason);
  if (!document.getElementById("sign-in-sheet")) toast({ message: `Sign in to ${reason}`, action: { label: "Sign in", onClick: signIn } });
}

export function signIn() {
  setPrompt(null);
  session.set({ signedIn: true });
  const resume = pending;
  pending = null;
  resume?.();
}

export function signOut() {
  cancelSignIn();
  session.set({ signedIn: false });
}
