import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: "src/index.ts",
    "record-layouts": "src/record-layouts/index.ts",
    "custom-fields": "src/custom-fields/index.ts",
    entities: "src/entities/index.ts",
    "payment-plans": "src/payment-plans/index.ts",
  },
  format: ["esm"],
  sourcemap: true,
});
