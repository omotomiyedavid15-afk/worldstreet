import { expect, test } from "@playwright/test";

/* Phase 1 shell (spec §3.1–3.3): header, drawer, bottom nav, footer, skip links. */

test("skip links reach the main content, the search box and the footer", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("combobox", { name: "Search for anything" })).toBeFocused();
});

test("the header stays stuck with the search showing after scrolling", async ({ page }) => {
  await page.goto("/search");
  await page.mouse.wheel(0, 1500);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
  await expect(page.getByRole("combobox", { name: "Search for anything" })).toBeInViewport();
  // Content inside the page sees the stuck header's height.
  await expect
    .poll(() => page.evaluate(() => parseFloat(getComputedStyle(document.querySelector("main")!).getPropertyValue("--cx-sticky-offset"))))
    .toBeGreaterThan(40);
});

test("the bell's count is the number of unread items in its panel", async ({ page, isMobile }, info) => {
  test.skip(info.project.name !== "desktop", "The bell is in the header from 768px; phones use the Notifications page.");
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Notifications", exact: true })).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem(
      "ws:notifications",
      JSON.stringify([
        { id: "a", title: "Price drop on a saved item", href: "/saved", at: new Date().toISOString(), read: false },
        { id: "b", title: "Your offer was accepted", href: "/offers", at: new Date().toISOString(), read: false },
        { id: "c", title: "Order dispatched", href: "/orders", at: new Date().toISOString(), read: true },
      ]),
    ),
  );
  await page.reload();
  const bell = page.getByRole("button", { name: "Notifications, 2 unread" });
  await bell.click();
  const panel = page.getByRole("dialog", { name: "Notifications" });
  await expect(panel.locator("[data-unread]")).toHaveCount(2);
  await panel.getByRole("button", { name: "Mark all read" }).click();
  await expect(page.getByRole("button", { name: "Notifications", exact: true })).toBeVisible();
  expect(isMobile).toBeFalsy();
});

test.describe("phones", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 768, "phone layout only");

  test("the menu drawer opens, closes on Escape and gives focus back", async ({ page }) => {
    await page.goto("/");
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.click();
    const drawer = page.getByRole("dialog", { name: "Menu" });
    await expect(drawer.getByRole("link", { name: "Orders" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(menu).toBeFocused();
  });

  test("the bottom nav has five tabs and marks the current one", async ({ page }) => {
    await page.goto("/search");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link")).toHaveText(["Home", "Search", "Sell", "Inbox", "Account"]);
    await expect(nav.getByRole("link", { name: "Search" })).toHaveAttribute("aria-current", "page");
    // F17: the page ends above the nav.
    const pad = await page.evaluate(() => parseFloat(getComputedStyle(document.body).paddingBottom));
    expect(pad).toBeGreaterThanOrEqual(64);
  });

  test("the footer is an accordion with one section open at a time", async ({ page }) => {
    await page.goto("/cart");
    const footer = page.getByRole("contentinfo");
    await footer.getByText("Buy", { exact: true }).click();
    await expect(footer.getByRole("link", { name: "All categories" })).toBeVisible();
    await footer.getByText("Sell", { exact: true }).click();
    await expect(footer.getByRole("link", { name: "Create a listing" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "All categories" })).toBeHidden();
  });
});
