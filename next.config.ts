import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Reduce hydration warnings in development
  experimental: {
    optimizePackageImports: ['aos'],
  },
  // Enable static optimization
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
