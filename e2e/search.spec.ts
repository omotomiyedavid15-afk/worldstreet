import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/* Sprint 0 acceptance for search (flows Part J, PLAN S0.6–S0.9). */

const cards = (page: Page) => page.getByRole("list", { name: "Listings" }).getByRole("article");

test("'head' finds the headphones (Sprint 0 #2)", async ({ page }) => {
  await page.goto("/search");
  await page.getByRole("combobox", { name: "Search for anything" }).fill("head");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/search\?q=head/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Results for “head”");
  await expect(cards(page).first()).toContainText(/headphones/i);
  for (const title of await cards(page).getByRole("heading").allTextContents()) expect(title).toMatch(/head/i);
});

test("an empty search box offers trending searches and the page lists everything nearby", async ({ page }) => {
  await page.goto("/search");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("All listings");
  await expect(cards(page)).toHaveCount(24);
  const box = page.getByRole("combobox", { name: "Search for anything" });
  await box.focus();
  await expect(box).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("group", { name: "Trending" }).getByRole("option").first()).toBeVisible();
  // ↓ then Enter runs the highlighted search.
  await page.keyboard.press("ArrowDown");
  const first = await page.getByRole("option").first().textContent();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`q=${first}`));
});

test("a listing id goes straight to the listing (EC-002)", async ({ page }) => {
  await page.goto("/search?q=204507");
  await expect(page).toHaveURL(/\/listing\/204507-sony-wh-1000xm5/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Sony WH-1000XM5");
});

test("a prohibited search shows a neutral no-results with the policy link (EC-004)", async ({ page }) => {
  await page.goto("/search?q=pistol");
  await expect(page.getByRole("heading", { name: "No results", level: 2 })).toBeVisible();
  await expect(page.getByRole("link", { name: "See what isn't allowed" })).toHaveAttribute("href", "/help/prohibited-items");
  await expect(cards(page)).toHaveCount(0);
});

test("sorting by price is monotonic and Back restores the previous order (Sprint 0 #3, R-011)", async ({ page }) => {
  await page.goto("/search?q=phone&radius=all");
  await page.getByRole("button", { name: /^Sort/ }).click();
  await page.getByRole("menuitemradio", { name: "Price: lowest first" }).click();
  await expect(page).toHaveURL(/sort=price_asc/);
  const prices = (await cards(page).locator(".ws-price__now").allTextContents()).map((t) => Number(t.replace(/[^\d]/g, "")));
  expect(prices.length).toBeGreaterThan(2);
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
  await page.goBack();
  await expect(page).not.toHaveURL(/sort=/);
});

test("with 5 km chosen, no card is further than 5 km and the count matches (Sprint 0 #4)", async ({ page }) => {
  await page.goto("/search");
  await page.getByRole("button", { name: "Change location" }).click();
  const dialog = page.getByRole("dialog", { name: "Choose your location" });
  await dialog.getByRole("combobox", { name: "Area" }).selectOption("yaba");
  await dialog.getByRole("radio", { name: "5 km", exact: true }).check();
  await dialog.getByRole("button", { name: "Apply" }).click();
  await expect(page).toHaveURL(/radius=5/);
  await expect(page.getByText(/Showing items near/)).toContainText("Yaba · within 5 km");
  const count = await cards(page).count();
  expect(count).toBeGreaterThan(0);
  await expect(page.locator(".ws-results-head__count")).toHaveText(new RegExp(`^(${count} results?|Showing ${count} of)`));
  for (const text of await cards(page).locator(".ws-loc__km").allTextContents()) {
    const km = text.startsWith("Under") ? 0.5 : Number(text.replace(/[^\d.]/g, ""));
    expect(km).toBeLessThanOrEqual(5);
  }
});

test("Enter on a card opens it, and Back restores the scroll position (Sprint 0 #1)", async ({ page }) => {
  await page.goto("/search?radius=all");
  const target = cards(page).nth(9);
  await target.scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(400);
  const link = target.getByRole("heading").getByRole("link");
  const title = await link.textContent();
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title!);
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("All listings");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before - 50);
});

for (const url of ["/search", "/search?q=head", "/search?q=sofa", "/listing/204507-sony-wh-1000xm5-wireless-noise-cancelling-headphones"]) {
  test(`axe: no serious or critical issues on ${url}`, async ({ page }) => {
    await page.goto(url);
    const { violations } = await new AxeBuilder({ page }).analyze();
    const bad = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}
