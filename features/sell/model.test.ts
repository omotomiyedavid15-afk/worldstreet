import { describe, expect, it } from "vitest";
import { releaseToSeller, sellerFees } from "@/lib/ledger";
import { agree, blocking, canPublish, feePreview, initialAccount, listingIssues, nameEnquiry, newDraft, parseAccount, priceGuidance, publish, QUIZ, resolveKyc, saveProfile, savePayout, submitKyc, toPreview, validImei, type SellerAccount } from "./model";

const NOW = Date.parse("2026-10-08T09:00:00Z");
const profile = { shop_name: "Ada Gadgets", handle: "ada_gadgets", bio: "Phones and accessories", area_id: "ikeja", categories: ["phones" as const] };
const kycInput = { id_type: "nin" as const, id_number: "12345678901", legal_name: "Ada Okafor", selfie: true };
const photo = { url: "data:image/jpeg;base64,AAAA", width: 1200, height: 900, bytes: 120_000 };

function verified(): SellerAccount {
  let a = saveProfile(initialAccount, profile, []);
  a = resolveKyc(submitKyc(a, kycInput, NOW), "approved");
  a = savePayout(a, { kind: "bank", bank: "GTBank", account_last4: "6789", account_name: nameEnquiry("0123456789", "Ada Okafor") }, NOW);
  return agree(a, QUIZ.map((q) => q.answer), NOW);
}
function complete(id = "d1") {
  return { ...newDraft(id, NOW), photos: [photo, photo, photo, photo], category_id: "phones" as const, specifics: { Brand: "Apple", Model: "iPhone 13", Storage: "128GB" }, condition: "used" as const, flaws: "Light scratches on the back glass", serial: "490154203237518", title: "iPhone 13 128GB Midnight", description: "Bought in 2023, battery health 88%. Comes with the box and a cable.", price_minor: 420_000_00 };
}

describe("S1 onboarding", () => {
  it("validates the profile and rejects a taken handle", () => {
    expect(() => saveProfile(initialAccount, { ...profile, handle: "Ada Gadgets!" }, [])).toThrow(/handle/);
    expect(() => saveProfile(initialAccount, profile, ["ada_gadgets"])).toThrow(/taken/);
    expect(saveProfile(initialAccount, { ...profile, handle: "ADA_gadgets" }, []).profile?.handle).toBe("ada_gadgets");
  });
  it("keeps only the last 4 ID characters and moves to in_review (R-101)", () => {
    const a = submitKyc(initialAccount, kycInput, NOW);
    expect(a.kyc).toMatchObject({ status: "in_review", id_last4: "8901", legal_name: "Ada Okafor" });
    expect(JSON.stringify(a)).not.toContain("12345678901");
  });
  it("rejects bad ID numbers, single names and a missing selfie", () => {
    expect(() => submitKyc(initialAccount, { ...kycInput, id_number: "123" }, NOW)).toThrow(/11 digits/);
    expect(() => submitKyc(initialAccount, { ...kycInput, legal_name: "Ada" }, NOW)).toThrow(/first and last/);
    expect(() => submitKyc(initialAccount, { ...kycInput, selfie: false }, NOW)).toThrow(/selfie/);
  });
  it("allows 3 attempts per 24 hours with a plain-language reason (R-102)", () => {
    let a = initialAccount;
    for (let i = 0; i < 3; i++) { a = resolveKyc(submitKyc(a, kycInput, NOW + i), "rejected"); expect(a.kyc.reason).toMatch(/exactly as printed/); }
    expect(() => submitKyc(a, kycInput, NOW + 10)).toThrow(/3 times/);
    expect(submitKyc(a, kycInput, NOW + 86_400_001).kyc.status).toBe("in_review");
    expect(() => resolveKyc(initialAccount, "approved")).toThrow();
  });
  it("requires the payout account name to match the ID name", () => {
    const a = submitKyc(initialAccount, kycInput, NOW);
    expect(() => nameEnquiry("12345", "Ada Okafor")).toThrow(/10-digit/);
    expect(() => savePayout(a, { kind: "bank", bank: "GTBank", account_last4: "0000", account_name: nameEnquiry("9990000000", "Ada Okafor") }, NOW)).toThrow(/must match your ID name/);
    expect(savePayout(a, { kind: "bank", bank: "GTBank", account_last4: "6789", account_name: "OKAFOR ADA" }, NOW).payout).toBeTruthy();
    expect(savePayout(initialAccount, { kind: "wallet" }, NOW).payout).toEqual({ kind: "wallet" });
  });
  it("needs every quiz answer right", () => {
    expect(() => agree(initialAccount, [1, 0, 1], NOW)).toThrow(/Question 2/);
    expect(agree(initialAccount, [1, 1, 1], NOW).agreed_at).toBe(NOW);
  });
});

