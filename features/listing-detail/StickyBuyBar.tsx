"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui";
import { SaveButton } from "@/features/listing-card/atoms";

/* StickyBuyBar (spec §7, §3.2): on phones, once the buy box's buttons scroll out of
   view, the price, the total and the main action stay at the bottom in place of the
   bottom nav. The total is the same figure the buy box shows (R-020). */
type Props = {
  watch: string;
  listingId: string;
  title: string;
  price: string;
  price_minor: number;
  total?: string;
  action: { label: string; href: string };
};

export function StickyBuyBar({ watch, listingId, title, price, price_minor, total, action }: Props) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    // The main button in the buy box; under the sticky header counts as out of view.
    const box = document.getElementById(watch);
    const target = box?.querySelector<HTMLElement>("a, button") ?? box;
    if (!target) return;
    const offset = parseFloat(getComputedStyle(document.body).getPropertyValue("--cx-sticky-offset")) || 0;
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting && e.boundingClientRect.top < offset), { rootMargin: `-${offset}px 0px 0px 0px` });
    io.observe(target);
    return () => io.disconnect();
  }, [watch]);

  return (
    <div className="ws-stickybuy" data-shown={shown} aria-hidden={!shown} inert={!shown}>
      <div className="ws-stickybuy__price">
        <span className="ws-stickybuy__now cx-num">{price}</span>
        {total && <span className="ws-stickybuy__total">{total}</span>}
      </div>
      <SaveButton listingId={listingId} title={title} price_minor={price_minor} />
      <Link href={action.href} className={buttonClass({ size: "sm" })}>
        {action.label}
      </Link>
    </div>
  );
}
