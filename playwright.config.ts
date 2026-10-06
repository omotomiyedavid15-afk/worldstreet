import { defineConfig, devices } from "@playwright/test";

const local = !process.env.CI;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: local ? 0 : 1,
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
    // See vitest.config.ts: installed Chrome locally, bundled Chromium in CI.
    ...(local ? { channel: "chrome" } : {}),
  },
  projects: [
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 }, hasTouch: true } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: "npm run build && npx next start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: local,
    timeout: 240_000,
  },
});
