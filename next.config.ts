import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Type checking runs in `npm run lint`/build; ESLint is not used in this project.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
