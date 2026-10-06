import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// The built app serves the home page with no serious or critical axe violations.
test("home page renders and passes axe", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "WorldStreet Marketplace" })).toBeVisible();

  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});
