import { describe, expect, it } from "vitest";
import { balances } from "@/lib/ledger";
import { canAutoRelease, executeOrder, initialOrdersState, parseOrdersState, reconcileExpiredOrders, remainingFromServer } from "./model";

describe("local order repository (Phase 6)", () => {
  it("releases only with proof and no dispute, hold or chargeback", () => {
    const state = initialOrdersState(); const order = state.orders[0];
    expect(canAutoRelease(order)).toBe(true);
    for (const patch of [{ delivery_proof: false }, { ops_hold: true }, { chargeback_pending: true }, { dispute: { id: "d" } }]) expect(canAutoRelease({ ...order, ...patch } as typeof order)).toBe(false);
    const confirmed = executeOrder(state, { type: "confirm", id: "confirm", order_id: order.id }, 100);
    expect(confirmed.orders[0]).toMatchObject({ status: "completed", escrow_status: "seller_pending" });
    expect(balances(confirmed.orders[0].ledger).escrow_held).toBe(0);
    expect(executeOrder(confirmed, { type: "confirm", id: "confirm", order_id: order.id }, 100)).toBe(confirmed);
  });
  it("auto-releases only after the deadline and keeps every release guard", () => {
    const state = initialOrdersState(); const order = state.orders[0]; const deadline = order.inspection_deadline!;
    const command = { type: "auto_release" as const, id: "auto", order_id: order.id };
    expect(() => executeOrder(state, command, deadline - 1)).toThrow(/still open/i);
    for (const patch of [{ delivery_proof: false }, { ops_hold: true }, { chargeback_pending: true }, { dispute: { id: "case" } }]) {
      const blocked = structuredClone(state); Object.assign(blocked.orders[0], patch);
      expect(() => executeOrder(blocked, command, deadline)).toThrow(/clear order/i);
    }
    const released = executeOrder(state, command, deadline);
    expect(released.orders[0]).toMatchObject({ status: "completed", escrow_status: "seller_pending" });
    expect(executeOrder(released, command, deadline)).toBe(released);
  });
  it("reconciles an expired order once when the repository is read", () => {
    const state = initialOrdersState(); const deadline = state.orders[0].inspection_deadline!;
    expect(reconcileExpiredOrders(state, deadline - 1)).toBe(state);
    const released = reconcileExpiredOrders(state, deadline);
    expect(released.orders[0].status).toBe("completed");
    expect(reconcileExpiredOrders(released, deadline + 1)).toBe(released);
  });
  it("extends inspection once and uses server time despite five-minute client skew", () => {
    const state = initialOrdersState(); const before = state.orders[0].inspection_deadline!;
    const extended = executeOrder(state, { type: "extend", id: "extend", order_id: state.orders[0].id }, 1);
    expect(extended.orders[0].inspection_deadline).toBe(before + 24 * 3_600_000);
    expect(() => executeOrder(extended, { type: "extend", id: "again", order_id: state.orders[0].id }, 2)).toThrow();
    expect(() => executeOrder(state, { type: "extend", id: "late", order_id: state.orders[0].id }, before)).toThrow();
    const serverNow = 1_000_000; const clientAtSync = serverNow + 5 * 60_000;
    expect(remainingFromServer(serverNow + 60_000, serverNow, clientAtSync, clientAtSync + 10_000)).toBe(50_000);
  });
  it("freezes only the disputed seller's order", () => {
    const state = initialOrdersState(); const target = state.orders[0]; const other = state.orders[1];
    const disputed = executeOrder(state, { type: "dispute", id: "case", order_id: target.id, reason: "not_as_described", detail: "The phone does not match the listing.", remedy: "refund", package_opened: true, media_ready: true }, 100);
    expect(disputed.orders[0]).toMatchObject({ status: "disputed", escrow_status: "frozen" });
    expect(disputed.orders[1]).toEqual(other);
  });
  it("recovers a failed refund through wallet credit", () => {
    let state = executeOrder(initialOrdersState(), { type: "dispute", id: "case", order_id: "WS-84291", reason: "damaged", detail: "The screen arrived badly cracked.", remedy: "refund", package_opened: true, media_ready: true }, 100);
    state = executeOrder(state, { type: "refund", id: "refund", order_id: "WS-84291", outcome: "failed" }, 200);
    expect(state.orders[0].escrow_status).toBe("refund_failed");
    state = executeOrder(state, { type: "wallet_credit", id: "wallet", order_id: "WS-84291" }, 300);
    expect(state.orders[0]).toMatchObject({ status: "refunded", escrow_status: "refunded" });
    expect(balances(state.orders[0].ledger).buyer_refunded).toBe(state.orders[0].total_minor);
  });
  it("allows one review only after completion", () => {
    const review = { overall: 5, description: 5, delivery: 4, communication: 5, packaging: 4, body: "Exactly as described and carefully packed." };
    expect(() => executeOrder(initialOrdersState(), { type: "review", id: "early", order_id: "WS-84291", review }, 1)).toThrow();
    const state = executeOrder(initialOrdersState(), { type: "review", id: "review", order_id: "WS-84017", review }, 1);
    expect(state.orders[2].review?.overall).toBe(5);
    expect(() => executeOrder(state, { type: "review", id: "again", order_id: "WS-84017", review }, 2)).toThrow();
  });
  it("rejects malformed persisted money and ledger state", () => {
    const malformed = initialOrdersState(); malformed.orders[0].total_minor = 1.5;
    expect(parseOrdersState(malformed)).not.toBe(malformed);
    const negative = initialOrdersState(); negative.orders[0].ledger = { ...negative.orders[0].ledger, captured_minor: -1 };
    expect(parseOrdersState(negative)).not.toBe(negative);
    const badEvent = initialOrdersState(); badEvent.orders[0].events[0].at = Number.NaN;
    expect(parseOrdersState(badEvent)).not.toBe(badEvent);
  });
});
