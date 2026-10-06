import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/* Phase 2 filters (flows B2, spec §6): counts match results (R-016), URL state (R-011). */

const h1Count = async (page: Page) => Number((await page.getByRole("heading", { level: 1 }).textContent())!.match(/\d[\d,]*/)?.[0].replace(/,/g, "") ?? 0);

test("on desktop, ticking a filter applies it and its count was the result count", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "the rail shows from 1024px");
  await page.goto("/search", { waitUntil: "networkidle" });
  const rail = page.getByRole("complementary", { name: "Filter results" });
  const option = rail.locator("label", { hasText: "Accepts offers" });
  const promised = Number(await option.locator(".ws-facet__n").textContent());
  await Promise.all([page.waitForURL(/fmt=offers/, { timeout: 20_000 }), option.getByRole("checkbox").check()]);
  await expect.poll(() => h1Count(page)).toBe(promised);
  await expect(page.getByRole("list", { name: "Active filters" }).getByRole("link", { name: "Remove filter: Accepts offers" })).toBeVisible();
});

test("on phones, the sheet's 'Show N results' is what the page then shows", async ({ page }, info) => {
  test.skip(info.project.name === "desktop", "phones and tablets");
  await page.goto("/search", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Filters/ }).click();
  const sheet = page.getByRole("dialog", { name: "Filters" });
  await sheet.getByLabel("Brand new").check();
  const show = sheet.locator(".ws-filters__show");
  await page.waitForTimeout(800);
  const n = Number((await show.textContent())!.match(/\d+/)![0]);
  await Promise.all([page.waitForURL(/cond=new/, { timeout: 20_000 }), show.click()]);
  await expect(sheet).toBeHidden();
  await expect.poll(() => h1Count(page)).toBe(n);
  await expect(page.getByRole("button", { name: /^Filters 1 applied/ })).toBeVisible();
});

test("a chip removes only its own value; Clear all removes everything", async ({ page }) => {
  await page.goto("/search?cond=new,used&within=30&radius=all", { waitUntil: "networkidle" });
  const chips = page.getByRole("list", { name: "Active filters" });
  await Promise.all([page.waitForURL((u) => !u.search.includes("new"), { timeout: 20_000 }), chips.getByRole("link", { name: "Remove filter: Brand new" }).click()]);
  expect(page.url()).toContain("cond=used");
  await Promise.all([page.waitForURL((u) => !u.search.includes("cond"), { timeout: 20_000 }), chips.getByRole("link", { name: "Clear all" }).click()]);
  expect(page.url()).not.toContain("within");
});

test("filters work without JavaScript (the form is a plain GET)", async ({ browser }, info) => {
  test.skip(info.project.name !== "desktop", "once is enough");
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/search");
  const rail = page.getByRole("complementary", { name: "Filter results" });
  await rail.getByLabel("Verified ID").check();
  await rail.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/seller=verified/);
  await ctx.close();
});

test("a disabled option has nothing behind it", async ({ page }) => {
  await page.goto("/search?q=phone");
  for (const label of await page.locator(".ws-filters--rail .ws-facet[data-empty]").all()) {
    await expect(label.locator("input")).toBeDisabled();
    await expect(label.locator(".ws-facet__n")).toHaveText("0");
  }
});

test("axe: no serious or critical issues with filters applied and the sheet open", async ({ page }) => {
  await page.goto("/search?cond=new&fmt=offers", { waitUntil: "networkidle" });
  if ((page.viewportSize()?.width ?? 0) < 1024) await page.getByRole("button", { name: /^Filters/ }).click();
  const { violations } = await new AxeBuilder({ page }).analyze();
  const bad = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});

test("the grid/list choice is remembered (spec §6 ViewToggle)", async ({ page }) => {
  await page.goto("/search?q=phone", { waitUntil: "networkidle" });
  const list = page.getByRole("button", { name: "List view" }).filter({ visible: true });
  await list.click();
  await expect(list).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("ul.ws-card-list.ws-results")).toBeVisible();
  await page.goto("/search?q=head");
  await expect(page.locator("ul.ws-card-list.ws-results")).toBeVisible();
  await page.getByRole("button", { name: "Grid view" }).filter({ visible: true }).click();
  await expect(page.locator("ul.ws-card-grid.ws-results")).toBeVisible();
});

test("a misspelling offers 'Did you mean' as a link, never a silent fix (C16)", async ({ page }) => {
  await page.goto("/search?q=headphnes");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("No results for “headphnes”");
  const link = page.getByRole("link", { name: "“headphones”" });
  await expect(link).toHaveAttribute("href", "/search?q=headphones");
  await Promise.all([page.waitForURL(/q=headphones/, { timeout: 20_000 }), link.click()]);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/results? for “headphones”/);
});

test("related searches lead to other searches", async ({ page }) => {
  await page.goto("/search?q=head");
  const related = page.getByRole("navigation", { name: "Related searches" });
  await expect(related.getByRole("link").first()).toBeVisible();
  for (const href of await related.getByRole("link").evaluateAll((as) => as.map((a) => a.getAttribute("href")))) expect(href).toMatch(/^\/search\?q=/);
});
