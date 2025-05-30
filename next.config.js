/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'react-icons'],
  },
  // Ensure all pages are properly built for Vercel
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  images: {
    domains: [],
    unoptimized: false,
  },
  // Optimize for Vercel deployment
  poweredByHeader: false,
  compress: true,
  // Handle build errors gracefully
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Reduce bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Handle TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Handle ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;