import MiniCssExtractPlugin from "mini-css-extract-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
	typescript: {
		// !! WARN !!
		// Dangerously allow production builds to successfully complete even if
		// your project has type errors.
		// !! WARN !!
		ignoreBuildErrors: true,
	},
	webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
		// Add MiniCssExtractPlugin to the plugins array
		// config.plugins.push(new MiniCssExtractPlugin());

		// Important: return the modified config
		return config;
	},
};

export default nextConfig;
