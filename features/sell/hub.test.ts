import { describe, expect, it } from "vitest";
import { balances } from "@/lib/ledger";
import { bulkPrice, cancelOrder, confirmOrder, DEMO_OTP, dispatchOrder, editListing, endListing, ledgerRows, performance, reconcilePayouts, relist, sellSimilar, simulateBuyerConfirm, simulateDelivery, simulatePurchase, wallet, withdraw } from "./hub";
import { agree, initialAccount, nameEnquiry, newDraft, parseAccount, publish, QUIZ, resolveKyc, saveProfile, savePayout, submitKyc, type SellerAccount } from "./model";

const NOW = Date.parse("2026-10-08T09:00:00Z");
const H = 3_600_000;
const photo = { url: "data:image/jpeg;base64,AAAA", width: 1200, height: 900, bytes: 120_000 };

function shop(qty = 2): SellerAccount {
  let a = saveProfile(initialAccount, { shop_name: "Ada Gadgets", handle: "ada_gadgets", bio: "", area_id: "ikeja", categories: ["phones"] }, []);
  a = resolveKyc(submitKyc(a, { id_type: "nin", id_number: "12345678901", legal_name: "Ada Okafor", selfie: true }, NOW), "approved");
  a = agree(savePayout(a, { kind: "bank", bank: "GTBank", account_last4: "6789", account_name: nameEnquiry("0123456789", "Ada Okafor") }, NOW), QUIZ.map((q) => q.answer), NOW);
  const draft = { ...newDraft("L1", NOW), photos: [photo], category_id: "phones" as const, specifics: { Brand: "Apple", Model: "iPhone 13", Storage: "128GB" }, condition: "like_new" as const, serial: "490154203237518", title: "iPhone 13 128GB Midnight", description: "Barely used, battery health 96%. Box and cable included.", price_minor: 420_000_00, qty };
  return publish({ ...a, drafts: [draft] }, "L1", {}, NOW);
}
const sold = (a: SellerAccount, id = "O1", at = NOW) => simulatePurchase(a, "L1", id, at);
function delivered(a: SellerAccount, id = "O1", at = NOW) {
  a = confirmOrder(sold(a, id, at), id, at + H);
  a = dispatchOrder(a, id, { kind: "platform", courier: "Kwik" }, at + 2 * H);
  return simulateDelivery(a, id, at + 30 * H);
}

describe("S3 listings", () => {
  it("logs price and quantity edits, pausing at 0 and reactivating on restock (R-112, R-121)", () => {
    let a = editListing(shop(), "L1", { price_minor: 400_000_00 }, NOW + H);
    a = editListing(a, "L1", { qty: 0 }, NOW + 2 * H);
    expect(a.listings[0]).toMatchObject({ price_minor: 400_000_00, qty: 0, status: "paused" });
    expect(a.listings[0].revisions.map((r) => [r.field, r.from, r.to])).toEqual([["price", 420_000_00, 400_000_00], ["qty", 2, 0]]);
    expect(editListing(a, "L1", { qty: 3 }, NOW).listings[0].status).toBe("live");
    expect(() => editListing(a, "L1", { price_minor: 50 }, NOW)).toThrow(/₦100/);
    expect(editListing(a, "L1", { price_minor: 400_000_00 }, NOW)).toBe(a);
  });
  it("keeps auto-accept within a lowered price", () => {
    const a = shop();
    a.listings[0].auto_accept_minor = 410_000_00;
    expect(editListing(a, "L1", { price_minor: 380_000_00 }, NOW).listings[0].auto_accept_minor).toBe(380_000_00);
  });
  it("changes prices in bulk by a percentage, rounded to whole naira", () => {
    expect(bulkPrice(shop(), ["L1"], -10, NOW).listings[0].price_minor).toBe(378_000_00);
    expect(() => bulkPrice(shop(), ["L1"], -95, NOW)).toThrow();
  });
  it("won't end a listing with an order to ship, and relists with a fresh run (R-120, R-115)", () => {
    expect(() => endListing(sold(shop()), "L1", NOW)).toThrow(/order to ship/);
    const ended = endListing(shop(), "L1", NOW);
    expect(ended.listings[0].status).toBe("ended");
    expect(() => editListing(ended, "L1", { qty: 1 }, NOW)).toThrow(/Relist/);
    expect(relist(ended, "L1", NOW + 5 * H).listings[0]).toMatchObject({ status: "live", published_at: NOW + 5 * H });
  });
  it("sell similar copies the listing into a new draft without the serial", () => {
    const a = sellSimilar(shop(), "L1", "D2", NOW);
    expect(a.drafts[0]).toMatchObject({ id: "D2", title: "iPhone 13 128GB Midnight", serial: "", step: 1 });
  });
});

