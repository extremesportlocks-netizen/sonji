/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for multi-tenant subdomain routing
  experimental: {
    // serverActions are stable in Next 14
  },
};

module.exports = nextConfig;
