import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const verified = {
  profile: { shop_name: "Ada Gadgets", handle: "ada_gadgets", bio: "", area_id: "ikeja", categories: ["phones"] },
  kyc: { status: "approved", id_type: "nin", id_last4: "8901", legal_name: "Ada Okafor", reason: "", submissions: [Date.parse("2026-10-07T09:00:00Z")] },
  payout: { kind: "bank", bank: "GTBank", account_last4: "6789", account_name: "ADA OKAFOR" },
  agreed_at: Date.parse("2026-10-07T09:10:00Z"),
  drafts: [],
  listings: [],
};

async function start(page: Page, account?: object) {
  await page.addInitScript((seed) => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("ws:mock-session", JSON.stringify({ signedIn: true }));
    if (seed) localStorage.setItem("ws:seller:v1", JSON.stringify(seed));
  }, account);
}

async function photo(page: Page, name = "front.png") {
  const url = await page.evaluate(() => { const c = document.createElement("canvas"); c.width = 900; c.height = 700; const g = c.getContext("2d")!; g.fillStyle = "#3b6"; g.fillRect(0, 0, 900, 700); g.fillStyle = "#fff"; g.fillRect(300, 150, 300, 400); return c.toDataURL("image/png"); });
  return { name, mimeType: "image/png", buffer: Buffer.from(url.split(",")[1], "base64") };
}

/** Each step moves focus to its heading (for screen readers); wait for it before typing. */
async function next(page: Page, heading: string) {
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { level: 1, name: heading })).toBeFocused();
}

async function fillListing(page: Page, typeDelay = 0) {
  await page.locator('input[type="file"]').setInputFiles([await photo(page), await photo(page, "back.png")]);
  await expect(page.getByText("2 of 12 photos")).toBeVisible();
  await next(page, "Category and details");
  await page.getByRole("radio", { name: "Phones & tablets" }).check();
  await page.getByLabel("Brand", { exact: true }).fill("Apple");
  await page.getByLabel("Model", { exact: true }).fill("iPhone 13");
  await page.getByLabel("Storage", { exact: true }).fill("128GB");
  await page.getByLabel("IMEI").fill("490154203237518");
  await page.getByRole("radio", { name: /Like new/ }).check();
  await next(page, "Title and description");
  await page.getByLabel("Title", { exact: true }).pressSequentially("iPhone 13 128GB Midnight", { delay: typeDelay });
  await page.getByLabel("Description").pressSequentially("Barely used, battery health 96%. Box, cable and case included.", { delay: typeDelay });
  await next(page, "Price and offers");
  await page.getByLabel("Price (₦)").fill("420000");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Review and publish" })).toBeVisible();
}

