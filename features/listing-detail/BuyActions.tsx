"use client";

import Link from "next/link";
import { useState } from "react";
import { ChatDotsIcon, HandshakeAgreementDealIcon, MinusCircleIcon, PlusCircleIcon, ShoppingCartIcon } from "@/components/icons";
import { buttonClass } from "@/components/ui";
import { SaveButton } from "@/features/listing-card/atoms";
import type { Category } from "@/lib/data/types";
import { formatCount } from "@/lib/format";

/* QuantityStepper + ActionStack (spec §7): eBay's order, one solid button (Buy it now),
   then Add to cart (ghost) and Make offer / Save (quiet). Vehicles and property have no
   checkout (PLAN risk 7): Contact seller (and Book a viewing for property) instead.
   Checkout, cart, offers and messages are placeholders until Phases 4–5, so each
   button still lands somewhere that says what it will do (F5). */

type Props = {
  listingId: string;
  title: string;
  price_minor: number;
  available: number;
  sold?: number;
  kind: Category["kind"];
  offers: boolean;
};

export function BuyActions({ listingId, title, price_minor, available, sold, kind, offers }: Props) {
  const [qty, setQty] = useState(1);
  const withQty = (path: string) => `${path}?listing=${listingId}${qty > 1 ? `&qty=${qty}` : ""}`;

  if (kind !== "goods") {
    return (
      <div className="ws-actions">
        <Link href={`/inbox?listing=${listingId}`} className={buttonClass({ block: true })}>
          <ChatDotsIcon />
          Contact seller
        </Link>
        {kind === "property" && (
          <Link href={`/inbox?listing=${listingId}&about=viewing`} className={buttonClass({ variant: "ghost", block: true })}>
            Book a viewing
          </Link>
        )}
        {offers && (
          <Link href={withQty("/offers")} className={buttonClass({ variant: "quiet", block: true })}>
            <HandshakeAgreementDealIcon />
            Make offer
          </Link>
        )}
        <SaveRow listingId={listingId} title={title} price_minor={price_minor} />
      </div>
    );
  }

  return (
    <div className="ws-actions">
      {available > 1 && (
        <div className="ws-qty">
          <span className="ws-qty__label" id={`qty-${listingId}`}>
            Quantity
          </span>
          <div className="ws-qty__stepper" role="group" aria-labelledby={`qty-${listingId}`}>
            <button type="button" className={buttonClass({ variant: "quiet", size: "sm", icon: true })} aria-label="One fewer" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)}>
              <MinusCircleIcon />
            </button>
            <output className="ws-qty__n cx-num" aria-live="polite">
              {qty}
            </output>
            <button type="button" className={buttonClass({ variant: "quiet", size: "sm", icon: true })} aria-label="One more" disabled={qty >= available} onClick={() => setQty((q) => q + 1)}>
              <PlusCircleIcon />
            </button>
          </div>
          <span className="ws-qty__stock">
            {formatCount(available)} available{sold ? ` · ${formatCount(sold)} sold` : ""}
          </span>
        </div>
      )}
      <Link href={withQty("/checkout")} className={buttonClass({ block: true, className: "ws-actions__buy" })}>
        Buy it now
      </Link>
      <Link href={withQty("/cart")} className={buttonClass({ variant: "ghost", block: true })}>
        <ShoppingCartIcon />
        Add to cart
      </Link>
      {offers && (
        <Link href={withQty("/offers")} className={buttonClass({ variant: "quiet", block: true })}>
          <HandshakeAgreementDealIcon />
          Make offer
        </Link>
      )}
      <SaveRow listingId={listingId} title={title} price_minor={price_minor} />
    </div>
  );
}

function SaveRow({ listingId, title, price_minor }: { listingId: string; title: string; price_minor: number }) {
  return (
    <div className="ws-actions__save">
      <SaveButton listingId={listingId} title={title} price_minor={price_minor} />
      <span aria-hidden="true">Save</span>
    </div>
  );
}
