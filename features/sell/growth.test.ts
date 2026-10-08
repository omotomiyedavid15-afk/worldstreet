import { describe, expect, it } from "vitest";
import { assertLedgerInvariant, balances } from "@/lib/ledger";
import { exportCsv, importCsv, parseCsv, TEMPLATE } from "./csv";
import { analytics, cancelOrder, confirmOrder, dispatchOrder, endListing, promote, simulateBuyerConfirm, simulateDelivery, simulatePurchase, stopPromotion } from "./hub";
import { agree, initialAccount, newDraft, parseAccount, publish, QUIZ, resolveKyc, saveProfile, savePayout, submitKyc, type SellerAccount } from "./model";

const NOW = Date.parse("2026-10-08T09:00:00Z");
const H = 3_600_000;
const photo = { url: "data:image/jpeg;base64,AAAA", width: 1200, height: 900, bytes: 100 };
function shop(): SellerAccount {
  let a = saveProfile(initialAccount, { shop_name: "Ada Gadgets", handle: "ada_gadgets", bio: "", area_id: "ikeja", categories: ["phones"] }, []);
  a = resolveKyc(submitKyc(a, { id_type: "nin", id_number: "12345678901", legal_name: "Ada Okafor", selfie: true }, NOW), "approved");
  a = agree(savePayout(a, { kind: "bank", bank: "GTBank", account_last4: "6789", account_name: "ADA OKAFOR" }, NOW), QUIZ.map((q) => q.answer), NOW);
  const draft = { ...newDraft("L1", NOW), photos: [photo], category_id: "phones" as const, specifics: { Brand: "Apple", Model: "iPhone 13", Storage: "128GB" }, condition: "like_new" as const, serial: "490154203237518", title: "iPhone 13 128GB Midnight", description: "Barely used, battery health 96%. Box and cable included.", price_minor: 400_000_00, qty: 3 };
  return publish({ ...a, drafts: [draft] }, "L1", {}, NOW);
}
function sale(a: SellerAccount, id: string, at = NOW) {
  a = simulatePurchase(a, "L1", id, at);
  a = dispatchOrder(confirmOrder(a, id, at), id, { kind: "platform", courier: "Kwik" }, at + H);
  return simulateBuyerConfirm(simulateDelivery(a, id, at + 2 * H), id, at + 3 * H);
}

describe("promotions", () => {
  it("validates the ad rate and only promotes live listings", () => {
    expect(() => promote(shop(), ["L1"], 1, NOW)).toThrow(/2% to 15%/);
    expect(() => promote(shop(), ["L1"], 5.5, NOW)).toThrow();
    expect(() => promote(endListing(shop(), "L1", NOW), ["L1"], 5, NOW)).toThrow(/live/);
    const a = promote(shop(), ["L1", "nope"], 5, NOW);
    expect(a.listings[0].promotion).toEqual({ rate_percent: 5, since: NOW });
    expect(promote(a, ["L1"], 8, NOW + H).listings[0].promotion).toEqual({ rate_percent: 8, since: NOW });
    expect(stopPromotion(a, ["L1"], NOW).listings[0].promotion).toBeNull();
    expect(endListing(a, "L1", NOW).listings[0].promotion).toBeNull();
  });
  it("charges the ad fee at release from the seller's share, keeping the ledger balanced", () => {
    const a = sale(promote(shop(), ["L1"], 5, NOW), "O1");
    const o = a.orders[0];
    expect(o.promotion_rate).toBe(5);
    const fee = o.ledger.postings.find((p) => p.reason_code === "promotion_fee")!;
    expect(fee).toMatchObject({ debit_account: "seller_pending", credit_account: "platform_revenue", amount_minor: 20_000_00 });
    expect(assertLedgerInvariant(o.ledger)).toBe(true);
    const plain = sale(shop(), "O2").orders[0];
    expect(balances(plain.ledger).seller_pending - balances(o.ledger).seller_pending).toBe(20_000_00);
  });
});

describe("CSV import and export (R-122)", () => {
  it("parses quotes, doubled quotes, commas and CRLF", () => {
    expect(parseCsv('a,"b, c","say ""hi"""\r\n1,2,3\n\n')).toEqual([["a", "b, c", 'say "hi"'], ["1", "2", "3"]]);
  });
  it("turns valid template rows into drafts and reports bad rows by number", () => {
    const bad = TEMPLATE + 'Replica Rolex watch for sale,watches,shiny,abc,0,short,Colour=Red,teleport,5,maybe\r\n';
    const { account, report } = importCsv(shop(), bad, NOW, (n) => `I${n}`);
    expect(report.map((r) => [r.row, r.draft_id, r.errors.length])).toEqual([[2, "I0", 0], [3, "I1", 0], [4, null, 10]]);
    expect(report[2].errors.join(" ")).toMatch(/isn’t allowed/);
    expect(account.drafts.map((d) => [d.id, d.category_id, d.price_minor, d.qty, d.return_days, d.offers_enabled])).toEqual([["I0", "phones", 420_000_00, 1, 7, true], ["I1", "fashion", 18_000_00, 3, null, false]]);
    expect(account.drafts[0].specifics).toEqual({ Brand: "Apple", Model: "iPhone 13", Storage: "128GB" });
    expect(account.drafts[0].delivery.map((d) => d.method)).toEqual(["rider", "courier"]);
    expect(parseAccount(JSON.parse(JSON.stringify(account)))).toEqual(account);
  });
  it("needs the header and caps the file", () => {
    expect(() => importCsv(shop(), "foo,bar\n1,2", NOW, String)).toThrow(/Missing: title/);
    expect(() => importCsv(shop(), "title,category,condition,price,quantity\n", NOW, String)).toThrow(/No rows/);
    expect(() => importCsv(shop(), "x".repeat(1_000_001), NOW, String)).toThrow(/1 MB/);
  });
  it("exports listings in the import format and defuses spreadsheet formulas", () => {
    const a = shop();
    a.listings[0].title = "=HYPERLINK(\"x\")";
    const rows = parseCsv(exportCsv(a.listings));
    expect(rows[0]).toEqual(["id", "status", "title", "category", "condition", "price", "quantity", "description", "specifics", "delivery", "returns", "offers"]);
    expect(rows[1].slice(0, 7)).toEqual(["L1", "live", "'=HYPERLINK(\"x\")", "phones", "like_new", "400000", "3"]);
  });
});

describe("analytics", () => {
  it("adds up sales, earnings, fees and ad fees from the ledgers", () => {
    let a = sale(promote(shop(), ["L1"], 5, NOW), "O1", NOW - 2 * 24 * H);
    a = cancelOrder(simulatePurchase(a, "L1", "O2", NOW - H), "O2", "Out of stock", NOW);
    const r = analytics(a, NOW);
    expect(r).toMatchObject({ orders: 1, cancelled: 1, gross_minor: 402_500_00, average_minor: 402_500_00, ad_fees_minor: 20_000_00, promoted_orders: 1 });
    expect(r.earned_minor).toBe(402_500_00 - r.fees_minor - r.ad_fees_minor);
    expect(r.daily).toHaveLength(30);
    expect(r.daily.reduce((t, d) => t + d.gross_minor, 0)).toBe(402_500_00);
    expect(r.top).toEqual([{ title: "iPhone 13 128GB Midnight", units: 1, gross_minor: 402_500_00, promoted: true }]);
    expect(analytics(a, NOW + 40 * 24 * H).orders).toBe(0);
  });
});
