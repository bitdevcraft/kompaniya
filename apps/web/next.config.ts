import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  transpilePackages: [
    "@kompaniya/ui-common",
    "@kompaniya/ui-data-table",
    "@kompaniya/ui-mjml-editor",
    "@kompaniya/ui-email-editor",
    "@kompaniya/ui-monaco-editor",
  ],
  async redirects() {
    return [
      {
        source: "/crm/:path*",
        destination: "/record/:path*",
        permanent: true,
      },
      {
        source: "/marketing/:path*",
        destination: "/record/:path*",
        permanent: true,
      },
      {
        source: "/real-estate/:path*",
        destination: "/record/:path*",
        permanent: true,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
