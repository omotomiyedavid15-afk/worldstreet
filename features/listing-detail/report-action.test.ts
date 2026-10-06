import { describe, expect, it } from "vitest";
import { rules } from "@/config/marketplace-rules";
import { repos } from "@/lib/data";
import { reportListing } from "./report-action";

const idle = { status: "idle" } as const;
const form = (fields: Record<string, string>) => {
  const f = new FormData();
  Object.entries(fields).forEach(([k, v]) => f.set(k, v));
  return f;
};

describe("reportListing (Server Action input is untrusted)", async () => {
  const id = (await repos.listings.list())[0].id;

  it("accepts a known reason for a real listing", async () => {
    expect(await reportListing(idle, form({ listing: id, reason: "counterfeit" }))).toEqual({ status: "sent" });
  });

  it("rejects a missing or unknown reason", async () => {
    expect(await reportListing(idle, form({ listing: id }))).toMatchObject({ status: "error", field: "reason" });
    expect(await reportListing(idle, form({ listing: id, reason: "drop table" }))).toMatchObject({ status: "error", field: "reason" });
  });

  it("needs details for 'Something else', and caps their length", async () => {
    expect(await reportListing(idle, form({ listing: id, reason: "other" }))).toMatchObject({ field: "details" });
    const long = "x".repeat(rules.moderation.reportDetailsMax + 1);
    expect(await reportListing(idle, form({ listing: id, reason: "scam", details: long }))).toMatchObject({ field: "details" });
  });

  it("refuses an unknown listing", async () => {
    expect(await reportListing(idle, form({ listing: "nope", reason: "scam" }))).toMatchObject({ field: "form" });
  });
});
