import { describe, expect, it } from "vitest";
import { assertKobo, discountPercent, formatCurrency, kobo, percentOf, sumMinor, toMajor, toMinor } from "./money";

describe("toMinor", () => {
  it("converts naira to integer kobo", () => {
    expect(toMinor(103_000)).toBe(10_300_000);
    expect(toMinor(0)).toBe(0);
    expect(toMinor(1_250.5)).toBe(125_050);
  });

  it("rounds to the nearest kobo without floating-point drift", () => {
    expect(toMinor(1.005)).toBe(101); // 1.005 * 100 = 100.49999… in floats
    expect(toMinor(0.015)).toBe(2);
    expect(toMinor(19.999)).toBe(2_000);
    expect(toMinor(1e-7)).toBe(0);
  });

  it("rounds negatives half away from zero, symmetric with positives", () => {
    expect(toMinor(-1.005)).toBe(-101);
    expect(toMinor(-0.004)).toBe(0);
    expect(Object.is(toMinor(-0.004), -0)).toBe(false);
  });

  it("rejects amounts that are not finite", () => {
    expect(() => toMinor(Number.NaN)).toThrow(RangeError);
    expect(() => toMinor(Infinity)).toThrow(RangeError);
  });

  it("round-trips through toMajor", () => {
    expect(toMajor(toMinor(4_999.99))).toBe(4_999.99);
  });
});

describe("integer guards", () => {
  it("accepts integer kobo and rejects fractions", () => {
    expect(kobo(150)).toBe(150);
    expect(() => kobo(1.5)).toThrow(RangeError);
    expect(() => assertKobo(Number.MAX_SAFE_INTEGER + 2)).toThrow(RangeError);
  });

  it("refuses to format fractional kobo", () => {
    expect(() => formatCurrency(10.5 as never)).toThrow(RangeError);
  });
});

describe("formatCurrency", () => {
  it("shows naira with grouping and the ₦ sign", () => {
    expect(formatCurrency(toMinor(103_000))).toBe("₦103,000");
    expect(formatCurrency(toMinor(1_500_000))).toBe("₦1,500,000");
    expect(formatCurrency(kobo(0))).toBe("₦0");
  });

  it("shows kobo only when present, unless told otherwise", () => {
    expect(formatCurrency(kobo(125_050))).toBe("₦1,250.50");
    expect(formatCurrency(kobo(125_005))).toBe("₦1,250.05");
    expect(formatCurrency(toMinor(1_250), { kobo: "always" })).toBe("₦1,250.00");
    expect(formatCurrency(kobo(125_050), { kobo: "never" })).toBe("₦1,251");
    expect(formatCurrency(kobo(125_049), { kobo: "never" })).toBe("₦1,250");
  });

  it("uses a real minus sign before the ₦ for negatives", () => {
    expect(formatCurrency(toMinor(-3_000))).toBe("−₦3,000");
    expect(formatCurrency(kobo(-5))).toBe("−₦0.05");
  });

  it("never shows a negative zero", () => {
    expect(formatCurrency(kobo(-0))).toBe("₦0");
    expect(formatCurrency(kobo(-40), { kobo: "never" })).toBe("₦0");
  });

  it("signs positive amounts on request", () => {
    expect(formatCurrency(toMinor(3_000), { signed: true })).toBe("+₦3,000");
    expect(formatCurrency(kobo(0), { signed: true })).toBe("₦0");
    expect(formatCurrency(toMinor(-3_000), { signed: true })).toBe("−₦3,000");
  });
});

describe("arithmetic", () => {
  it("adds amounts", () => {
    // R-003: Total to {city} = item + delivery + fees − discounts
    expect(sumMinor(toMinor(100_000), toMinor(3_000), toMinor(-500))).toBe(toMinor(102_500));
    expect(sumMinor()).toBe(0);
  });

  it("takes percentages to the nearest kobo", () => {
    // flows L2 example: 5% seller fee and 1.5% payment fee on ₦100,000
    expect(percentOf(toMinor(100_000), 5)).toBe(toMinor(5_000));
    expect(percentOf(toMinor(100_000), 1.5)).toBe(toMinor(1_500));
    expect(percentOf(kobo(333), 1.5)).toBe(5); // 4.995 → 5
    expect(percentOf(kobo(-333), 1.5)).toBe(-5);
  });

  it("works out a discount that never overstates the saving", () => {
    expect(discountPercent(toMinor(77_000), toMinor(100_000))).toBe(23);
    expect(discountPercent(toMinor(66_700), toMinor(100_000))).toBe(33); // 33.3 → 33
    expect(discountPercent(toMinor(99_999.5), toMinor(100_000))).toBeNull(); // under 1%
    expect(discountPercent(toMinor(100_000), toMinor(100_000))).toBeNull();
    expect(discountPercent(toMinor(120_000), toMinor(100_000))).toBeNull();
    expect(discountPercent(toMinor(100_000), undefined)).toBeNull();
  });
});
