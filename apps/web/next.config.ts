import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    "@repo/shared-ui",
    "@kompaniya/ui-common",
    "@kompaniya/ui-data-table",
    "@kompaniya/ui-monaco-editor",
  ],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