test("onboarding verifies identity, rejects a mismatched payout name and finishes setup (S1)", async ({ page }) => {
  await start(page);
  await page.goto("/sell/start");
  await page.getByRole("button", { name: "Get started" }).click();
  await page.getByLabel("Shop name").fill("Ada Gadgets");
  await expect(page.getByLabel("Handle")).toHaveValue("ada_gadgets");
  await page.getByLabel("Where you sell from").selectOption("ikeja");
  await page.getByRole("checkbox", { name: "Phones & tablets" }).check();
  await page.getByRole("button", { name: "Save and continue" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Identity" })).toBeVisible();
  await page.getByLabel("ID number").fill("123");
  await page.getByLabel("Full name, exactly as on your ID").fill("Ada Okafor");
  await page.getByRole("button", { name: "Submit for verification" }).click();
  await expect(page.locator(".ws-sell-alert")).toContainText("11 digits");
  await page.getByLabel("ID number").fill("12345678901");
  await page.getByRole("button", { name: "Take selfie (demo)" }).click();
  await page.getByRole("button", { name: "Submit for verification" }).click();
  await expect(page.getByText("We’re checking your ID")).toBeVisible();
  await page.getByRole("button", { name: "Reject" }).click();
  await expect(page.locator(".ws-sell-alert")).toContainText("doesn’t match your ID");
  await page.getByLabel("ID number").fill("12345678901");
  await page.getByRole("button", { name: "Take selfie (demo)" }).click();
  await page.getByRole("button", { name: "Submit for verification" }).click();
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText(/Identity verified: Ada Okafor/)).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Bank").selectOption("GTBank");
  await page.getByLabel("Account number").fill("9990001234");
  await page.getByRole("button", { name: "Verify account" }).click();
  await page.getByRole("button", { name: "Use this account" }).click();
  await expect(page.locator(".ws-sell-alert")).toContainText("Account name must match your ID name");
  await page.getByLabel("Account number").fill("0123456789");
  await page.getByRole("button", { name: "Verify account" }).click();
  await expect(page.getByText("ADA OKAFOR", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Use this account" }).click();

  await page.getByRole("radio", { name: /Decline: weapons/ }).check();
  await page.getByRole("radio", { name: "Send a payment request in chat instead" }).check();
  await page.getByRole("radio", { name: "You must accept the return or refund" }).check();
  await page.getByRole("checkbox", { name: /I agree/ }).check();
  await page.getByRole("button", { name: "Finish setup" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "You’re ready to sell" })).toBeVisible();
  const stored = await page.evaluate(() => localStorage.getItem("ws:seller:v1"));
  expect(stored).not.toContain("12345678901");
});

test("a draft can be written before KYC, survives a reload and can't be published (R-100, EC-011)", async ({ page }) => {
  await start(page);
  await page.goto("/sell/new");
  await expect(page).toHaveURL(/\/sell\/d[a-z0-9]+$/);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator(".ws-sell-alert")).toContainText("Add at least one photo");
  await expect(page.getByRole("button", { name: /Photos \(needs attention\)/ })).toBeVisible();
  await fillListing(page);
  await expect(page.getByText("Verify your identity and add a payout account to publish")).toBeVisible();
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.locator(".ws-sell-alert")).toContainText("Verify your identity");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Review and publish" })).toBeVisible();
  await expect(page.locator(".ws-preview")).toContainText("iPhone 13 128GB Midnight");
  await page.goto("/vendor");
  await expect(page.getByText("iPhone 13 128GB Midnight")).toBeVisible();
  await expect(page.getByText("Step 7 of 7: Review")).toBeVisible();
});

test("a verified seller's first listing goes live in under 4 minutes (§18)", async ({ page }) => {
  test.setTimeout(240_000);
  await start(page, verified);
  const begin = Date.now();
  await page.goto("/sell/new");
  await fillListing(page, 40);
  await expect(page.getByText("Ready to publish")).toBeVisible();
  await expect(page.locator(".ws-fees")).toContainText("₦392,700");
  await page.getByRole("button", { name: "Publish listing" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Your listing is live" })).toBeVisible();
  expect(Date.now() - begin).toBeLessThan(240_000);
  await page.getByRole("link", { name: "Go to Seller Hub" }).click();
  await expect(page.locator(".ws-hub-status")).toHaveText("Live");
});

test("prohibited terms block publishing and luxury brands go to review (R-110, R-111)", async ({ page }) => {
  await start(page, verified);
  await page.goto("/sell/new");
  await fillListing(page);
  await page.getByRole("button", { name: "Title" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Title and description" })).toBeFocused();
  await page.getByLabel("Title", { exact: true }).fill("Replica iPhone 13 128GB");
  await page.getByRole("button", { name: "Review" }).click();
  await expect(page.locator(".ws-checklist")).toContainText("“Replica” isn’t allowed");
  await page.getByRole("button", { name: "Title" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Title and description" })).toBeFocused();
  await page.getByLabel("Title", { exact: true }).fill("iPhone 13 128GB with Gucci case");
  await page.getByRole("button", { name: "Review" }).click();
  await page.getByRole("button", { name: "Publish listing" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Your listing is in review" })).toBeVisible();
  await expect(page.getByText(/authenticity check/)).toBeVisible();
});

test("axe: the listing wizard and onboarding have no serious or critical violations", async ({ page }) => {
  test.setTimeout(90_000); // axe takes a few seconds per page
  await start(page);
  await page.goto("/sell/new");
  await expect(page.getByRole("heading", { level: 1, name: "Add photos" })).toBeVisible();
  for (const url of [page.url(), "/sell/start", "/vendor"]) {
    await page.goto(url);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
  }
});
