import { describe, expect, it, vi } from "vitest";
import { createLocalStore } from "./local-store";

describe("required browser persistence", () => {
  it("does not publish or retain an update when storage is full", () => {
    const store = createLocalStore("test:strict", 0, Number, { requirePersistence: true });
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Quota exceeded"); });
    expect(() => store.set(1)).toThrow(/save/i);
    expect(store.get()).toBe(0);
    expect(listener).not.toHaveBeenCalled();
    write.mockRestore(); unsub();
  });
});
