import { expect, test } from "@playwright/test";

const IPHONE = "/listing/204501-iphone-14-pro-256gb-deep-purple";

test("compare: pick two from search, see them side by side, remove from the tray (spec §270)", async ({ page }) => {
  await page.goto("/search?cat=phones");
  const menus = page.getByRole("button", { name: /^More actions for/ });
  await menus.nth(0).click();
  await page.getByRole("menuitem", { name: "Add to compare" }).click();
  const tray = page.getByRole("complementary", { name: "Compare" });
  await expect(tray.getByRole("link", { name: "Pick one more" })).toBeVisible();
  await menus.nth(1).click();
  await page.getByRole("menuitem", { name: "Add to compare" }).click();
  await tray.getByRole("link", { name: "Compare" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Compare 2 listings" })).toBeVisible();
  const table = page.getByRole("table");
  await expect(table.getByRole("rowheader", { name: "Price" })).toBeVisible();
  await expect(table.getByRole("rowheader", { name: "Storage" })).toBeVisible();
  await expect(table.getByRole("columnheader")).toHaveCount(2);
  await page.getByRole("button", { name: "Clear and close" }).click();
  await expect(page).toHaveURL(/\/search/);
  await expect(tray).toHaveCount(0);
});

test("a price-drop alert lands in notifications once (B4 step 4)", async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("ws:saved", JSON.stringify([{ id: "204501", price_minor: 90_000_000, at: "2026-10-01T09:00:00Z" }]));
    localStorage.setItem("ws:alerts", JSON.stringify({ items: [{ id: "204501", price_drop: true, back_in_stock: false, last_price: 90_000_000, last_status: "live" }], searches: [] }));
  });
  await page.goto("/saved");
  await expect(page.getByRole("switch", { name: "Alert me if the price drops" })).toBeChecked();
  // The watcher runs on load; reloading must not add a second notice.
  await page.goto("/notifications");
  const items = page.getByRole("listitem").filter({ hasText: "Price dropped: iPhone 14 Pro 256GB Deep Purple" });
  await expect(items).toHaveCount(1);
  await expect(items).toContainText("Now ₦845,000, ₦55,000 less than before.");
  await page.reload();
  await expect(page.getByText("1 unread")).toBeVisible();
  await expect(items).toHaveCount(1);
});

test("the listing shows its 30-day price history (spec §320)", async ({ page }) => {
  await page.goto(IPHONE);
  await expect(page.getByText("Price history, 30 days")).toBeVisible();
  await expect(page.getByText(/Lowered from ₦920,000 on .* · lowest ₦845,000/)).toBeVisible();
});
