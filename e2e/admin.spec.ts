import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const DAY = 86_400_000;
const pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/** A verified shop whose luxury listing is waiting for an authenticity check. */
function shop(now: number) {
  return {
    profile: { shop_name: "Ada Gadgets", handle: "ada_gadgets", bio: "", area_id: "ikeja", categories: ["fashion"] },
    kyc: { status: "approved", id_type: "nin", id_last4: "8901", legal_name: "Ada Okafor", reason: "", submissions: [now - DAY] },
    payout: { kind: "bank", bank: "GTBank", account_last4: "6789", account_name: "ADA OKAFOR" }, agreed_at: now - DAY,
    drafts: [], orders: [], withdrawals: [], withdraw_hold_until: null, suspended_reason: null, payout_hold_reason: null,
    listings: [{
      id: "L1", title: "Rolex Datejust 36mm steel", created_at: now - 600_000, published_at: now - 600_000, updated_at: now - 600_000, status: "in_review", review_reason: "Rolex items get an authenticity check before going live, usually within 24 hours.", revisions: [],
      photos: [{ url: pixel, width: 1200, height: 900, bytes: 100 }], category_id: "fashion", specifics: { Size: "36mm" }, condition: "like_new", flaws: "", serial: "",
      description: "Box and papers included, serviced last year.", price_minor: 2_500_000_00, qty: 1, offers_enabled: true, auto_accept_minor: null, auto_decline_minor: null,
      delivery: [{ method: "courier", fee_minor: 4_500_00, handling_days: 1 }], package: "small", return_days: 7, return_payer: "buyer",
    }],
  };
}

async function seed(page: Page, staff?: string) {
  await page.addInitScript(({ s, staffId }) => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("ws:mock-session", JSON.stringify({ signedIn: true }));
    localStorage.setItem("ws:seller:v1", JSON.stringify(s));
    if (staffId) localStorage.setItem("ws:admin:v1", JSON.stringify({ staff_id: staffId, audit: [], reports: [], reversals: [] }));
  }, { s: shop(Date.now()), staffId: staff });
}
async function switchTo(page: Page, name: string) {
  const select = page.getByLabel("Switch demo staff account");
  await select.selectOption((await select.locator("option", { hasText: name }).getAttribute("value"))!);
}

test("staff sign in by role and only see their tools", async ({ page }) => {
  await seed(page);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { level: 1, name: "WorldStore staff console" })).toBeVisible();
  await page.getByRole("button", { name: /Amaka Okoro/ }).click();
  const nav = page.getByRole("navigation", { name: "Staff console" });
  await expect(nav.getByRole("link")).toHaveText(["Overview", "Support", "Audit log"]);
  await page.goto("/admin/moderation");
  await expect(page.getByText("Your role (Support) can’t open this page. It needs Moderation.")).toBeVisible();
});