describe("S2 listing", () => {
  it("allows drafts before KYC but blocks publishing (R-100)", () => {
    const a = { ...saveProfile(initialAccount, profile, []), drafts: [complete()] };
    expect(canPublish(a)).toBe(false);
    expect(blocking(listingIssues(a.drafts[0], a, {}, NOW)).map((i) => i.field)).toEqual(["kyc"]);
    expect(() => publish(a, "d1", {}, NOW)).toThrow(/Verify your identity/);
    expect(a.drafts).toHaveLength(1);
  });
  it("reports every required field on its step (R-116)", () => {
    const steps = new Set(blocking(listingIssues(newDraft("d", NOW), verified(), {}, NOW)).map((i) => i.step));
    expect([...steps].sort()).toEqual([1, 2, 3, 4]);
  });
  it("checks phone IMEIs with Luhn and laptop serials (R-111)", () => {
    expect(validImei("490154203237518")).toBe(true);
    expect(validImei("490154203237519")).toBe(false);
    const a = verified();
    expect(listingIssues({ ...complete(), serial: "490154203237519" }, a, {}, NOW).some((i) => i.field === "serial")).toBe(true);
    const laptop = { ...complete(), category_id: "computing" as const, specifics: { Brand: "HP", Model: "EliteBook", RAM: "16GB", Storage: "512GB" }, serial: "5CG1234" };
    expect(blocking(listingIssues(laptop, a, {}, NOW))).toEqual([]);
  });
  it("blocks prohibited terms and same-title relists within 24 h (R-110, R-113)", () => {
    const a = verified();
    expect(blocking(listingIssues({ ...complete(), title: "Replica iPhone 13 128GB" }, a, {}, NOW))[0].message).toMatch(/isn’t allowed/);
    const live = publish({ ...a, drafts: [complete("d1"), complete("d2")] }, "d1", {}, NOW);
    expect(blocking(listingIssues(live.drafts[0], live, {}, NOW + 1_000))[0].message).toMatch(/last 24 hours/);
    expect(blocking(listingIssues(live.drafts[0], live, {}, NOW + 86_400_001))).toEqual([]);
  });
  it("validates offer thresholds against the price", () => {
    const a = verified();
    const fields = (accept: number | null, decline: number | null) => listingIssues({ ...complete(), auto_accept_minor: accept, auto_decline_minor: decline }, a, {}, NOW).filter((i) => i.step === 4).map((i) => i.field);
    expect(fields(400_000_00, 300_000_00)).toEqual([]);
    expect(fields(500_000_00, null)).toEqual(["auto_accept"]);
    expect(fields(300_000_00, 350_000_00)).toEqual(["auto_decline"]);
  });
  it("warns, without blocking, on prices far from similar listings", () => {
    const guide = priceGuidance([100, 200, 300, 400, 500].map((n) => ({ category_id: "phones" as const, price_minor: n * 1_000_00 })));
    expect(guide.phones).toMatchObject({ median_minor: 300_000_00, count: 5 });
    expect(guide.fashion).toBeUndefined();
    const warn = (price: number) => listingIssues({ ...complete(), price_minor: price }, verified(), guide, NOW).filter((i) => i.field === "price");
    expect(warn(420_000_00)[0]).toMatchObject({ block: false, message: expect.stringMatching(/above/) });
    expect(warn(100_000_00)[0]).toMatchObject({ block: false, message: expect.stringMatching(/far below/) });
    expect(warn(300_000_00)).toEqual([]);
  });
  it("publishes live, or in review for luxury brands, and removes the draft", () => {
    const a = { ...verified(), drafts: [complete("d1"), { ...complete("d2"), title: "Rolex Datejust 36mm steel", category_id: "fashion" as const, specifics: { Size: "36mm" }, serial: "" }] };
    const one = publish(a, "d1", {}, NOW);
    expect(one.listings[0]).toMatchObject({ id: "d1", status: "live", published_at: NOW });
    expect(one.drafts.map((d) => d.id)).toEqual(["d2"]);
    expect(publish(one, "d2", {}, NOW).listings[0]).toMatchObject({ status: "in_review", review_reason: expect.stringMatching(/authenticity/) });
  });
  it("previews fees with the ledger's maths", () => {
    const fee = feePreview(420_000_00);
    expect(fee).toMatchObject({ final_value_minor: 21_000_00, payment_minor: 6_300_00, receive_minor: 392_700_00 });
    expect(sellerFees(420_000_00, 0).total_minor).toBe(fee.total_minor);
    expect(releaseToSeller).toBeTypeOf("function");
  });
  it("builds a buyer card preview from the draft", () => {
    const a = verified();
    const card = toPreview(complete(), a, { id: "phones", name: "Phones & tablets", inspection: "phones", kind: "goods" }, NOW);
    expect(card).toMatchObject({ slug: "iphone-13-128gb-midnight", format: "best_offer", seller: { shop_name: "Ada Gadgets", verified: true }, location: { area: "Ikeja" } });
    expect(card.delivery[0].eta_days).toEqual([1, 2]);
    expect(card.attributes).toContainEqual({ key: "Storage", value: "128GB" });
  });
});

describe("persisted account", () => {
  it("round-trips a full account and rejects malformed data", () => {
    const a = publish({ ...verified(), drafts: [complete("d1"), complete("d2")] }, "d1", {}, NOW);
    expect(parseAccount(JSON.parse(JSON.stringify(a)))).toEqual(a);
    const broken = (patch: (copy: SellerAccount) => void) => { const copy = structuredClone(a); patch(copy); return () => parseAccount(copy); };
    expect(broken((c) => { c.kyc.status = "hacked" as never; })).toThrow();
    expect(broken((c) => { c.listings[0].price_minor = 1.5; })).toThrow();
    expect(broken((c) => { c.drafts[0].photos[0].url = "javascript:alert(1)"; })).toThrow();
    expect(broken((c) => { c.drafts[0].delivery[0].method = "teleport" as never; })).toThrow();
    expect(broken((c) => { c.listings[0].status = "deleted" as never; })).toThrow();
    expect(() => parseAccount(null)).toThrow();
  });
});
