"use client";

import { ThreeStage } from "./ThreeStage";

const loadHero = () => import("./scenes/hero").then((m) => m.hero);

/* The home hero's 3D backdrop (S0.10). Decorative: the headline and buttons sit on
   top in markup. Without 3D, a still gold glow takes its place. */
export function HeroStage({ className }: { className?: string }) {
  return <ThreeStage load={loadHero} className={className} fallback={<div className="ws-stage__glow" />} />;
}
