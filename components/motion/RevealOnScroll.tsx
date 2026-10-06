"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { MOTION_OK, loadGsap } from "@/lib/motion/gsap";
import { dur, gsapEase, rise, stagger } from "@/lib/motion/tokens";

/*
 * Items rise into place as they scroll into view (GSAP ScrollTrigger.batch), with the
 * DS stagger. Items already on screen at load only drift up a few pixels, without
 * fading, so the first photos still paint straight away (LCP). New items from "Show
 * more" join in. Nothing moves under reduced motion.
 */
export function RevealOnScroll({ children, count, selector = ":scope > ul > li" }: { children: ReactNode; count: number; selector?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let revert: (() => void) | undefined;
    let cancelled = false;
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const fresh = [...root.querySelectorAll<HTMLElement>(`${selector}:not([data-revealed])`)];
        fresh.forEach((el) => el.setAttribute("data-revealed", ""));
        const fold = window.innerHeight * 0.92;
        const onScreen = fresh.filter((el) => el.getBoundingClientRect().top < fold);
        const below = fresh.filter((el) => el.getBoundingClientRect().top >= fold);
        if (onScreen.length) gsap.from(onScreen, { y: 12, duration: dur.slow, ease: gsapEase.out, stagger, clearProps: "transform" });
        if (below.length) {
          gsap.set(below, { opacity: 0, y: rise });
          ScrollTrigger.batch(below, {
            start: "top 94%",
            once: true,
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: dur.slow, ease: gsapEase.out, stagger, overwrite: true, clearProps: "transform,opacity" }),
          });
        }
      });
      revert = () => mm.revert();
    });
    return () => {
      cancelled = true;
      revert?.();
    };
  }, [count, selector]);

  return (
    <div ref={ref} className="ws-reveal">
      {children}
    </div>
  );
}
