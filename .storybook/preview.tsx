import type { Preview } from "@storybook/nextjs-vite";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { MotionGlobalConfig } from "motion/react";
import { MotionProvider } from "../components/motion/MotionProvider";
import { fontVariables } from "../app/fonts";
import "../app/globals.css";

// The three widths every component is reviewed at (PLAN §3).
const viewports = {
  mobile: { name: "Mobile 375", styles: { width: "375px", height: "812px" } },
  tablet: { name: "Tablet 768", styles: { width: "768px", height: "1024px" } },
  desktop: { name: "Desktop 1280", styles: { width: "1280px", height: "800px" } },
};

// Same attributes as app/layout.tsx: theme on <html>, brand on <body> (the DS light
// selector needs the brand inside the theme).
document.documentElement.classList.add(...fontVariables.split(" "));
document.body.classList.add("cx-root");
document.body.dataset.brand = "worldstreet";

// Story tests (a driven browser) settle every animation at once, so axe and focus
// checks see the end state rather than a half-faded frame.
if (navigator.webdriver) {
  MotionGlobalConfig.skipAnimations = true;
  const style = document.createElement("style");
  style.textContent = "*, *::before, *::after { transition: none !important; animation: none !important; }";
  document.head.append(style);
}

const preview: Preview = {
  parameters: {
    // App Router mocks for next/navigation (useRouter in cards and search).
    nextjs: { appDirectory: true },
    layout: "padded",
    viewport: { options: viewports },
    // Serious and critical axe violations fail the story test, not just warn.
    a11y: { test: "error" },
  },
  // Motion's features load lazily; under a busy test run that can take over a second,
  // and exit animations (hide → Undo) wait for them. Load them before any story renders.
  loaders: [() => import("../components/motion/features")],
  decorators: [
    (Story) => (
      <MotionProvider>
        <Story />
      </MotionProvider>
    ),
    withThemeByDataAttribute({
      themes: { dark: "dark", light: "light" },
      defaultTheme: "dark",
      attributeName: "data-theme",
      parentSelector: "html",
    }),
  ],
};

export default preview;
