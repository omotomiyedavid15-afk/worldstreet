/*
 * GSAP, loaded on demand, for scroll-driven and timeline motion (result reveals now;
 * the home hero in S0.10). Motion handles component state; GSAP handles scroll and
 * sequences. gsap.matchMedia keeps every timeline behind the reduced-motion check.
 */

let loading: Promise<{ gsap: typeof import("gsap").gsap; ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger }> | null = null;

export function loadGsap() {
  loading ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);
    return { gsap, ScrollTrigger };
  });
  return loading;
}

export const REDUCED = "(prefers-reduced-motion: reduce)";
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
