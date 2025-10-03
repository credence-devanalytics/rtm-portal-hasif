/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Ignore TypeScript and ESLint errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Continue on build errors
    config.bail = false;

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