describe("S5 orders and S6 payouts", () => {
  it("runs purchase → dispatch → delivery → release → available → withdraw with the ledger balanced", () => {
    let a = delivered(shop());
    expect(a.listings[0].qty).toBe(1);
    expect(wallet(a)).toMatchObject({ in_escrow: 422_500_00, pending: 0 });
    a = simulateBuyerConfirm(a, "O1", NOW + 40 * H);
    // ₦420,000 + ₦2,500 rider; fees 5% of item + 1.5% of total
    expect(wallet(a)).toMatchObject({ in_escrow: 0, pending: 422_500_00 - 21_000_00 - 6_337_50 });
    const pending = wallet(a).pending;
    expect(reconcilePayouts(a, NOW + 41 * H)).toBe(a);
    a = reconcilePayouts(a, NOW + 40 * H + 48 * H);
    const reserve = Math.floor(pending / 10);
    expect(wallet(a)).toMatchObject({ available: pending - reserve, pending: reserve });
    expect(a.orders[0].escrow_status).toBe("seller_available");
    a = reconcilePayouts(a, NOW + 40 * H + 14 * 24 * H);
    expect(wallet(a)).toMatchObject({ available: pending, pending: 0 });
    expect(() => withdraw(a, 1_000_00, "000000", "paid", "W1", NOW + 400 * H)).toThrow(/code/);
    expect(() => withdraw(a, 500_00, DEMO_OTP, "paid", "W1", NOW + 400 * H)).toThrow(/minimum/);
    expect(() => withdraw(a, pending + 1, DEMO_OTP, "paid", "W1", NOW + 400 * H)).toThrow(/more than/);
    const failed = withdraw(a, pending, DEMO_OTP, "failed", "W1", NOW + 400 * H);
    expect(wallet(failed).available).toBe(pending);
    expect(failed.withdrawals[0].status).toBe("failed");
    a = withdraw(a, pending, DEMO_OTP, "paid", "W2", NOW + 400 * H);
    expect(wallet(a)).toMatchObject({ available: 0, withdrawn: pending });
    expect(a.orders[0].escrow_status).toBe("withdrawn");
    const b = balances(a.orders[0].ledger);
    expect(b.platform_revenue + b.seller_withdrawn).toBe(a.orders[0].total_minor);
    expect(ledgerRows(a)[0].reason_code).toBe("withdrawal");
  });
  it("requires tracking above ₦20,000 and validates own-delivery details (R-141)", () => {
    const a = confirmOrder(sold(shop()), "O1", NOW);
    expect(() => dispatchOrder(a, "O1", { kind: "own", rider_name: "Musa", rider_phone: "08031234567", eta: "Today 5pm" }, NOW)).toThrow(/need tracking/);
    expect(() => dispatchOrder(sold(shop()), "O1", { kind: "platform", courier: "Kwik" }, NOW)).toThrow(/Confirm/);
    expect(dispatchOrder(a, "O1", { kind: "meet_up", place: "Ikeja City Mall entrance" }, NOW).orders[0].dispatch).toMatchObject({ kind: "meet_up", pin: expect.stringMatching(/^\d{4}$/) });
  });
  it("cancels with a reason, refunds the buyer in full and restocks", () => {
    let a = sold(shop(1));
    expect(a.listings[0]).toMatchObject({ qty: 0, status: "paused" });
    expect(() => cancelOrder(a, "O1", "Changed my mind", NOW)).toThrow(/reason/);
    a = cancelOrder(a, "O1", "Out of stock", NOW + H);
    expect(a.orders[0]).toMatchObject({ status: "refunded", escrow_status: "refunded", seller_fault: true });
    expect(balances(a.orders[0].ledger).buyer_refunded).toBe(a.orders[0].total_minor);
    expect(a.listings[0]).toMatchObject({ qty: 1, status: "live" });
    expect(() => cancelOrder(delivered(shop()), "O1", "Out of stock", NOW)).toThrow();
  });
  it("holds withdrawals for 24 h after a bank change (R-270)", () => {
    const a = savePayout(shop(), { kind: "bank", bank: "Kuda", account_last4: "1111", account_name: "ADA OKAFOR" }, NOW);
    expect(a.withdraw_hold_until).toBe(NOW + 24 * H);
    expect(() => withdraw(a, 1_000_00, DEMO_OTP, "paid", "W", NOW + H)).toThrow(/24 hours/);
    expect(savePayout(initialAccount, { kind: "wallet" }, NOW).withdraw_hold_until).toBeNull();
  });
});

describe("S7 performance", () => {
  it("counts late dispatches and seller-fault cancellations over 90 days", () => {
    let a = confirmOrder(sold(shop(3)), "O1", NOW);
    a = dispatchOrder(a, "O1", { kind: "platform", courier: "Kwik" }, NOW + 30 * H); // due in 24 h
    a = cancelOrder(sold(a, "O2", NOW), "O2", "Out of stock", NOW);
    const p = performance(a, NOW + 31 * H);
    expect(p.level).toBe("New");
    expect(p.metrics.find((m) => m.key === "late")?.value).toBe(100);
    expect(p.metrics.find((m) => m.key === "cancel")?.value).toBe(50);
    expect(performance(shop(), NOW).metrics.every((m) => m.value === null)).toBe(true);
  });
});

describe("persisted hub state", () => {
  it("round-trips orders and withdrawals and migrates Phase 7a accounts", () => {
    const a = simulateBuyerConfirm(delivered(shop()), "O1", NOW + 40 * H);
    expect(parseAccount(JSON.parse(JSON.stringify(a)))).toEqual(a);
    const old = JSON.parse(JSON.stringify(shop()));
    delete old.orders; delete old.withdrawals; delete old.withdraw_hold_until; delete old.listings[0].revisions; delete old.listings[0].updated_at;
    expect(parseAccount(old)).toMatchObject({ orders: [], withdrawals: [], withdraw_hold_until: null, listings: [{ revisions: [], updated_at: NOW }] });
    const tampered = JSON.parse(JSON.stringify(a));
    tampered.orders[0].ledger.postings[0].amount_minor += 1;
    expect(() => parseAccount(tampered)).toThrow();
    const total = JSON.parse(JSON.stringify(a));
    total.orders[0].total_minor = 1;
    expect(() => parseAccount(total)).toThrow();
  });
});
