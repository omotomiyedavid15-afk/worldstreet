import { describe, expect, it } from "vitest";
import { assertLedgerInvariant, balances, captureToEscrow, createLedger, post, refundToBuyer, releaseToSeller } from ".";

describe("immutable order ledger (L2, R-200–R-201)", () => {
  it("keeps every posting immutable, complete and idempotent", () => {
    const initial = createLedger("order-1", 103_000_00);
    const captured = captureToEscrow(initial, "provider:event-1", 1);
    expect(initial.postings).toHaveLength(0);
    expect(captured.postings[0]).toMatchObject({ order_id: "order-1", idempotency_key: "provider:event-1", debit_account: "provider_clearing", credit_account: "escrow_held", amount_minor: 103_000_00, reason_code: "payment_captured", actor: "system", created_at: 1 });
    expect(captureToEscrow(captured, "provider:event-1", 1)).toBe(captured);
    expect(() => captureToEscrow(captured, "provider:event-2", 1)).toThrow(/insufficient/i);
  });

  it("posts seller proceeds and fees without losing a kobo", () => {
    const captured = captureToEscrow(createLedger("order-2", 103_000_00), "capture", 1);
    const released = releaseToSeller(captured, 100_000_00, 3_000_00, "release", 2);
    expect(balances(released)).toMatchObject({ escrow_held: 0, seller_pending: 96_455_00, platform_revenue: 6_545_00 });
    expect(assertLedgerInvariant(released)).toBe(true);
  });

  it("keeps a failed provider refund payable and can recover to wallet", () => {
    let ledger = captureToEscrow(createLedger("order-3", 20_000), "capture", 1);
    ledger = refundToBuyer(ledger, 20_000, "refund", 2, true);
    expect(balances(ledger).refunds_payable).toBe(20_000);
    ledger = post(ledger, { idempotency_key: "refund:wallet", debit_account: "refunds_payable", credit_account: "buyer_refunded", amount_minor: 20_000, reason_code: "wallet_credit", actor: "system", created_at: 3 });
    expect(balances(ledger).buyer_refunded).toBe(20_000);
  });

  it("preserves the captured amount through 10,000 deterministic random paths", () => {
    let seed = 0x51f15e;
    const random = () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 2 ** 32);
    for (let i = 0; i < 10_000; i++) {
      const capturedMinor = 10_000 + Math.floor(random() * 10_000_000);
      let ledger = captureToEscrow(createLedger(`sim-${i}`, capturedMinor), `capture-${i}`, i);
      if (random() < .45) ledger = refundToBuyer(ledger, capturedMinor, `refund-${i}`, i, false);
      else {
        const buyerShare = random() < .25 ? Math.floor(capturedMinor * random()) : 0;
        if (buyerShare > 0) ledger = refundToBuyer(ledger, buyerShare, `partial-${i}`, i, false);
        const sellerShare = capturedMinor - buyerShare;
        ledger = releaseToSeller(ledger, sellerShare, 0, `seller-${i}`, i);
      }
      expect(assertLedgerInvariant(ledger)).toBe(true);
    }
  });
});
