/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'react-icons'],
  },
  images: {
    domains: [],
    unoptimized: false,
  },
  // Optimize for Vercel deployment
  poweredByHeader: false,
  compress: true,
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
};

module.exports = nextConfig;