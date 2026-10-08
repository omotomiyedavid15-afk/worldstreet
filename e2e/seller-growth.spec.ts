import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const T0 = Date.parse("2026-10-08T08:00:00Z");
const DAY = 86_400_000;
const pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const shop = {
  profile: { shop_name: "Ada Gadgets", handle: "ada_gadgets", bio: "", area_id: "ikeja", categories: ["phones"] },
  kyc: { status: "approved", id_type: "nin", id_last4: "8901", legal_name: "Ada Okafor", reason: "", submissions: [T0 - 2 * DAY] },
  payout: { kind: "bank", bank: "GTBank", account_last4: "6789", account_name: "ADA OKAFOR" }, agreed_at: T0 - 2 * DAY,
  drafts: [], orders: [], withdrawals: [], withdraw_hold_until: null, suspended_reason: null, payout_hold_reason: null,
  listings: [{
    id: "L1", title: "iPhone 13 128GB Midnight", created_at: T0 - DAY, published_at: T0 - DAY, updated_at: T0 - DAY, status: "live", review_reason: "", revisions: [], promotion: null,
    photos: [{ url: pixel, width: 1200, height: 900, bytes: 100 }], category_id: "phones", specifics: { Brand: "Apple", Model: "iPhone 13", Storage: "128GB" }, condition: "like_new", flaws: "", serial: "490154203237518",
    description: "Barely used, battery health 96%. Box and cable included.", price_minor: 420_000_00, qty: 2, offers_enabled: true, auto_accept_minor: null, auto_decline_minor: null,
    delivery: [{ method: "rider", fee_minor: 2_500_00, handling_days: 1 }], package: "small", return_days: 7, return_payer: "buyer",
  }],
};

async function open(page: Page, url: string) {
  await page.clock.install({ time: T0 });
  await page.addInitScript((seed) => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("ws:mock-session", JSON.stringify({ signedIn: true }));
    localStorage.setItem("ws:seller:v1", JSON.stringify(seed));
  }, shop);
  await page.goto(url);
}

test("a promoted sale pays the ad fee at release and shows in analytics", async ({ page }) => {
  await open(page, "/vendor/listings");
  await page.getByRole("button", { name: "Actions for iPhone 13 128GB Midnight" }).click();
  await page.getByRole("menuitem", { name: "Promote…" }).click();
  const dialog = page.getByRole("dialog", { name: /Promote/ });
  await dialog.getByLabel("Ad rate (%)").fill("20");
  await dialog.getByRole("button", { name: "Promote" }).click();
  await expect(dialog.locator(".ws-sell-alert")).toContainText("2% to 15%");
  await dialog.getByLabel("Ad rate (%)").fill("5");
  await expect(dialog).toContainText("the ad fee is ₦21,000");
  await dialog.getByRole("button", { name: "Promote" }).click();
  await expect(page.getByText("Promoted 5%")).toBeVisible();

  await page.getByRole("button", { name: "Actions for iPhone 13 128GB Midnight" }).click();
  await page.getByRole("menuitem", { name: "Demo: simulate a buyer purchase" }).click();
  await page.goto("/vendor/orders");
  await page.getByRole("button", { name: "Confirm order" }).click();
  await page.getByRole("button", { name: "Dispatch" }).click();
  await page.getByRole("dialog", { name: "Dispatch order" }).getByRole("button", { name: "Mark as dispatched" }).click();
  await page.getByRole("tab", { name: /Shipped/ }).click();
  await page.getByRole("button", { name: "Demo: mark delivered" }).click();
  await page.getByRole("button", { name: "Demo: buyer confirms" }).click();

  await page.goto("/vendor/payouts");
  // ₦395,162.50 after sale fees, minus the 5% ad fee on ₦420,000
  await expect(page.getByRole("region", { name: "Balances" })).toContainText("Pending₦374,162.50");
  await page.goto("/vendor/analytics");
  await expect(page.getByRole("heading", { level: 1, name: "Analytics" })).toBeVisible();
  await expect(page.locator(".ws-balance").filter({ hasText: "Sales" })).toContainText("₦422,500");
  await expect(page.locator(".ws-balance").filter({ hasText: /^Fees/ })).toContainText("₦21,000 of it on promotions (1 promoted sale)");
  await page.getByRole("button", { name: /: ₦422,500, 1 order/ }).focus();
  await expect(page.locator(".ws-chart__readout")).toContainText("₦422,500 · 1 order");
  await expect(page.getByRole("list").filter({ hasText: "1 sold · promoted" })).toBeVisible();
});

test("CSV import creates drafts and reports bad rows by number; export downloads the listings (R-122)", async ({ page }) => {
  await open(page, "/vendor/import");
  const csv = [
    "title,category,condition,price,quantity,description,specifics,delivery,returns,offers",
    "Samsung Galaxy A54 128GB,phones,used,\"185,000\",1,Works perfectly; small scratch on the frame. Charger included.,Brand=Samsung; Model=A54; Storage=128GB,courier,7,yes",
    "Replica watch cheap,watches,new,abc,0,short,,,,",
  ].join("\n");
  await page.locator('input[type="file"]').setInputFiles({ name: "stock.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
  const result = page.getByRole("status", { name: /1 draft created, 1 row need fixing/ });
  await expect(result).toBeVisible();
  await expect(result).toContainText("Row 3: Replica watch cheap");
  await expect(result).toContainText("isn’t allowed");
  await result.getByRole("link", { name: "See drafts in Seller Hub" }).click();
  await expect(page.getByText("Samsung Galaxy A54 128GB")).toBeVisible();

  await page.goto("/vendor/listings");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export CSV" }).click()]);
  expect(download.suggestedFilename()).toBe("worldstore-listings.csv");
  const text = await readFile((await download.path())!, "utf8");
  expect(text).toContain("id,status,title,category");
  expect(text).toContain("L1,live,iPhone 13 128GB Midnight,phones,like_new,420000,2");
});

test("axe: import and analytics have no serious or critical violations", async ({ page }) => {
  test.setTimeout(90_000);
  await open(page, "/vendor/import");
  for (const url of ["/vendor/import", "/vendor/analytics"]) {
    await page.goto(url);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${url} ${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
  }
});
