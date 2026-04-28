import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { config as baseConfig } from "./base.js";

/**
 * ESLint configuration for NestJS applications.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nestJsConfig = tseslint.config(
  baseConfig,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: "commonjs",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
  {
    ignores: ["dist/**", "eslint.config.mjs"],
  },
);
