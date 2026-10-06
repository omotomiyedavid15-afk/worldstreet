import { defineConfig, devices } from "@playwright/test";

const local = !process.env.CI;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: local ? 0 : 1,
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
    // See vitest.config.ts: installed Chrome locally, bundled Chromium in CI, or a
    // preinstalled browser via PW_CHROMIUM_PATH (cloud containers).
    ...(process.env.PW_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH } }
      : local ? { channel: "chrome" } : {}),
  },
  projects: [
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 }, hasTouch: true } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    // The common Nigerian phone class (GSMA 2024): small Android, DPR 2, touch.
    {
      name: "android-360",
      use: { ...devices["Galaxy S9+"], viewport: { width: 360, height: 760 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    },
  ],
  webServer: {
    command: "npm run build && npx next start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: local,
    timeout: 240_000,
  },
});
