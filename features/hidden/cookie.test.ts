import { describe, expect, it } from "vitest";
import { decodeHidden, encodeHidden } from "./cookie";

describe("hidden cookie", () => {
  it("round-trips ids", () => {
    const h = { listings: ["204507", "204501"], sellers: ["s03"] };
    expect(decodeHidden(encodeHidden(h))).toEqual(h);
  });

  it("drops anything that isn't an id, and survives junk", () => {
    expect(decodeHidden(encodeURIComponent(JSON.stringify({ l: ["ok1", "<script>", 5, "a b"], s: "nope" })))).toEqual({ listings: ["ok1"], sellers: [] });
    expect(decodeHidden("%%%")).toEqual({ listings: [], sellers: [] });
    expect(decodeHidden(undefined)).toEqual({ listings: [], sellers: [] });
  });
});
