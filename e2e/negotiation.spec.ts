import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("P2P: sign in, offer, seller accepts and requests payment, buyer pays in demo", async ({ page }) => {
  await page.goto("/offers?listing=204501");
  await expect(page.getByRole("heading", { name: "Make an offer", exact: true })).toBeVisible();
  await page.getByLabel("Your offer per item (NGN)").fill("450000");
  await page.getByRole("button", { name: "Send offer", exact: true }).click();
  const signIn = page.getByRole("dialog", { name: "Sign in" });
  await expect(signIn).toBeVisible();
  await signIn.getByRole("button", { name: "Continue with demo account" }).click();
  await expect(page.getByTestId("offer-status")).toHaveText("pending");
  await page.getByLabel("Demo perspective").selectOption("seller");
  await page.getByRole("button", { name: "Accept offer", exact: true }).click();
  await page.getByLabel("Agreed delivery (NGN)").fill("2000");
  await page.getByRole("button", { name: "Send payment request" }).click();
  await expect(page.getByTestId("request-total")).toContainText("₦452,000");
  await page.getByLabel("Demo perspective").selectOption("buyer");
  await page.getByRole("button", { name: "Simulate payment" }).click();
  await expect(page.getByTestId("offer-status")).toHaveText("paid");
  await expect(page.getByText("Demo payment complete. No funds moved.", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("offer-status")).toHaveText("paid");
  await expect(page.locator('a[href^="/cart"], a[href^="/checkout"]')).toHaveCount(0);
});

test("messaging warns about outside payments, preserves chat, and blocks the seller", async ({ page }) => {
  await page.goto("/inbox?listing=204501");
  await page.getByLabel("Message", { exact: true }).fill("Pay me directly on WhatsApp");
  await expect(page.getByText("This message may move your conversation or payment outside WorldStore.")).toBeVisible();
  await page.getByLabel("I understand; send this message anyway").check();
  await page.getByRole("button", { name: "Send message" }).click();
  await page.getByRole("dialog", { name: "Sign in" }).getByRole("button", { name: "Continue with demo account" }).click();
  await expect(page.getByRole("log")).toContainText("Pay me directly on WhatsApp");
  await page.reload();
  await expect(page.getByRole("log")).toContainText("Pay me directly on WhatsApp");
  await page.getByRole("button", { name: "Block seller", exact: true }).click();
  await expect(page.getByRole("button", { name: "Send message" })).toBeDisabled();
  await page.getByRole("button", { name: "Unblock seller", exact: true }).click();
  await expect(page.getByRole("button", { name: "Send message" })).toBeEnabled();
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(axe.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
});

test("a failed browser save keeps the unsent message in the composer", async ({ page }) => {
  await page.goto("/inbox?listing=204501");
  await page.evaluate(() => localStorage.setItem("ws:mock-session", JSON.stringify({ signedIn: true })));
  await page.reload();
  await page.getByLabel("Message", { exact: true }).fill("Please keep this draft");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "ws:p2p:v1") throw new DOMException("Full", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Could not save on this device", { exact: false })).toBeVisible();
  const conversation = page.getByRole("region", { name: "Conversation" });
  await expect(conversation.locator("textarea")).toHaveValue("Please keep this draft");
  await expect(page.getByRole("log")).not.toContainText("Please keep this draft");
});
