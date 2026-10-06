import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

// Playwright has no Chromium build for macOS 13, so local runs drive the installed
// Chrome; CI (Linux) uses Playwright's own Chromium.
const launchOptions = process.env.CI ? {} : { channel: "chrome" };

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    passWithNoTests: true,
    projects: [
      {
        plugins: [react()],
        resolve: { alias: { "@": path.resolve(__dirname) } },
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["**/*.test.{ts,tsx}"],
          exclude: ["node_modules/**", "e2e/**", ".next/**"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        plugins: [storybookTest({ configDir: path.join(__dirname, ".storybook") })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ launchOptions }),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
