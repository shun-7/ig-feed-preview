import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — pure client-side app, deployable to any static host
  // (Cloudflare Pages / Vercel / etc.) with no serverless runtime.
  output: "export",
  // Disable Image Optimization API (not available in static export).
  images: { unoptimized: true },
};

export default nextConfig;
