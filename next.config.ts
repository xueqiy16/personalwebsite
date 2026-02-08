import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better dev warnings
  reactStrictMode: true,

  // Optimise image loading (if <Image> is ever used)
  images: {
    unoptimized: true, // static export friendly
  },
};

export default nextConfig;
