import { describe, expect, it } from "vitest";
import { canOrder, nextOrder, type OrderEvent, type OrderStatus } from "./order";

describe("order state machine (§6.2)", () => {
  const arrows = [
    ["payment_pending", "pay", "paid"], ["payment_pending", "payment_fail", "cancelled"],
    ["paid", "prepare", "preparing"], ["paid", "cancel", "cancelled"],
    ["preparing", "dispatch", "dispatched"], ["preparing", "cancel", "cancelled"],
    ["dispatched", "transit", "in_transit"], ["in_transit", "out_for_delivery", "out_for_delivery"],
    ["out_for_delivery", "deliver", "delivered"], ["out_for_delivery", "delivery_fail", "delivery_failed"],
    ["delivery_failed", "reattempt", "out_for_delivery"], ["delivery_failed", "return", "returned"],
    ["delivered", "confirm", "completed"], ["delivered", "dispute", "disputed"],
    ["disputed", "resolve_seller", "completed"], ["disputed", "resolve_buyer", "refunded"],
    ["returned", "refund", "refunded"], ["cancelled", "refund", "refunded"],
  ] as const;
  it.each(arrows)("%s + %s → %s", (from, event, to) => expect(nextOrder(from, event)).toBe(to));
  it("rejects every undocumented arrow", () => {
    const states: OrderStatus[] = ["payment_pending", "paid", "preparing", "dispatched", "in_transit", "out_for_delivery", "delivery_failed", "delivered", "disputed", "returned", "cancelled", "completed", "refunded"];
    const events: OrderEvent[] = ["pay", "payment_fail", "prepare", "cancel", "dispatch", "transit", "out_for_delivery", "deliver", "delivery_fail", "reattempt", "return", "confirm", "dispute", "resolve_seller", "resolve_buyer", "refund"];
    for (const state of states) for (const event of events) if (!arrows.some(([s, e]) => s === state && e === event)) {
      expect(canOrder(state, event)).toBe(false);
      expect(() => nextOrder(state, event)).toThrow();
    }
  });
});
