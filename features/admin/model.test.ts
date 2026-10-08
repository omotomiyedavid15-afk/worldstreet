import { describe, expect, it } from "vitest";
import { executeOrder, initialOrdersState, type OrdersState } from "@/features/orders/model";
import { emptyState } from "@/features/negotiation/model";
import { simulatePurchase, withdraw, DEMO_OTP } from "@/features/sell/hub";
import { agree, initialAccount, newDraft, publish, QUIZ, resolveKyc, saveProfile, savePayout, submitKyc, type SellerAccount } from "@/features/sell/model";
import { assertLedgerInvariant, balances } from "@/lib/ledger";
import { addReport, audit, can, decideReversal, holdPayouts, initialAdmin, moderateListing, moderationQueue, parseAdmin, requestReversal, resolveReport, reverseSellerPosting, riskSignals, suspendSeller, supportSearch, type AdminState } from "./model";

const NOW = Date.parse("2026-10-08T09:00:00Z");
const H = 3_600_000;
const photo = { url: "data:image/jpeg;base64,AAAA", width: 1200, height: 900, bytes: 100 };

function shop(title = "Rolex Datejust 36mm steel", price = 2_500_000_00): SellerAccount {
  let a = saveProfile(initialAccount, { shop_name: "Ada Gadgets", handle: "ada_gadgets", bio: "", area_id: "ikeja", categories: ["fashion"] }, []);
  a = resolveKyc(submitKyc(a, { id_type: "nin", id_number: "12345678901", legal_name: "Ada Okafor", selfie: true }, NOW), "approved");
  a = agree(savePayout(a, { kind: "bank", bank: "GTBank", account_last4: "6789", account_name: "ADA OKAFOR" }, NOW), QUIZ.map((q) => q.answer), NOW);
  const draft = { ...newDraft("L1", NOW), photos: [photo], category_id: "fashion" as const, specifics: { Size: "36mm" }, condition: "like_new" as const, title, description: "Bought 2022, box and papers included, serviced last year.", price_minor: price };
  return publish({ ...a, drafts: [draft] }, "L1", {}, NOW);
}
const as = (id: string, s: AdminState = initialAdmin): AdminState => ({ ...s, staff_id: id });

/** The demo's delivered order with an open case (seller_response, escrow frozen). */
function disputed(): OrdersState {
  return executeOrder(initialOrdersState(), { type: "dispute", id: "case1", order_id: "WS-84291", reason: "not_as_described", detail: "Battery health is 71%, listing said 89%", remedy: "refund", package_opened: true, media_ready: true }, NOW);
}
const decide = (state: OrdersState, outcome: "refund" | "release" | "partial" | "info", refund_minor?: number) =>
  executeOrder(state, { type: "ops_decide", id: `d-${outcome}`, order_id: "WS-84291", outcome, refund_minor, rationale: "Buyer photos show battery health at 71%, listing claimed 89%.", staff: "Tunde Bakare" }, NOW + H);

describe("roles and audit", () => {
  it("gates by role and stamps every entry with the staff member", () => {
    expect(can(initialAdmin, ["moderation"])).toBe(false);
    expect(can(as("kemi"), ["moderation"])).toBe(true);
    expect(can(as("kemi"), ["finance"])).toBe(false);
    expect(() => audit(initialAdmin, { at: NOW, action: "x", target: "y", detail: "" })).toThrow(/staff/);
    const s = audit(audit(as("kemi"), { at: NOW, action: "approve", target: "L1", detail: "" }), { at: NOW + 1, action: "remove", target: "L2", detail: "PC-01" });
    expect(s.audit.map((a) => [a.id, a.staff, a.role, a.action])).toEqual([["A2", "Kemi Adeyemi", "moderation", "remove"], ["A1", "Kemi Adeyemi", "moderation", "approve"]]);
  });
});