test("a buyer report and an automatic flag reach the queue with SLA timers; actions are audited (A1)", async ({ page }) => {
  test.setTimeout(60_000); // a full buyer → staff → buyer journey
  await seed(page, "kemi");
  await page.goto("/listing/204501-iphone-14-pro-256gb-deep-purple", { waitUntil: "networkidle" });
  await page.getByRole("region", { name: "Shop with confidence" }).getByRole("button", { name: "Report this listing" }).click();
  const dialog = page.getByRole("dialog", { name: "Report this listing" });
  await dialog.getByRole("radio", { name: /Looks like a scam/ }).check();
  await dialog.getByRole("button", { name: "Send report" }).click();
  await expect(dialog.getByText(/reviews reports within 24 hours/)).toBeVisible();

  await page.goto("/admin/moderation");
  const rows = page.getByRole("listitem").filter({ has: page.getByRole("button", { name: "Review" }) });
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toContainText("Rolex Datejust 36mm steel");
  await expect(rows.first()).toContainText(/\d+ min left/);
  await expect(rows.nth(1)).toContainText("iPhone 14 Pro");
  await expect(rows.nth(1)).toContainText("High risk");

  await rows.first().getByRole("button", { name: "Review" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("Choose the policy");
  await page.getByRole("dialog").getByLabel("Policy (for removal)").selectOption("PC-02");
  await page.getByRole("dialog").getByRole("button", { name: "Remove" }).click();
  await expect(rows).toHaveCount(1);
  await rows.first().getByRole("button", { name: "Review" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Dismiss" }).click();
  await expect(page.getByRole("heading", { name: "Queue clear" })).toBeVisible();

  await page.goto("/admin/audit");
  await expect(page.getByRole("table")).toContainText("Dismissed report", { timeout: 15_000 });
  await expect(page.getByRole("table")).toContainText("Removed listing");
  await expect(page.getByRole("table")).toContainText("PC-02");
  await page.goto("/vendor/listings");
  await page.getByRole("tab", { name: /Ended/ }).click();
  await expect(page.getByText(/Removed for PC-02/)).toBeVisible();
});

test("a case decision needs a rationale, and the buyer reads it (A2, L8)", async ({ page }) => {
  test.setTimeout(60_000); // a full buyer → staff → buyer journey
  await seed(page, "tunde");
  await page.goto("/orders/WS-84291/problem");
  await page.getByLabel("Not as described").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Evidence and details").fill("Battery health is 71%, the listing said 89%.");
  await page.getByLabel("Yes", { exact: true }).check();
  await page.getByLabel("I have photos or video showing the problem").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Submit case" }).click();
  await expect(page).toHaveURL(/\/orders\/WS-84291$/);

  await page.goto("/admin/cases");
  await expect(page.getByText(/left/).first()).toBeVisible();
  await page.getByRole("link", { name: "Open case" }).click();
  await expect(page.getByText("Battery health is 71%, the listing said 89%.")).toBeVisible();
  await page.getByRole("radio", { name: "Partial refund, rest to seller" }).check();
  await page.getByLabel("Refund to buyer (₦)").fill("100000");
  await page.getByLabel("Rationale (both parties read this)").fill("Too short");
  await page.getByRole("button", { name: "Send decision" }).click();
  await expect(page.locator(".ws-sell-alert")).toContainText("at least 20 characters");
  await page.getByLabel("Rationale (both parties read this)").fill("Buyer photos show 71% battery health; listing claimed 89%. Partial refund for the battery.");
  await page.getByRole("button", { name: "Send decision" }).click();
  await expect(page.getByText("Partial refund of ₦100,000")).toBeVisible();

  await page.goto("/orders/WS-84291");
  await expect(page.getByText(/WorldStore’s decision.*Partial refund for the battery/)).toBeVisible();
});

test("ledger reversals over ₦100,000 need a second finance approver (R-260)", async ({ page }) => {
  await seed(page, "ngozi");
  await page.goto("/admin/ledger");
  await page.getByLabel("Filter by order number").fill("WS-84276");
  await page.getByRole("button", { name: /Reverse payment_captured of ₦128,500 on WS-84276/ }).click();
  const dialog = page.getByRole("dialog", { name: "Reverse this entry?" });
  await expect(dialog).toContainText("another finance colleague must approve");
  await dialog.getByLabel("Reason").fill("Provider settlement shows a duplicate capture.");
  await dialog.getByRole("button", { name: "Request reversal" }).click();
  const waiting = page.getByRole("region", { name: "Reversals waiting" });
  await expect(waiting).toContainText("needs a second approver");
  await waiting.getByRole("button", { name: "Approve" }).click();
  await expect(page.locator(".ws-sell-alert")).toContainText("need a second person");
  await switchTo(page, "Ifeanyi Obi");
  await waiting.getByRole("button", { name: "Approve" }).click();
  await expect(waiting).toHaveCount(0);
  await expect(page.getByRole("table")).toContainText("reversal:payment_captured");
  await page.goto("/admin/audit");
  await expect(page.getByRole("table")).toContainText(/Ifeanyi Obi · Finance\s*Approved reversal/);
  await expect(page.getByRole("table")).toContainText(/Ngozi Eze · Finance\s*Requested reversal/);
});

test("axe: staff console pages have no serious or critical violations", async ({ page }) => {
  test.setTimeout(120_000); // axe takes a few seconds per page
  await seed(page, "kemi");
  await page.goto("/admin");
  for (const [staff, urls] of [["Kemi Adeyemi", ["/admin", "/admin/moderation", "/admin/audit"]], ["Tunde Bakare", ["/admin/cases"]], ["Ngozi Eze", ["/admin/ledger", "/admin/risk"]], ["Amaka Okoro", ["/admin/support"]]] as const) {
    await switchTo(page, staff);
    for (const url of urls) {
      await page.goto(url);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${url} ${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
    }
  }
});
