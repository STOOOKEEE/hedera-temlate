import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@saucerpay/checkout"],
  poweredByHeader: false,
  agentRules: false,
};
export default config;
