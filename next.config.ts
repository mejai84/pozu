import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vvlowhdimjjmsrpovurw.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Exclude the locked/empty burger-landing folder from build scanning
  outputFileTracingExcludes: {
    '*': ['./src/app/burger-landing/**'],
  },
};

export default nextConfig;
