import type { Preview } from "@storybook/nextjs-vite";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
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

const preview: Preview = {
  parameters: {
    layout: "padded",
    viewport: { options: viewports },
    // Serious and critical axe violations fail the story test, not just warn.
    a11y: { test: "error" },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { dark: "dark", light: "light" },
      defaultTheme: "dark",
      attributeName: "data-theme",
      parentSelector: "html",
    }),
  ],
};

export default preview;
