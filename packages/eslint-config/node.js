// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { config as baseConfig } from "./base.js";

export const nodeJsConfig = [
  ...baseConfig,
  ...tseslint.config(
    {
      ignores: ["**/*.js"],
    },
    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
        },
      },
    },
  ),
];