describe("A1 moderation", () => {
  it("queues in-review listings (1 h) and reports (1 h high-risk, 24 h normal), oldest due first", () => {
    let s = addReport(as("kemi"), { id: "R1", listing_id: "204501", title: "iPhone 14 Pro", seller: "Gadget Hub", reason: "misleading", details: "", at: NOW - 2 * H });
    s = addReport(s, { id: "R2", listing_id: "204502", title: "Galaxy S23", seller: "Phone Hub", reason: "scam", details: "Asked for a deposit", at: NOW });
    const q = moderationQueue(s, shop());
    expect(q.map((i) => [i.kind, i.id, i.high, i.due_at - i.at])).toEqual([["review", "L1", true, H], ["report", "R2", true, H], ["report", "R1", false, 24 * H]]);
    expect(moderationQueue(resolveReport(s, "R2", "dismissed"), shop()).map((i) => i.id)).toEqual(["L1", "R1"]);
  });
  it("approves, removes with a policy code, or sends back to drafts with a note", () => {
    expect(moderateListing(shop(), "L1", "approve", "", NOW).listings[0].status).toBe("live");
    expect(() => moderateListing(shop(), "L1", "remove", "", NOW)).toThrow(/policy/);
    expect(moderateListing(shop(), "L1", "remove", "PC-02", NOW).listings[0]).toMatchObject({ status: "removed", review_reason: expect.stringMatching(/PC-02.*appeal within 7 days/) });
    const back = moderateListing(shop(), "L1", "request_edit", "Add a photo of the serial and the papers.", NOW);
    expect(back.listings).toEqual([]);
    expect(back.drafts[0]).toMatchObject({ id: "L1", step: 7, admin_note: "Add a photo of the serial and the papers.", title: "Rolex Datejust 36mm steel" });
    expect(() => moderateListing(moderateListing(shop(), "L1", "approve", "", NOW), "L1", "approve", "", NOW)).toThrow(/isn’t waiting/);
  });
  it("suspending a seller ends their listings and blocks publishing", () => {
    const s = suspendSeller(moderateListing(shop(), "L1", "approve", "", NOW), "Repeated counterfeit listings.");
    expect(s.listings[0].status).toBe("ended");
    expect(s.suspended_reason).toBe("Repeated counterfeit listings.");
    expect(() => publish({ ...s, drafts: [{ ...newDraft("D2", NOW), photos: [photo], category_id: "fashion", specifics: { Size: "M" }, condition: "new", title: "Linen shirt size M white", description: "Brand new linen shirt, never worn, tags on." , price_minor: 20_000_00 }] }, "D2", {}, NOW)).toThrow(/suspended/);
  });
});

describe("A2 case decisions", () => {
  it("needs a written rationale and escalates on first ruling", () => {
    expect(() => executeOrder(disputed(), { type: "ops_decide", id: "x", order_id: "WS-84291", outcome: "refund", rationale: "ok", staff: "T" }, NOW)).toThrow(/rationale/);
    const info = decide(disputed(), "info").orders[0].dispute!;
    expect(info.status).toBe("escalated");
    expect(info.info_requests?.[0].staff).toBe("Tunde Bakare");
  });
  it.each([
    ["refund", undefined, "refunded", "refunded", "resolved_refund"],
    ["release", undefined, "completed", "seller_pending", "resolved_release"],
    ["partial", 100_000_00, "completed", "seller_pending", "resolved_partial"],
  ] as const)("%s keeps the ledger balanced", (outcome, refund, status, escrow, dispute) => {
    const order = decide(disputed(), outcome, refund).orders[0];
    expect(order).toMatchObject({ status, escrow_status: escrow, dispute: { status: dispute, decision: { outcome, staff: "Tunde Bakare" } } });
    const b = balances(order.ledger);
    expect(b.escrow_frozen + b.escrow_held).toBe(0);
    expect(b.buyer_refunded).toBe(outcome === "refund" ? order.total_minor : refund ?? 0);
    expect(assertLedgerInvariant(order.ledger)).toBe(true);
  });
  it("rejects partial refunds of 0 or the full total, and deciding twice", () => {
    expect(() => decide(disputed(), "partial", 0)).toThrow(/partial/);
    expect(() => decide(disputed(), "partial", 452_000_00)).toThrow(/partial/);
    expect(() => executeOrder(decide(disputed(), "refund"), { type: "ops_decide", id: "again", order_id: "WS-84291", outcome: "release", rationale: "Changing my mind on this one entirely.", staff: "T" }, NOW)).toThrow(/no frozen escrow/);
  });
});

