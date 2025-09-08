import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add MiniCssExtractPlugin to the plugins array
    config.plugins.push(new MiniCssExtractPlugin());

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
