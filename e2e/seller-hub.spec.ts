import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const T0 = Date.parse("2026-10-08T08:00:00Z");
const DAY = 86_400_000;
const pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const listing = (id: string, title: string, price: number, qty: number) => ({
  id, title, created_at: T0 - DAY, published_at: T0 - DAY, updated_at: T0 - DAY, status: "live", review_reason: "", revisions: [],
  photos: [{ url: pixel, width: 1200, height: 900, bytes: 100 }], category_id: "phones", specifics: { Brand: "Apple", Model: "iPhone 13", Storage: "128GB" }, condition: "like_new", flaws: "", serial: "490154203237518",
  description: "Barely used, battery health 96%. Box and cable included.", price_minor: price, qty, offers_enabled: true, auto_accept_minor: null, auto_decline_minor: null,
  delivery: [{ method: "rider", fee_minor: 2_500_00, handling_days: 1 }], package: "small", return_days: 7, return_payer: "buyer",
});
const shop = {
  profile: { shop_name: "Ada Gadgets", handle: "ada_gadgets", bio: "", area_id: "ikeja", categories: ["phones"] },
  kyc: { status: "approved", id_type: "nin", id_last4: "8901", legal_name: "Ada Okafor", reason: "", submissions: [T0 - 2 * DAY] },
  payout: { kind: "bank", bank: "GTBank", account_last4: "6789", account_name: "ADA OKAFOR" }, agreed_at: T0 - 2 * DAY,
  drafts: [], listings: [listing("L1", "iPhone 13 128GB Midnight", 420_000_00, 2), listing("L2", "AirPods Pro 2nd gen", 150_000_00, 1)],
  orders: [], withdrawals: [], withdraw_hold_until: null,
};

async function open(page: Page, url: string, clock = true) {
  if (clock) await page.clock.install({ time: T0 });
  await page.addInitScript((seed) => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("ws:mock-session", JSON.stringify({ signedIn: true }));
    localStorage.setItem("ws:seller:v1", JSON.stringify(seed));
  }, shop);
  await page.goto(url);
}

test("listings: inline price edit with undo, bulk price change and ending (S3, R-112, R-120)", async ({ page }) => {
  await open(page, "/vendor/listings");
  await expect(page.getByRole("tab", { name: "Active (2)" })).toBeVisible();
  await page.getByRole("button", { name: /Price of iPhone 13 128GB Midnight: ₦420,000\. Edit/ }).click();
  await page.getByRole("textbox", { name: "Price of iPhone 13 128GB Midnight" }).fill("400000");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: /Price of iPhone 13.*₦400,000/ })).toBeVisible();
  await expect(page.getByText("1 edit logged")).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("button", { name: /Price of iPhone 13.*₦420,000/ })).toBeVisible();
  await page.getByRole("checkbox", { name: "Select all" }).check();
  await page.getByLabel("Change price by %").fill("-10");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByRole("button", { name: /Price of AirPods.*₦135,000/ })).toBeVisible();
  await page.getByRole("button", { name: "End listings" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "End listings" }).click();
  await expect(page.getByRole("tab", { name: "Ended (2)" })).toBeVisible();
  await page.getByRole("tab", { name: "Ended (2)" }).click();
  await page.getByRole("button", { name: "Actions for AirPods Pro 2nd gen" }).click();
  await page.getByRole("menuitem", { name: "Relist" }).click();
  await expect(page.getByRole("tab", { name: "Active (1)" })).toBeVisible();
});

