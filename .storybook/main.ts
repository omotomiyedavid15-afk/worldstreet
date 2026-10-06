import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.tsx", "../features/**/*.stories.tsx"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-themes", "@storybook/addon-vitest", "storybook-addon-pseudo-states"],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
};

export default config;
