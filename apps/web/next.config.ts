import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    "@kompaniya/ui-common",
    "@kompaniya/ui-data-table",
    "@kompaniya/ui-mjml-editor",
    "@kompaniya/ui-email-editor",
    "@kompaniya/ui-monaco-editor",
  ],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
