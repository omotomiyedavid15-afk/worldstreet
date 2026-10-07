import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SCROLLING_EVENT, ScrollState, isScrolling } from "./ScrollState";

describe("ScrollState", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("marks the page as scrolling once per gesture, not once per scroll event", () => {
    const changes = vi.fn();
    window.addEventListener(SCROLLING_EVENT, changes);
    const { unmount } = render(<ScrollState />);

    // A burst of wheel notches, each followed by the browser's own scrollend.
    for (let i = 0; i < 10; i++) {
      act(() => {
        window.dispatchEvent(new Event("scroll"));
        window.dispatchEvent(new Event("scrollend"));
        vi.advanceTimersByTime(50);
      });
    }
    expect(isScrolling()).toBe(true);
    expect(changes).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(200)); // quiet spell
    expect(isScrolling()).toBe(false);
    expect(document.documentElement.hasAttribute("data-scrolling")).toBe(false);
    expect(changes).toHaveBeenCalledTimes(2);

    unmount();
    window.removeEventListener(SCROLLING_EVENT, changes);
  });
});
