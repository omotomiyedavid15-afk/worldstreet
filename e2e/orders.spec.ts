import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("lists active orders and shows delivery proof, escrow and the inspection window", async ({ page }) => {
  await page.goto("/orders");
  await expect(page.getByRole("heading", { level: 1, name: "Orders" })).toBeVisible();
  await expect(page.getByText("WS-84291")).toBeVisible();
  await page.getByRole("link", { name: "Track order" }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("iPhone 14 Pro");
  await expect(page.getByText("8142", { exact: true })).toBeVisible();
  await expect(page.getByText(/remaining|Inspection window ended/)).toBeVisible();
  await expect(page.getByText("Your payment is held safely while the item is delivered and checked.")).toBeVisible();
});

test("confirmation states the consequence and releases only that order", async ({ page }) => {
  await page.goto("/orders/WS-84291");
  const escrowStatus = page.locator(".ws-order-live");
  await expect(escrowStatus).toHaveAttribute("aria-live", "polite");
  await expect(escrowStatus).toContainText("held");
  await page.getByRole("button", { name: "Everything’s fine" }).click();
  const dialog = page.getByRole("dialog", { name: "Confirm receipt" });
  await expect(dialog).toContainText("Release ₦452,000");
  await expect(dialog).toContainText("hidden defect within 14 days");
  await dialog.getByRole("button", { name: "Release payment" }).click();
  await expect(escrowStatus).toContainText("Paid to seller");
  await expect(page.getByText("Paid to seller", { exact: true })).toBeVisible();
  await expect(page.getByText("The payment has been released to the seller.")).toBeVisible();
  await page.goto("/orders/WS-84276");
  await expect(page.getByText(/held safely/)).toBeVisible();
});

for (const skewMinutes of [-5, 5]) test(`the rendered timer corrects ${skewMinutes > 0 ? "+" : ""}${skewMinutes} minutes of client skew`, async ({ page }) => {
  await page.addInitScript((skew) => { const actualNow = Date.now; Date.now = () => actualNow() + skew * 60_000; }, skewMinutes);
  await page.goto("/orders/WS-84291");
  const timer = page.locator("[data-remaining-ms]");
  const expected = Date.parse("2026-10-10T18:00:00Z") - Date.now();
  await expect.poll(async () => Math.abs(Number(await timer.getAttribute("data-remaining-ms")) - expected)).toBeLessThan(10_000);
});

test("an expired inspection window auto-releases once", async ({ page }) => {
  await page.goto("/orders/WS-84291");
  await page.getByRole("button", { name: /Add 24 hours/ }).click();
  await page.evaluate(() => { const key = "ws:orders:v1"; const state = JSON.parse(localStorage.getItem(key)!); state.orders[0].inspection_deadline = Date.now() - 1; localStorage.setItem(key, JSON.stringify(state)); });
  await page.reload();
  await expect(page.locator(".ws-order-live")).toContainText("Paid to seller");
  await expect(page.getByText("Inspection ended · funds released")).toHaveCount(1);
});

test("a problem freezes escrow and a failed refund recovers to the balance", async ({ page }) => {
  await page.goto("/orders/WS-84291/problem");
  await page.getByLabel("Not as described").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Evidence and details").fill("The storage capacity does not match the listing.");
  await page.getByLabel("Yes", { exact: true }).check();
  await page.getByLabel("I have photos or video showing the problem").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Submit case" }).click();
  await expect(page).toHaveURL(/\/orders\/WS-84291$/);
  const escrowStatus = page.locator(".ws-order-live");
  await expect(escrowStatus).toContainText("Under review");
  await expect(page.getByText("The affected payment is under review")).toBeVisible();
  await page.getByRole("button", { name: "Simulate refund failure" }).click();
  await expect(escrowStatus).toContainText("Refund needs action");
  await page.getByRole("button", { name: "Recover to WorldStore balance" }).click();
  await expect(escrowStatus).toContainText("₦452,000 refunded");
  await expect(page.getByText("The protected payment was refunded to you.")).toBeVisible();
});

test("a completed purchase accepts one five-part verified review", async ({ page }) => {
  await page.goto("/orders/WS-84017/review");
  for (const label of ["Overall", "Accurate description", "Delivery speed", "Communication", "Packaging"]) await page.getByLabel(label).selectOption("5");
  await page.getByLabel("Review (optional)").fill("Exactly as described and carefully packed.");
  await page.getByRole("button", { name: "Post review" }).click();
  await expect(page).toHaveURL(/\/orders\/WS-84017$/);
  await expect(page.getByText("Your review · 5/5")).toBeVisible();
  await expect(page.getByRole("link", { name: "Write a review" })).toHaveCount(0);
});

test("axe: order detail has no serious or critical violations", async ({ page }) => {
  await page.goto("/orders/WS-84291");
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter((item) => item.impact === "serious" || item.impact === "critical").map((item) => item.id)).toEqual([]);
});
