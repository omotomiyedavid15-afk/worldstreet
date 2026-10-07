import { describe, expect, it } from "vitest";
import { emptyState, execute, expire, parseState, type Context, type Command } from "./model";
import { rules } from "@/config/marketplace-rules";
import { kobo } from "@/lib/money";
const ctx: Context = { now: Date.parse("2026-10-07T12:00:00Z"), role: "buyer", listing: { id: "a", seller_id: "shop", price_minor: kobo(100_000), qty: 2, status: "live", category_id: "phones" } };
const offer: Command = { type: "offer", id: "one", amount_minor: 90_000, qty: 1, note: "Can we meet tomorrow?" };
const seller = { ...ctx, role: "seller" as const };
function accepted() { return execute(execute(emptyState, offer, ctx), { type: "respond", id: "accept", offer_id: "one", event: "accept" }, seller); }
describe("local P2P repository", () => {
  it("opens one thread, records an offer and ignores duplicate submissions", () => {
    const state = execute(emptyState, offer, ctx);
    expect(state.threads).toHaveLength(1);
    expect(state.offers[0].status).toBe("pending");
    expect(execute(state, offer, ctx)).toEqual(state);
    expect(() => execute(state, { ...offer, id: "two" }, ctx)).toThrow(/active offer/i);
  });
  it("enforces price, integer kobo, quantity and availability", () => {
    for (const amount_minor of [0, 49_999, 100_001, 90_000.5, NaN]) expect(() => execute(emptyState, { ...offer, amount_minor }, ctx)).toThrow();
    expect(() => execute(emptyState, { ...offer, qty: 3 }, ctx)).toThrow();
    expect(() => execute(emptyState, offer, { ...ctx, listing: { ...ctx.listing, status: "reserved" } })).toThrow();
  });
  it("enforces roles, counter counts and expiry (expired attempts still count)", () => {
    let state = execute(emptyState, offer, ctx);
    expect(() => execute(state, { type: "respond", id: "bad", offer_id: "one", event: "accept" }, ctx)).toThrow(/seller/i);
    state = execute(state, { type: "respond", id: "counter", offer_id: "one", event: "counter", amount_minor: 95_000 }, seller);
    state = execute(state, { type: "respond", id: "back", offer_id: "one", event: "counter", amount_minor: 92_000 }, ctx);
    state = execute(state, { type: "respond", id: "decline", offer_id: "one", event: "decline" }, seller);
    state = execute(state, { ...offer, id: "third" }, ctx);
    const later = { ...ctx, now: ctx.now + rules.offers.validityHours * 3600000 };
    expect(expire(state, later.now).offers.at(-1)?.status).toBe("expired");
    expect(() => execute(state, { ...offer, id: "fourth" }, later)).toThrow(/offers left/i);
  });
  it("requires a seller request, keeps failures retryable and pays once", () => {
    let state = accepted();
    expect(() => execute(state, { type: "pay", id: "early", offer_id: "one", outcome: "success" }, ctx)).toThrow(/request/i);
    expect(() => execute(state, { type: "request", id: "bad", offer_id: "one", delivery_minor: 0 }, ctx)).toThrow(/seller/i);
    state = execute(state, { type: "request", id: "request", offer_id: "one", delivery_minor: 500 }, seller);
    state = execute(state, { type: "pay", id: "fail", offer_id: "one", outcome: "declined" }, ctx);
    expect(state.offers[0].status).toBe("accepted");
    state = execute(state, { type: "pay", id: "pay", offer_id: "one", outcome: "success" }, ctx);
    expect(state.offers[0].status).toBe("paid");
    expect(state.requests[0].total_minor).toBe(90_500);
    expect(execute(state, { type: "pay", id: "pay", offer_id: "one", outcome: "success" }, ctx)).toEqual(state);
    expect(() => execute(state, { type: "pay", id: "again", offer_id: "one", outcome: "success" }, ctx)).toThrow();
  });
  it("lapses accepted offers and refuses late or ineligible payments", () => {
    const state = accepted();
    const later = { ...seller, now: ctx.now + rules.offers.payWindowHours * 3600000 };
    expect(expire(state, later.now).offers[0].status).toBe("lapsed");
    expect(() => execute(state, { type: "request", id: "late", offer_id: "one", delivery_minor: 0 }, later)).toThrow();
    expect(() => execute(state, { type: "request", id: "car", offer_id: "one", delivery_minor: 0 }, { ...seller, listing: { ...ctx.listing, category_id: "vehicles" } })).toThrow(/category/i);
  });
  it("warns before risky messages and blocks all threads for a seller", () => {
    const message: Command = { type: "message", id: "m", body: "Pay me directly at https://example.com", photos: [] };
    expect(() => execute(emptyState, message, ctx)).toThrow(/WorldStore/i);
    let state = execute(emptyState, { ...message, acknowledge: true }, ctx);
    expect(state.threads[0].messages[0].flagged).toBe(true);
    state = execute(state, { type: "block", id: "block", blocked: true }, ctx);
    expect(() => execute(state, { ...message, id: "m2", acknowledge: true }, { ...ctx, listing: { ...ctx.listing, id: "b" } })).toThrow(/blocked/i);
    expect(() => execute(state, offer, ctx)).toThrow(/blocked/i);
  });
  it("caps open offers and new threads, and rejects invalid attachments", () => {
    let state = emptyState;
    for (let i = 0; i < rules.offers.maxOpen; i++) state = execute(state, { ...offer, id: `offer-${i}` }, { ...ctx, listing: { ...ctx.listing, id: `item-${i}` } });
    expect(() => execute(state, offer, ctx)).toThrow(/too many open/i);
    state = emptyState;
    for (let i = 0; i < rules.messaging.newThreadsPerDay; i++) state = execute(state, { type: "message", id: `m-${i}`, body: "Hello", photos: [] }, { ...ctx, listing: { ...ctx.listing, id: `item-${i}` } });
    expect(() => execute(state, { type: "message", id: "extra", body: "Hello", photos: [] }, ctx)).toThrow(/conversation limit/i);
    expect(() => execute(emptyState, { type: "message", id: "bad-photo", body: "", photos: ["https://example.com/tracker.png"] }, ctx)).toThrow(/photo/i);
  });
  it("consumes stock after a successful local payment", () => {
    let state = execute(accepted(), { type: "request", id: "request", offer_id: "one", delivery_minor: 0 }, seller);
    state = execute(state, { type: "pay", id: "paid", offer_id: "one", outcome: "success" }, ctx);
    expect(() => execute(state, { ...offer, id: "too-many", qty: 2 }, ctx)).toThrow(/quantity/i);
  });
  it("rejects corrupted browser data", () => {
    expect(parseState({ offers: [null] })).toEqual(emptyState);
    expect(parseState(JSON.parse(JSON.stringify(accepted())))).toEqual(accepted());
  });
});
