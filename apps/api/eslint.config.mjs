import { nestJsConfig } from "@repo/eslint-config/nest-js";

const config = nestJsConfig.map((item) => {
  if (
    item &&
    typeof item === "object" &&
    "languageOptions" in item &&
    item.languageOptions
  ) {
    return {
      ...item,
      languageOptions: {
        ...item.languageOptions,
        parserOptions: {
          project: ["./tsconfig.json"],
          ...item.languageOptions.parserOptions,
          tsconfigRootDir: import.meta.dirname,
        },
      },
    };
  }

  return item;
});

export default config;
