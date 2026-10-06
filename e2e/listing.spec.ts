import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/* Phase 3 listing detail (flows B3, spec §7). */

const IPHONE = "/listing/204501-iphone-14-pro-256gb-deep-purple";

test("price, delivery, returns and the escrow line are above the fold on a 375×812 phone (§18 stage 3)", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(IPHONE);
  const box = page.getByRole("region", { name: "Price and buying" });
  for (const el of [box.locator(".ws-price__now"), box.getByText("+₦2,500 delivery"), box.getByText("7-day returns."), box.getByText(/We hold your payment/)]) {
    const r = (await el.boundingBox())!;
    expect(r.y + r.height).toBeLessThanOrEqual(812);
  }
});

test("one h1, the title", async ({ page }) => {
  await page.goto(IPHONE);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("iPhone 14 Pro 256GB Deep Purple");
});

test("on phones the sticky bar shows the buy box's total once the buttons scroll away (R-020)", async ({ page }, info) => {
  test.skip(info.project.name === "desktop", "phones only");
  await page.goto(IPHONE, { waitUntil: "networkidle" });
  const total = (await page.getByRole("region", { name: "Price and buying" }).locator(".ws-delivery__total").first().textContent())!.match(/₦[\d,]+/)![0];
  const bar = page.locator(".ws-stickybuy");
  await expect(bar).toHaveAttribute("data-shown", "false");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(bar).toHaveAttribute("data-shown", "true");
  await expect(bar).toContainText(total);
  await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
});

test("the gallery steps with arrows and keys, and opens full screen", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "arrows show on hover devices");
  await page.goto(IPHONE, { waitUntil: "networkidle" });
  const gallery = page.getByRole("region", { name: "Photos" });
  await gallery.getByRole("button", { name: "Next photo" }).click();
  await expect(gallery.locator(".ws-gallery__count")).toHaveText("2 / 8");
  await gallery.getByRole("group", { name: /^Photos,/ }).press("ArrowRight");
  await expect(gallery.locator(".ws-gallery__count")).toHaveText("3 / 8");
  await gallery.getByRole("button", { name: "Photo 1 of 8" }).click();
  await expect(gallery.locator(".ws-gallery__count")).toHaveText("1 / 8");
  await gallery.getByRole("button", { name: "View photo 1 full screen" }).click();
  const lightbox = page.getByRole("dialog", { name: /photos$/ });
  await expect(lightbox).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(lightbox).toBeHidden();
});

test("buttons go somewhere real (F5): Buy it now to checkout, offers when enabled", async ({ page }) => {
  await page.goto(IPHONE);
  const box = page.getByRole("region", { name: "Price and buying" });
  await expect(box.getByRole("link", { name: "Buy it now" })).toHaveAttribute("href", "/checkout?listing=204501");
  await expect(box.getByRole("link", { name: "Make offer" })).toHaveAttribute("href", "/offers?listing=204501");
});

test("vehicles have no checkout: Contact seller instead (PLAN risk 7)", async ({ page }) => {
  await page.goto("/listing/204539-toyota-corolla-2014-le-automatic");
  const box = page.getByRole("region", { name: "Price and buying" });
  await expect(box.getByRole("link", { name: "Buy it now" })).toHaveCount(0);
  await expect(box.getByRole("link", { name: "Contact seller" })).toBeVisible();
  await expect(box.getByText(/No escrow checkout/)).toBeVisible();
});

test("delivery shows dates to the buyer's area and the buy box's total; Change picks another area (B3 step 3, R-020)", async ({ page }) => {
  await page.goto(IPHONE);
  const delivery = page.locator("details.ws-panel").filter({ hasText: "Delivery" }).first();
  await expect(delivery).toHaveAttribute("open", "");
  await expect(delivery.getByText(/^Arrives (Mon|Tue|Wed|Thu|Fri) \d+/).first()).toBeVisible();
  const boxTotal = (await page.getByRole("region", { name: "Price and buying" }).locator(".ws-delivery__total").first().textContent())!.match(/₦[\d,]+/)![0];
  await expect(delivery.locator(".ws-panel__total")).toContainText(boxTotal);
  await delivery.getByRole("button", { name: "Change delivery location" }).click();
  const picker = page.getByRole("dialog", { name: "Choose your location" });
  await expect(picker).toBeVisible();
  await picker.getByLabel("Area").selectOption("wuse");
  await picker.getByRole("button", { name: /Apply|Show/ }).click();
  await expect(page).toHaveURL(/\/listing\/204501-/);
  await expect(page.locator("details.ws-panel").first().getByText(/^To\s*Wuse/)).toBeVisible();
});

test("reporting a listing: a reason is required, then thanks (spec §7 ReportListingModal)", async ({ page }) => {
  await page.goto(IPHONE, { waitUntil: "networkidle" });
  await page.getByRole("region", { name: "Shop with confidence" }).getByRole("button", { name: "Report this listing" }).click();
  const dialog = page.getByRole("dialog", { name: "Report this listing" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Send report" }).click();
  await expect(dialog.getByText("Choose a reason.")).toBeVisible();
  await dialog.getByRole("radio", { name: /Looks like a scam/ }).check();
  await dialog.getByRole("button", { name: "Send report" }).click();
  await expect(dialog.getByText(/reviews reports within 24 hours/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("Share falls back to our sheet with WhatsApp first and an absolute link", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "share", { value: undefined }));
  await page.goto(IPHONE, { waitUntil: "networkidle" });
  await page.getByRole("region", { name: "Photos" }).getByRole("button", { name: "Share" }).click();
  const sheet = page.getByRole("dialog", { name: "Share this listing" });
  await expect(sheet).toBeVisible();
  const wa = decodeURIComponent((await sheet.getByRole("link", { name: /WhatsApp/ }).getAttribute("href"))!);
  expect(wa).toMatch(/^https:\/\/wa\.me\/\?text=.*http:\/\/localhost:\d+\/listing\/204501-iphone/);
});

test("item specifics, the condition definition and the item number (spec §7)", async ({ page }) => {
  await page.goto(IPHONE, { waitUntil: "networkidle" });
  const about = page.getByRole("region", { name: "About this item" });
  await expect(about.locator(".ws-specs__row", { hasText: "Condition" })).toContainText("Pre-owned");
  await about.getByRole("button", { name: "What Pre-owned means" }).click();
  await expect(page.getByRole("dialog", { name: "Condition: Pre-owned" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(about.getByText("204501")).toBeVisible();
});

test("axe: no serious or critical issues on a listing", async ({ page }) => {
  await page.goto(IPHONE, { waitUntil: "networkidle" });
  await page.getByRole("region", { name: "Shop with confidence" }).getByRole("button", { name: "Report this listing" }).click();
  await expect(page.getByRole("dialog", { name: "Report this listing" })).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).analyze();
  const bad = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});
