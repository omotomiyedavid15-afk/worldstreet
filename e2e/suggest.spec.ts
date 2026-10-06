import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/* Phase 1 search (flows B2 steps 1–2, spec SearchSuggestPanel). */

const box = (page: import("@playwright/test").Page) => page.getByRole("combobox", { name: "Search for anything" });
const options = (page: import("@playwright/test").Page) => page.getByRole("listbox", { name: "Search suggestions" }).getByRole("option");

test("typing two letters brings live suggestions in groups, capped (B2 step 2)", async ({ page, isMobile }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await box(page).click();
  await box(page).fill("head");
  const list = page.getByRole("listbox", { name: "Search suggestions" });
  await expect(list.getByRole("group", { name: "Searches" }).getByRole("option").first()).toContainText("headphones");
  await expect(list.getByRole("option", { name: "head in Electronics" })).toBeVisible();
  expect(await list.getByRole("option").count()).toBeLessThanOrEqual(isMobile ? 6 : 10);
});

test("a listing suggestion opens the listing", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await box(page).click();
  await box(page).fill("sony wh");
  const row = page.getByRole("group", { name: "Listings" }).getByRole("option").first();
  await expect(row).toContainText("Sony WH-1000XM5");
  await Promise.all([page.waitForURL(/\/listing\/204507-/, { timeout: 20_000 }), row.click()]);
});

test("'q in Category' searches inside that category", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await box(page).click();
  await box(page).fill("head");
  const scoped = options(page).filter({ hasText: "head in Electronics" });
  await expect(scoped).toBeVisible();
  await Promise.all([page.waitForURL(/\/search\?.*cat=electronics/, { timeout: 20_000 }), scoped.click()]);
  await expect(page).toHaveURL(/q=head/);
});

test("the scope select narrows a search on desktop", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "The scope select shows from 1024px; phones get it in Phase 2's filters.");
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("combobox", { name: "Search in" }).selectOption("fashion");
  await box(page).fill("kaftan");
  await Promise.all([page.waitForURL(/cat=fashion/, { timeout: 20_000 }), page.getByRole("button", { name: "Search", exact: true }).click()]);
  // On the results page the scope shows what's in force.
  await expect(page.getByRole("combobox", { name: "Search in" })).toHaveValue("fashion");
});

test("on phones the search opens full screen and Cancel puts things back", async ({ page }, info) => {
  test.skip(info.project.name === "desktop", "phones only");
  await page.goto("/search?q=phone", { waitUntil: "networkidle" });
  await box(page).click();
  const cancel = page.getByRole("button", { name: "Cancel" });
  await expect(cancel).toBeVisible();
  const form = page.getByRole("search", { name: "Search WorldStreet" });
  const r = (await form.boundingBox())!;
  expect(Math.round(r.y)).toBe(0);
  await box(page).fill("phones x");
  await cancel.click();
  await expect(cancel).toBeHidden();
  await expect(box(page)).toHaveValue("phone");
});

test("a prohibited search still gets no suggestions (EC-004)", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await box(page).click();
  await box(page).fill("pistol");
  await page.waitForTimeout(600);
  await expect(page.getByRole("group", { name: "Searches" })).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Listings" })).toHaveCount(0);
});

test("axe: no serious or critical issues with suggestions open", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await box(page).click();
  await box(page).fill("head");
  await expect(options(page).first()).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).analyze();
  const bad = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});
