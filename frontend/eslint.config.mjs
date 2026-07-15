import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    settings: {
      "import/resolver": {
        typescript: true,
      },
    },
    rules: {
      // Engineering Rule (architecture §14): never use `any` unless interfacing
      // with a genuinely untyped external value — narrow it immediately.
      "@typescript-eslint/no-explicit-any": "error",
      // Consistent import order (Sprint 1.1 requirement): builtins/external first,
      // then internal (@/...), then relative, alphabetized within each group.
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [{ pattern: "@/**", group: "internal", position: "before" }],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-unresolved": "off", // handled by TypeScript itself
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
