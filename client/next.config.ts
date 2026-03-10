import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zegtywcyzjhmkqjgdpca.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  // To silence the multiple lockfiles warning. 
  // Next.js 16 uses turbopack at the config root.
  // @ts-ignore - Temporary ignore if type is not updated yet
  turbopack: {
    root: "..",
  },
};

export default nextConfig;
// force rebuild timestamp Mon Jan 26 02:44:00 -03 2026
