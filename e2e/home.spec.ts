import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/* Sprint 0 #5 and S0.10 acceptance for the home page (flows B1, audit F5–F17). */

const firstNumber = async (page: Page) => Number((await page.getByRole("heading", { level: 1 }).textContent())!.match(/\d[\d,]*/)![0].replace(/,/g, ""));

test("one h1, and the trust strip and hero are above the fold (F11, B1 step 3)", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  const trust = page.getByRole("region", { name: "Buying on WorldStreet" });
  await expect(trust).toBeInViewport();
  await expect(trust.getByRole("link", { name: "How escrow works" })).toHaveAttribute("href", "/help/escrow");
  await expect(page.getByRole("region", { name: "Highlights" })).toBeInViewport({ ratio: 0.2 });
});

test("the hero carousel has a pause button, a counter and labelled slides (F8, F14, R-015)", async ({ page }) => {
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Highlights" });
  await expect(hero).toHaveAttribute("aria-roledescription", "carousel");
  // It rotates on its own, so stop it before checking positions.
  await hero.getByRole("button", { name: "Pause slides" }).click();
  await expect(hero.getByRole("button", { name: "Play slides" })).toBeVisible();
  await expect(hero.locator(".ws-hero__slides")).toHaveAttribute("aria-live", "polite");
  const at = Number((await hero.locator(".ws-hero__count").textContent())!.match(/^\d/)![0]);
  await expect(hero.getByRole("group", { name: `${at} of 3` })).toBeVisible();
  await hero.getByRole("button", { name: "Next slide" }).click();
  const next = (at % 3) + 1;
  await expect(hero.getByText(`${next} / 3`)).toBeVisible();
  await expect(hero.getByRole("group", { name: `${next} of 3` })).toBeVisible();
  await hero.getByRole("button", { name: "Previous slide" }).click();
  await expect(hero.getByText(`${at} / 3`)).toBeVisible();
});

test("changing slide by hand stops rotation", async ({ page }) => {
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Highlights" });
  await expect(hero.getByRole("button", { name: "Pause slides" })).toBeVisible();
  await hero.getByRole("button", { name: "Next slide" }).click();
  await expect(hero.getByRole("button", { name: "Play slides" })).toBeVisible();
});

test("the hero never rotates on its own under reduced motion (R-015)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Highlights" });
  await expect(hero.getByRole("button", { name: "Play slides" })).toBeVisible();
  await page.waitForTimeout(7500);
  await expect(hero.getByText("1 / 3")).toBeVisible();
});

test("a category tile's count is what its search shows (R-016)", async ({ page }) => {
  await page.goto("/");
  const tile = page.getByRole("link", { name: /^Phones & tablets/ });
  const count = Number((await tile.textContent())!.match(/(\d+) nearby/)![1]);
  await Promise.all([page.waitForURL(/\/search\?cat=phones/, { timeout: 20_000 }), tile.click()]);
  expect(await firstNumber(page)).toBe(count);
});

test("no listing appears twice on the page (R-013) and short rails are left out (R-014)", async ({ page }) => {
  await page.goto("/");
  const rails = page.locator("section.ws-rail");
  expect(await rails.count()).toBeGreaterThanOrEqual(2);
  for (const rail of await rails.all()) expect(await rail.getByRole("article").count()).toBeGreaterThanOrEqual(4);
  const hrefs = await page.locator("section.ws-rail .ws-card__link").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  expect(new Set(hrefs).size).toBe(hrefs.length);
});

test("'Browse all' promises the number the search page shows", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: /^Browse all \d+ listings near Lagos/ });
  const n = Number((await link.textContent())!.match(/\d+/)![0]);
  await Promise.all([page.waitForURL(/\/search$/, { timeout: 20_000 }), link.click()]);
  expect(await firstNumber(page)).toBe(n);
});

test("a radius chosen on home carries into tiles and links (R-011)", async ({ page }) => {
  await page.goto("/?radius=5");
  await expect(page.locator(".ws-locbar__text")).toContainText("within 5 km");
  const tile = page.getByRole("link", { name: /^Phones & tablets/ });
  await expect(tile).toHaveAttribute("href", /radius=(5|all)/);
});

test("placeholder pages are real destinations, unknown pages are 404s (F5)", async ({ page }) => {
  await page.goto("/");
  await Promise.all([page.waitForURL(/\/sell\/start$/, { timeout: 20_000 }), page.getByRole("link", { name: "Start selling" }).click()]);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Start selling");
  await expect(page.getByText("Coming in Phase 7 of the build.")).toBeVisible();
  for (const [url, title] of [["/cart", "Cart"], ["/inbox", "Inbox"], ["/help/escrow", "How escrow protects you"], ["/seller/gadgethub-ikeja", "Gadget Hub Ikeja"]]) {
    const res = await page.goto(url);
    expect(res?.status(), url).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  }
  for (const url of ["/help/nonsense", "/seller/nobody", "/no-such-page"]) {
    expect((await page.goto(url))?.status(), url).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("We can't find that page");
  }
});

test("the app is installable: manifest and icons (F16)", async ({ page, request }) => {
  await page.goto("/");
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  const manifest = await (await request.get(href!)).json();
  expect(manifest).toMatchObject({ name: "WorldStreet Marketplace", display: "standalone", start_url: "/" });
  for (const icon of manifest.icons) expect((await request.get(icon.src)).status()).toBe(200);
});

test("no sideways scroll on home at 320 and 360", async ({ page }) => {
  for (const width of [320, 360]) {
    await page.setViewportSize({ width, height: 740 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

for (const url of ["/", "/?radius=all", "/cart", "/no-such-page"]) {
  test(`axe: no serious or critical issues on ${url}`, async ({ page }) => {
    await page.goto(url);
    const { violations } = await new AxeBuilder({ page }).analyze();
    const bad = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}