describe("R-260 reversals", () => {
  const posting = { id: "WS-84291:1", order_id: "WS-84291", idempotency_key: "k", debit_account: "provider_clearing" as const, credit_account: "escrow_held" as const, amount_minor: 452_000_00, reason_code: "payment_captured", actor: "system" as const, created_at: NOW };
  it("only finance may request; above ₦100,000 a different person approves", () => {
    expect(() => requestReversal(as("kemi"), { source: "buyer_order", order_id: "WS-84291", posting, reason: "Duplicate capture" }, "V1", NOW)).toThrow(/finance/);
    let s = requestReversal(as("ngozi"), { source: "buyer_order", order_id: "WS-84291", posting, reason: "Duplicate capture from provider" }, "V1", NOW);
    expect(() => requestReversal(s, { source: "buyer_order", order_id: "WS-84291", posting, reason: "Again the same entry" }, "V2", NOW)).toThrow(/already exists/);
    expect(() => decideReversal(s, "V1", true, NOW)).toThrow(/second person/);
    s = decideReversal({ ...s, staff_id: "ifeanyi" }, "V1", true, NOW + H);
    expect(s.reversals[0]).toMatchObject({ status: "approved", decided_by: "Ifeanyi Obi" });
    expect(() => decideReversal(s, "V1", false, NOW)).toThrow(/already/);
  });
  it("small reversals can be self-approved; the ledger posts the mirror entry once", () => {
    const small = { ...posting, amount_minor: 50_000_00 };
    const s = decideReversal(requestReversal(as("ngozi"), { source: "buyer_order", order_id: "WS-84291", posting: small, reason: "Fee posted twice" }, "V1", NOW), "V1", true, NOW);
    expect(s.reversals[0].status).toBe("approved");
    let state = initialOrdersState();
    const row = state.orders[0].ledger.postings[0];
    state = executeOrder(state, { type: "reverse", id: "rv1", order_id: "WS-84291", posting_id: row.id, reason: "Duplicate capture from provider" }, NOW);
    const last = state.orders[0].ledger.postings.at(-1)!;
    expect(last).toMatchObject({ debit_account: row.credit_account, credit_account: row.debit_account, amount_minor: row.amount_minor, reason_code: `reversal:${row.reason_code}`, actor: "admin" });
    expect(() => executeOrder(state, { type: "reverse", id: "rv2", order_id: "WS-84291", posting_id: row.id, reason: "Duplicate capture from provider" }, NOW)).toThrow(/already been reversed/);
    expect(() => executeOrder(state, { type: "reverse", id: "rv3", order_id: "WS-84291", posting_id: last.id, reason: "Undo the undo please" }, NOW)).toThrow(/can’t itself/);
  });
  it("reverses seller-order postings too", () => {
    const a = simulatePurchase(shop("Leather bag", 50_000_00), "L1", "O1", NOW);
    const id = a.orders[0].ledger.postings[0].id;
    expect(balances(reverseSellerPosting(a, "O1", id, "Duplicate capture from provider", NOW).orders[0].ledger).escrow_held).toBe(0);
  });
});

describe("A3 risk and A4 support", () => {
  it("flags a new seller's high-value listing and holds payouts with a reason", () => {
    const signals = riskSignals(shop(), [], emptyState, NOW);
    expect(signals.find((s) => s.key === "new_high_value")).toMatchObject({ hits: 1, detail: "Rolex Datejust 36mm steel" });
    expect(() => holdPayouts(shop(), "x")).toThrow(/reason/);
    const held = holdPayouts(shop(), "High-value listing from a new account under review.");
    expect(() => withdraw(held, 1_000_00, DEMO_OTP, "paid", "W", NOW)).toThrow(/on hold/);
    expect(holdPayouts(held, null).payout_hold_reason).toBeNull();
  });
  it("searches orders, listings and shops", () => {
    const hits = supportSearch("ws-84", initialOrdersState().orders, shop());
    expect(hits.map((h) => h.kind)).toEqual(["buyer_order", "buyer_order", "buyer_order"]);
    expect(supportSearch("ada", [], shop())).toEqual([{ kind: "shop", id: "ada_gadgets", title: "Ada Gadgets", meta: "Shop @ada_gadgets · KYC approved" }]);
    expect(supportSearch("a", [], shop())).toEqual([]);
  });
  it("round-trips and validates persisted admin state", () => {
    const s = addReport(audit(as("kemi"), { at: NOW, action: "approve", target: "L1", detail: "" }), { id: "R1", listing_id: "1", title: "t", seller: "s", reason: "scam", details: "", at: NOW });
    expect(parseAdmin(JSON.parse(JSON.stringify(s)))).toEqual(s);
    expect(() => parseAdmin({ ...s, staff_id: "mallory" })).toThrow();
    expect(() => parseAdmin({ ...s, audit: [{ ...s.audit[0], role: "god" }] })).toThrow();
  });
});
