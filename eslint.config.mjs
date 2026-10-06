import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import storybook from "eslint-plugin-storybook";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...storybook.configs["flat/recommended"],
  {
    // Atlas ships as one 3 MB module; icons come from the generated subset instead.
    files: ["app/**", "components/**", "features/**", "lib/**"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{ name: "@vectoricons/atlas-icons-react", message: "Import icons from @/components/icons (run npm run icons)." }],
      }],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "storybook-static/**", "!.storybook"]),
]);

export default eslintConfig;
