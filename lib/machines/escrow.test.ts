import { describe, expect, it } from "vitest";
import { canEscrow, nextEscrow, type EscrowEvent, type EscrowStatus } from "./escrow";
describe("escrow state machine (L3)", () => {
  const arrows = [
    ["awaiting_payment", "capture", "held"], ["awaiting_payment", "payment_fail", "closed"],
    ["held", "cancel", "cancelled_refunding"], ["held", "eligible", "release_eligible"], ["held", "freeze", "frozen"],
    ["release_eligible", "freeze", "frozen"], ["release_eligible", "release", "seller_pending"],
    ["seller_pending", "payout_available", "seller_available"], ["seller_pending", "freeze", "frozen"], ["seller_available", "withdraw", "withdrawn"],
    ["frozen", "seller_ruling", "seller_pending"], ["frozen", "partial_ruling", "partial_split"], ["frozen", "buyer_ruling", "refunding"],
    ["partial_split", "buyer_ruling", "refunding"], ["partial_split", "seller_ruling", "seller_pending"],
    ["cancelled_refunding", "refund_confirm", "refunded"], ["cancelled_refunding", "refund_fail", "refund_failed"],
    ["refunding", "refund_confirm", "refunded"], ["refunding", "refund_fail", "refund_failed"],
    ["refund_failed", "refund_retry", "refunding"], ["refund_failed", "wallet_credit", "refunded"],
  ] as const;
  it.each(arrows)("%s + %s → %s", (from, event, to) => expect(nextEscrow(from, event)).toBe(to));
  it("rejects every undocumented arrow", () => {
    const states: EscrowStatus[] = ["awaiting_payment", "held", "release_eligible", "seller_pending", "seller_available", "frozen", "partial_split", "cancelled_refunding", "refunding", "refund_failed", "refunded", "withdrawn", "closed"];
    const events: EscrowEvent[] = ["capture", "payment_fail", "cancel", "eligible", "freeze", "release", "payout_available", "withdraw", "seller_ruling", "partial_ruling", "buyer_ruling", "refund_confirm", "refund_fail", "refund_retry", "wallet_credit"];
    for (const state of states) for (const event of events) if (!arrows.some(([s, e]) => s === state && e === event)) { expect(canEscrow(state, event)).toBe(false); expect(() => nextEscrow(state, event)).toThrow(); }
  });
});
