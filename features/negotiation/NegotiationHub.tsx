"use client";
import Link from "next/link";
import { useState } from "react";
import { buttonClass } from "@/components/ui";
import { requireAuth, useSession } from "@/features/auth/session";
import { formatCurrency, kobo } from "@/lib/money";
import type { Context, Role } from "./model";
import { offersLeft, remainingStock } from "./model";
import { dispatch, useNegotiations } from "./store";
import { OfferForm, type Run } from "./OfferForm";
import { OfferCard } from "./OfferCard";
import { Conversation } from "./Conversation";

export type DealListing = Context["listing"] & { title: string; slug: string; shop_name: string };
export function NegotiationHub({ listings, selected, mode, qty = 1 }: { listings: DealListing[]; selected?: string; mode: "offers" | "inbox"; qty?: number }) {
  const state = useNegotiations();
  const { signedIn } = useSession();
  const [role, setRole] = useState<Role>("buyer");
  const [error, setError] = useState("");
  const listing = listings.find((l) => l.id === selected);
  const thread = state.threads.find((t) => t.id === selected);
  const offers = state.offers.filter((o) => o.listing_id === selected);
  const active = offers.some((o) => ["pending", "countered", "accepted"].includes(o.status));
  const available = listing ? remainingStock(state, listing) : 0;
  const blocked = !!listing && state.blocked.includes(listing.seller_id);
  const run: Run = (command, done) => {
    if (!listing) return;
    setError("");
    requireAuth(mode === "offers" ? "manage offers" : "send messages", () => {
      try { dispatch(command, { listing, role, now: Date.now() }); done?.(); }
      catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    });
  };
  return <div className="ws-deal-page ws-deal-stack">
    <div className="ws-deal-heading"><div><p className="ws-deal-eyebrow">Your marketplace</p><h1>{mode === "offers" ? "Offers" : "Inbox"}</h1></div><Link className={buttonClass({ variant: "ghost" })} href={mode === "offers" ? "/inbox" : "/offers"}>{mode === "offers" ? "Inbox" : "Offers"}</Link></div>
    <div className="ws-deal-demo"><p>Demo workspace · Conversations stay on this device. Messages are not delivered to real sellers and payments are simulated.</p><label>Demo perspective <select value={role} onChange={(e) => { setRole(e.target.value as Role); setError(""); }}><option value="buyer">Buyer</option><option value="seller">Seller</option></select></label></div>
    <div className="ws-deal-layout" data-selected={!!listing}>
      <nav className="ws-deal-sidebar" aria-label={mode === "offers" ? "Offer conversations" : "Conversations"}>
        <h2>{mode === "offers" ? "Your offers" : "Messages"}</h2>
        {!state.threads.length && <p className="ws-deal-muted">{signedIn ? "No conversations yet." : "Sign in when you’re ready to send your first message or offer."}</p>}
        <ul>{state.threads.filter((t) => mode === "inbox" || state.offers.some((o) => o.listing_id === t.id)).map((t) => {
          const item = listings.find((l) => l.id === t.id);
          return <li key={t.id}><Link href={mode === "inbox" ? `/inbox/${t.id}` : `/offers?listing=${t.id}`} aria-current={selected === t.id ? "page" : undefined}><strong>{item?.shop_name ?? "Unavailable listing"}</strong><span>{item?.title ?? t.id}</span><small>{t.messages.at(-1)?.body}</small></Link></li>;
        })}</ul>
      </nav>
      <div className="ws-deal-stack ws-deal-content">
        {listing ? <>
          <Link className="ws-deal-back" href={mode === "offers" ? "/offers" : "/inbox"}>All {mode === "offers" ? "offers" : "conversations"}</Link>
          <header className="ws-deal-pinned ws-deal-stack"><p className="ws-deal-eyebrow">{listing.shop_name}</p><Link href={`/listing/${listing.id}-${listing.slug}`}><h2>{listing.title}</h2></Link><p>{formatCurrency(kobo(listing.price_minor))} <span className="ws-deal-muted">asking price per item</span></p></header>
          {error && <p className="ws-deal-warning" role="alert" tabIndex={-1} ref={(node) => node?.focus()}>{error}</p>}
          {role === "buyer" && <div className="ws-deal-actions"><button className={buttonClass({ variant: "quiet", size: "sm" })} onClick={() => run({ type: "block", id: crypto.randomUUID(), blocked: !blocked })}>{blocked ? "Unblock seller" : "Block seller"}</button><button className={buttonClass({ variant: "quiet", size: "sm" })} disabled={blocked || thread?.reported} onClick={() => run({ type: "report", id: crypto.randomUUID() })}>{thread?.reported ? "Flagged in demo" : "Report conversation"}</button></div>}
          {available === 0 && <p role="status">No more stock is available for a new deal.</p>}
          {mode === "offers" && role === "buyer" && !active && !blocked && available > 0 && listing.status === "live" && <OfferForm key={listing.id} price={listing.price_minor} qty={Math.min(qty, available)} available={available} left={offersLeft(state, listing.id)} run={run} />}
          {offers.slice().reverse().map((offer) => <OfferCard key={offer.id} offer={offer} request={state.requests.find((r) => r.offer_id === offer.id)} role={role} run={run} blocked={blocked} escrow={!["vehicles", "property"].includes(listing.category_id)} />)}
          {mode === "inbox" && !active && !blocked && available > 0 && listing.status === "live" && <Link className={buttonClass({ variant: "ghost" })} href={`/offers?listing=${listing.id}`}>Make offer</Link>}
          <Conversation key={`${listing.id}:${role}`} listingId={listing.id} thread={thread} role={role} run={run} blocked={blocked} />
        </> : <section className="ws-deal-panel ws-deal-empty"><h2>{selected ? "This listing is unavailable" : "A good deal starts with a conversation"}</h2><p>{selected ? "Choose another conversation or browse available listings." : "Choose a conversation, or find something you like and message the seller."}</p><Link className={buttonClass({ variant: "ghost" })} href="/search">Browse listings</Link></section>}
      </div>
    </div>
  </div>;
}
