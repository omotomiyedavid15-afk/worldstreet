import { describe, expect, it } from "vitest";
import { canDispute, nextDispute, type DisputeEvent, type DisputeStatus } from "./dispute";
describe("dispute state machine (§6.4)", () => {
  const arrows = [
    ["opened", "notify_seller", "seller_response"], ["seller_response", "accept_refund", "resolved_refund"],
    ["seller_response", "offer_return", "return_requested"], ["seller_response", "offer_partial", "partial_offer"],
    ["seller_response", "escalate", "escalated"], ["seller_response", "seller_timeout", "auto_decided"],
    ["partial_offer", "accept_partial", "resolved_partial"], ["partial_offer", "reject_partial", "escalated"],
    ["return_requested", "ship_return", "return_in_transit"], ["return_in_transit", "receive_return", "return_received"],
    ["return_received", "approve_return", "resolved_refund"], ["return_received", "reject_return", "escalated"],
    ["escalated", "ops_refund", "resolved_refund"], ["escalated", "ops_release", "resolved_release"], ["escalated", "ops_partial", "resolved_partial"], ["auto_decided", "auto_refund", "resolved_refund"],
  ] as const;
  it.each(arrows)("%s + %s → %s", (from, event, to) => expect(nextDispute(from, event)).toBe(to));
  it("rejects every undocumented arrow", () => {
    const states: DisputeStatus[] = ["opened", "seller_response", "return_requested", "partial_offer", "return_in_transit", "return_received", "escalated", "auto_decided", "resolved_refund", "resolved_partial", "resolved_release"];
    const events: DisputeEvent[] = ["notify_seller", "accept_refund", "offer_return", "offer_partial", "escalate", "seller_timeout", "accept_partial", "reject_partial", "ship_return", "receive_return", "approve_return", "reject_return", "ops_refund", "ops_release", "ops_partial", "auto_refund"];
    for (const state of states) for (const event of events) if (!arrows.some(([s, e]) => s === state && e === event)) { expect(canDispute(state, event)).toBe(false); expect(() => nextDispute(state, event)).toThrow(); }
  });
});
