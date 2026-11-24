import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import js from "@eslint/js";
import next from "@next/eslint-plugin-next";
import eslintReact from "@eslint-react/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const reactConfig = eslintReact.configs["recommended-typescript"];

export default tseslint.config(
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/coverage/**", "**/*.tsbuildinfo"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: config.files ?? ["**/*.{ts,tsx,mts,cts}"],
  })),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: repoRoot,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    ...reactConfig,
    plugins: {
      ...reactConfig.plugins,
      "@next/next": next,
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactConfig.rules,
      ...reactHooks.configs.flat.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
    },
  },
);
