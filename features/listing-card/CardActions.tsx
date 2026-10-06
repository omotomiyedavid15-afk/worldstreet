"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { DotsVerticalIcon, StoreIcon, XmarkCircleIcon } from "@/components/icons";
import { buttonClass, Menu } from "@/components/ui";
import { hiddenThisVisit, hideListing, hideSeller, unhide, useHidden } from "@/features/hidden/store";

/* The card's overflow menu (spec §5.1 item 10) and the gate that removes hidden cards.
   eBay's card menu offers hiding; "Find similar" and "Report" join when their pages
   exist (S0.9, Phase 3), so the menu never holds a dead end (audit F5). */

type Target = { listingId: string; title: string; sellerId: string; shopName: string };

export function CardMenu({ listingId, title, sellerId, shopName }: Target) {
  return (
    <Menu
      label={`More actions for ${title}`}
      trigger={<DotsVerticalIcon />}
      items={[
        { label: "Not interested", icon: <XmarkCircleIcon />, onSelect: () => hideListing(listingId) },
        { label: `Hide ${shopName}`, icon: <StoreIcon />, onSelect: () => hideSeller(sellerId, listingId) },
      ]}
    />
  );
}

/**
 * Renders the card unless it's hidden. Something hidden just now leaves a short note
 * with Undo in its place, and focus moves to Undo so keyboard users aren't dropped;
 * things hidden on an earlier visit simply don't render.
 */
export function HideGate({ listingId, sellerId, shopName, children }: Omit<Target, "title"> & { children: ReactNode }) {
  const hidden = useHidden();
  const undoRef = useRef<HTMLButtonElement>(null);
  const kind = hidden.listings.includes(listingId) ? "listing" : hidden.sellers.includes(sellerId) ? "seller" : null;
  const recent = hiddenThisVisit();
  const justNow = kind !== null && recent?.kind === kind && recent.from === listingId;

  useEffect(() => {
    if (justNow) undoRef.current?.focus();
  }, [justNow]);

  if (kind === null) return children;
  if (!justNow) return null;
  return (
    <div className="cx-card ws-card-hidden" role="status">
      <p>{kind === "listing" ? "Hidden. You won't see this listing again." : `Hidden. You won't see listings from ${shopName}.`}</p>
      <button ref={undoRef} type="button" className={buttonClass({ variant: "ghost", size: "sm" })} onClick={() => unhide(kind, kind === "listing" ? listingId : sellerId)}>
        Undo
      </button>
    </div>
  );
}
