import { describe, expect, it } from "vitest";
import { rules } from "@/config/marketplace-rules";
import { judge3D } from "./capability";

const capable = { webgl: true, reducedMotion: false };

describe("judge3D", () => {
  it("allows a capable device, and treats unknown memory and cores as enough", () => {
    expect(judge3D(capable)).toEqual({ ok: true });
  });

  it("needs WebGL above everything else", () => {
    expect(judge3D({ ...capable, webgl: false, reducedMotion: true })).toEqual({ ok: false, reason: "no-webgl" });
  });

  it("respects reduced motion and data saver", () => {
    expect(judge3D({ ...capable, reducedMotion: true })).toMatchObject({ reason: "reduced-motion" });
    expect(judge3D({ ...capable, saveData: true })).toMatchObject({ reason: "save-data" });
  });

  it("skips low-memory and few-core phones at the configured thresholds", () => {
    expect(judge3D({ ...capable, deviceMemoryGb: rules.three.minDeviceMemoryGb - 1 })).toMatchObject({ reason: "low-memory" });
    expect(judge3D({ ...capable, deviceMemoryGb: rules.three.minDeviceMemoryGb })).toEqual({ ok: true });
    expect(judge3D({ ...capable, cores: rules.three.minCores - 1 })).toMatchObject({ reason: "few-cores" });
  });
});
