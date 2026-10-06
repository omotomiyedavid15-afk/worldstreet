import { rules } from "@/config/marketplace-rules";
import type { Category } from "@/lib/data/types";

/*
 * Every escrow claim comes from here (PLAN F9, flows L11.4, L14 test 8), so no surface
 * promises more than escrow does. Escrow covers payments made through WorldStreet
 * checkout for delivered goods and meet-ups; vehicles and property have no escrow
 * checkout (PLAN risk 7), and off-platform payments aren't covered (R-005).
 */

/** True for every listing, so no blanket "every deal". */
const HELD = "Pay through WorldStreet and your money is held until you get what you ordered.";

export const ESCROW = {
  /** Site description. */
  tagline: `Buy and sell near you. ${HELD}`,
  /** The home hero's first slide, under "Buy and sell near you". */
  held: HELD,
  /** Short claim next to a goods listing's price and delivery. */
  claim:
    "Pay through WorldStreet checkout and we hold your money until you confirm the item arrived as described, or the inspection window ends without a problem report.",
  /** For vehicles and property, which have no escrow checkout. */
  noEscrow: "No escrow checkout for this category. Inspect in person before you pay, and never pay a deposit to hold a viewing.",
  /** Short form for the home trust strip (L11.1), next to "How escrow works". */
  stripTitle: "Escrow on every checkout",
  // Not "until you confirm": the inspection window can also end it (L11.4).
  strip: "We hold your payment while you check the item, then pay the seller.",
  /** A goods listing with no returns: what still protects the buyer (L7). */
  noReturns: "No returns, but escrow still covers an item that isn't as described.",
  /** Seller payout timing (L11.4: the one claim every surface uses). */
  payout: "Sellers are paid after delivery is confirmed, usually within 24 hours.",
  /** The listing page's protection block (spec §7 ProtectionPanel, eBay "Shop with confidence"). */
  protectionTitle: "Shop with confidence",
  /** L7: protection doesn't end when the money is released. */
  afterRelease: `Something wrong after that? Report it within ${rules.protection.anyIssueDays} days of delivery; fakes and safety problems, within ${rules.protection.counterfeitSafetyDays} days.`,
  /** R-005: only checkout is covered. */
  offPlatform: "Paying the seller directly (transfer, cash before you see the item) isn't covered.",
  /** Where the rules are explained. */
  learnMoreHref: "/help/escrow",
} as const;

/** The inspection window a category gets before the seller is paid (L4), as a sentence. */
export function inspectionLine(hours: number, what: string) {
  return `${what} bought through checkout get ${hours} hours to check before the seller is paid.`;
}

export function escrowLine(category: Pick<Category, "kind">) {
  return category.kind === "goods" ? ESCROW.claim : ESCROW.noEscrow;
}
