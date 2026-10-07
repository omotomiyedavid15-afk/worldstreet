import { describe, expect, it } from "vitest";
import { canPayRequest, nextPaymentRequest, type PaymentRequestStatus } from "./payment-request";

describe("payment request state machine (Phase 5)", () => {
  const arrows = [
    ["unpaid", "start", "processing"],
    ["unpaid", "expire", "expired"],
    ["processing", "succeed", "paid"],
    ["processing", "decline", "declined"],
    ["processing", "timeout", "timed_out"],
    ["processing", "expire", "expired"],
    ["declined", "retry", "processing"],
    ["declined", "expire", "expired"],
    ["timed_out", "retry", "processing"],
    ["timed_out", "expire", "expired"],
  ] as const;

  it.each(arrows)("%s + %s → %s", (status, event, expected) => {
    expect(canPayRequest(status, event)).toBe(true);
    expect(nextPaymentRequest(status, event)).toBe(expected);
  });

  it("rejects illegal transitions and keeps paid/expired terminal", () => {
    const statuses: PaymentRequestStatus[] = ["unpaid", "processing", "declined", "timed_out", "paid", "expired"];
    const events = ["start", "succeed", "decline", "timeout", "retry", "expire"] as const;
    for (const status of statuses) for (const event of events) {
      if (arrows.some(([from, action]) => from === status && action === event)) continue;
      expect(canPayRequest(status, event)).toBe(false);
      expect(() => nextPaymentRequest(status, event)).toThrow();
    }
  });
});
