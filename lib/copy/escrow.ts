import type { Category } from "@/lib/data/types";

/*
 * Every escrow claim comes from here (PLAN F9, flows L11.4, L14 test 8), so no surface
 * promises more than escrow does. Escrow covers payments made through WorldStreet
 * checkout for delivered goods and meet-ups; vehicles and property have no escrow
 * checkout (PLAN risk 7), and off-platform payments aren't covered (R-005).
 */

export const ESCROW = {
  /** Site description and home: true for every listing, so no blanket "every deal". */
  tagline: "Buy and sell near you. Pay through WorldStreet and your money is held until you get what you ordered.",
  /** Short claim next to a goods listing's price and delivery. */
  claim:
    "Pay through WorldStreet checkout and we hold your money until you confirm the item arrived as described, or the inspection window ends without a problem report.",
  /** For vehicles and property, which have no escrow checkout. */
  noEscrow: "No escrow checkout for this category. Inspect in person before you pay, and never pay a deposit to hold a viewing.",
  /** Where the rules are explained. */
  learnMoreHref: "/help/escrow",
} as const;

export function escrowLine(category: Pick<Category, "kind">) {
  return category.kind === "goods" ? ESCROW.claim : ESCROW.noEscrow;
}
