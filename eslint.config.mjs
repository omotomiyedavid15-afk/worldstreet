import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import storybook from "eslint-plugin-storybook";

// Atlas ships as one 3 MB module; icons come from the generated subset instead.
const atlasBan = { name: "@vectoricons/atlas-icons-react", message: "Import icons from @/components/icons (run npm run icons)." };
// Mock data reaches the app only through lib/data (swap the adapter there).
const mockBan = { group: ["@/mocks", "@/mocks/*", "**/mocks", "**/mocks/*"], message: "Read data through @/lib/data, not mocks/." };

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...storybook.configs["flat/recommended"],
  {
    files: ["app/**", "components/**", "features/**", "lib/**"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [atlasBan],
        patterns: [mockBan],
      }],
    },
  },
  {
    // The one file that picks the data adapter (PLAN §2.2).
    files: ["lib/data/index.ts"],
    rules: { "no-restricted-imports": ["error", { paths: [atlasBan] }] },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "storybook-static/**", "!.storybook"]),
]);

export default eslintConfig;
