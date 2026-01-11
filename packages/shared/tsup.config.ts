import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: "src/index.ts",
    auth: "src/auth/index.ts",
    utils: "src/utils/index.ts",
    config: "src/config/index.ts",
  },
  format: ["cjs", "esm"],
  sourcemap: true,
});
