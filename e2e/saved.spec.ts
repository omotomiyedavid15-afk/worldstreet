import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/* Phase 2: Saved (flows B4, SCR-006), saved searches and Recently viewed (B1). */

test.beforeEach(async ({ page }) => {
  await page.goto("/cart");
  await page.evaluate(() => localStorage.setItem("ws:mock-session", JSON.stringify({ signedIn: true })));
});

test("Saved shows price drops, sold listings and removed ones (B4, R-026, EC-006)", async ({ page }) => {
  await page.evaluate(() => localStorage.setItem("ws:saved", JSON.stringify([{ id: "204507", price_minor: 50000000 }, { id: "204518" }, { id: "999999" }])));
  await page.goto("/saved");
  const list = page.getByRole("list", { name: "Saved listings" });
  await expect(list.getByText("Price dropped ₦15,000")).toBeVisible();
  await expect(list.getByText("Sold", { exact: true })).toBeVisible();
  await expect(list.getByText("This listing was removed by the seller.")).toBeVisible();
  await list.getByRole("button", { name: "Remove from Saved" }).click();
  await expect(list.getByText("This listing was removed by the seller.")).toHaveCount(0);
  await expect(page.getByText("2 saved listings")).toBeVisible();
});

test("an empty Saved says how to save", async ({ page }) => {
  await page.goto("/saved");
  await expect(page.getByRole("heading", { name: "Nothing saved yet" })).toBeVisible();
});

test("'Save this search' adds it to Saved › Searches", async ({ page }) => {
  await page.goto("/search?q=phone", { waitUntil: "networkidle" });
  const save = page.getByRole("button", { name: "Save this search" });
  await save.click();
  await expect(save).toHaveAttribute("aria-pressed", "true");
  await page.goto("/saved?tab=searches");
  const link = page.getByRole("list", { name: "Saved searches" }).getByRole("link");
  await expect(link).toContainText("“phone” near Lagos");
  await expect(link).toHaveAttribute("href", "/search?q=phone");
});

test("listings you open come back as Recently viewed on home, shown once (B1, R-013)", async ({ page }) => {
  for (const id of ["204507", "204501", "204514", "204519"]) await page.goto(`/listing/${id}-x`, { waitUntil: "networkidle" });
  await page.goto("/");
  const rail = page.getByRole("region", { name: "Recently viewed" });
  await expect(rail.getByRole("article")).toHaveCount(4);
  const hrefs = await page.locator("section.ws-rail .ws-card__link").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(new Set(hrefs).size).toBe(hrefs.length);
});

test("axe: no serious or critical issues on Saved", async ({ page }) => {
  await page.evaluate(() => localStorage.setItem("ws:saved", JSON.stringify([{ id: "204507", price_minor: 50000000 }, { id: "204518" }])));
  await page.goto("/saved");
  await expect(page.getByText("2 saved listings")).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).analyze();
  const bad = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});