test("an order goes from purchase to dispatch, delivery, release and a withdrawal (S5, S6)", async ({ page }) => {
  await open(page, "/vendor/listings");
  await page.getByRole("button", { name: "Actions for iPhone 13 128GB Midnight" }).click();
  await page.getByRole("menuitem", { name: "Demo: simulate a buyer purchase" }).click();
  await page.getByRole("button", { name: "View orders" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Orders" })).toBeVisible();
  await expect(page.getByText(/Confirm within 12 h · due in 12 h/)).toBeVisible();
  await page.getByRole("button", { name: "Confirm order" }).click();
  await page.getByRole("button", { name: "Dispatch" }).click();
  const sheet = page.getByRole("dialog", { name: "Dispatch order" });
  await expect(sheet.getByRole("radio", { name: /My own rider/ })).toBeDisabled();
  await sheet.getByLabel("Courier", { exact: true }).selectOption("Kwik");
  await sheet.getByRole("button", { name: "Mark as dispatched" }).click();
  await page.getByRole("tab", { name: /Shipped/ }).click();
  await expect(page.getByText(/Kwik KWI-/)).toBeVisible();
  await page.getByRole("button", { name: "Demo: mark delivered" }).click();
  await page.getByRole("button", { name: "Demo: buyer confirms" }).click();
  await page.getByRole("tab", { name: "Completed (1)" }).click();
  await expect(page.getByText("iPhone 13 128GB Midnight")).toBeVisible();

  await page.goto("/vendor/payouts");
  const balances = page.getByRole("region", { name: "Balances" });
  // ₦422,500 − 5% of ₦420,000 − 1.5% of ₦422,500 = ₦395,162.50 pending
  await expect(balances).toContainText("Pending₦395,162.50");
  await expect(page.getByRole("button", { name: "Withdraw" })).toBeDisabled();
  await page.clock.setSystemTime(T0 + 15 * DAY);
  await page.reload();
  await expect(balances).toContainText("Available₦395,162.50");
  await page.getByRole("button", { name: "Withdraw" }).click();
  const flow = page.getByRole("dialog", { name: "Withdraw to your bank" });
  await flow.getByLabel("Amount (₦)").fill("200000");
  await flow.getByRole("button", { name: "Continue" }).click();
  await flow.getByLabel("Code").fill("111111");
  await flow.getByRole("button", { name: "Withdraw ₦200,000" }).click();
  await expect(flow.getByRole("alert")).toContainText("isn’t right");
  await flow.getByLabel("Code").fill("246810");
  await flow.getByRole("button", { name: "Withdraw ₦200,000" }).click();
  await expect(flow.getByText("₦200,000 is on its way to your bank.")).toBeVisible();
  await flow.getByRole("button", { name: "Done" }).click();
  await expect(balances).toContainText("Available₦195,162.50");
  await expect(page.getByRole("table")).toContainText("Withdrawn to bank");
});

test("a seller cancellation refunds the buyer, restocks and counts on performance (S5, S7)", async ({ page }) => {
  await open(page, "/vendor/listings");
  await page.getByRole("button", { name: "Actions for AirPods Pro 2nd gen" }).click();
  await page.getByRole("menuitem", { name: "Demo: simulate a buyer purchase" }).click();
  await expect(page.getByText("Out of stock")).toBeVisible();
  await page.goto("/vendor/orders");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Cancel this order?" });
  await dialog.getByRole("button", { name: "Cancel order" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Choose a reason");
  await dialog.getByRole("radio", { name: "Out of stock" }).check();
  await dialog.getByRole("button", { name: "Cancel order" }).click();
  await page.getByRole("tab", { name: "Cancelled (1)" }).click();
  await expect(page.getByText(/Out of stock/)).toBeVisible();
  await page.goto("/vendor/performance");
  await expect(page.getByRole("heading", { level: 2, name: "New" })).toBeVisible();
  await expect(page.getByRole("meter", { name: "Seller-fault cancellations" })).toHaveAttribute("aria-valuetext", /100%/);
});

test("axe: Seller Hub pages have no serious or critical violations", async ({ page }) => {
  test.setTimeout(90_000); // axe takes a few seconds per page
  await open(page, "/vendor/listings", false);
  for (const url of ["/vendor/listings", "/vendor/orders", "/vendor/payouts", "/vendor/performance"]) {
    await page.goto(url);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${url} ${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
  }
});
