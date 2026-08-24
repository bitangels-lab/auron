/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@auron/config", "@auron/sdk"],
  webpack: (config) => {
    // Guard against optional Coinbase x402 deps pulled by unused wagmi connectors.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@x402/evm": false,
      "@x402/evm/upto/client": false,
    };
    return config;
  },
};

module.exports = nextConfig;
