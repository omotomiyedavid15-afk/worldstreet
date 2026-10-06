"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { cx } from "@/lib/cx";

/* DS Toast (`.cx-toast` in `.cx-toast-stack`). Call toast() from anywhere; render one
   <ToastViewport /> in the root layout. The stack is a polite live region that exists
   before any toast arrives, so screen readers announce each one. Timers pause while the
   pointer or focus is on a toast (WCAG 2.2.1). */

type Tone = "gain" | "loss" | "warning";
type Action = { label: string; href: string } | { label: string; onClick: () => void };
export type ToastInput = { message: ReactNode; tone?: Tone; action?: Action; duration?: number };
type Toast = ToastInput & { id: number };

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(input: ToastInput) {
  const id = nextId++;
  toasts = [...toasts.slice(-2), { ...input, id }]; // never more than three on screen
  emit();
  return id;
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const EMPTY: Toast[] = [];

export function ToastViewport() {
  const list = useSyncExternalStore(subscribe, () => toasts, () => EMPTY);
  return (
    <div className="cx-toast-stack" role="status" aria-live="polite" aria-label="Notifications">
      {list.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast: t }: { toast: Toast }) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const duration = t.duration ?? (t.action ? 8000 : 5000);
  const start = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => dismissToast(t.id), duration);
  };
  const stop = () => clearTimeout(timer.current);

  useEffect(() => {
    start();
    return stop;
    // Restart only for a new toast; pause/resume handle the rest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.id]);

  const action = t.action;
  return (
    <div className={cx("cx-toast", t.tone && t.tone !== "gain" && `cx-toast--${t.tone}`)} onMouseEnter={stop} onMouseLeave={start} onFocus={stop} onBlur={start}>
      <span className="dot" aria-hidden="true" />
      <span>{t.message}</span>
      {action &&
        ("href" in action ? (
          <Link href={action.href} className="cx-btn cx-btn--quiet cx-btn--sm" onClick={() => dismissToast(t.id)}>
            {action.label}
          </Link>
        ) : (
          <button type="button" className="cx-btn cx-btn--quiet cx-btn--sm" onClick={() => { action.onClick(); dismissToast(t.id); }}>
            {action.label}
          </button>
        ))}
    </div>
  );
}
