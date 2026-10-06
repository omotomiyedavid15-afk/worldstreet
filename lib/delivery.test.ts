import { describe, expect, it } from "vitest";
import type { DeliveryOption } from "@/lib/data/types";
import { kobo } from "@/lib/money";
import { addBusinessDays, arrivalRange, formatDateRange } from "./delivery";

const rider: DeliveryOption = { method: "rider", fee_minor: kobo(250_000), eta_days: [1, 2], coverage: "same_city" };
const iso = (d: Date) => d.toISOString().slice(0, 10);

describe("addBusinessDays", () => {
  it("skips weekends", () => {
    const fri = Date.parse("2026-10-09T10:00:00Z");
    expect(iso(addBusinessDays(fri, 1))).toBe("2026-10-12"); // Mon
    expect(iso(addBusinessDays(fri, 0))).toBe("2026-10-09");
  });

  it("counts from the Lagos date, not the UTC one", () => {
    // 23:30 UTC on Tue is 00:30 Wed in Lagos.
    expect(iso(addBusinessDays(Date.parse("2026-10-06T23:30:00Z"), 1))).toBe("2026-10-08");
  });
});

describe("arrival dates (flows B3 step 3)", () => {
  it("is handling plus transit from today", () => {
    const tue = Date.parse("2026-10-06T09:00:00Z");
    // Rider 1–2 days + handling 1–2 → 2–4 business days: Thu 8 to Mon 12.
    expect(formatDateRange(arrivalRange(rider, tue))).toBe("Thu 8 – Mon 12 Oct");
  });

  it("names both months across a month end, and one day once", () => {
    expect(formatDateRange([new Date("2026-10-30T00:00:00Z"), new Date("2026-11-03T00:00:00Z")])).toBe("Fri 30 Oct – Tue 3 Nov");
    expect(formatDateRange([new Date("2026-10-08T00:00:00Z"), new Date("2026-10-08T00:00:00Z")])).toBe("Thu 8 Oct");
  });
});
