/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  // Removed output: 'export' so Route Handlers / API routes can run
  basePath: isProd ? "/my-portfolio" : "",
  assetPrefix: isProd ? "/my-portfolio/" : "",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.glsl$/,
      use: "raw-loader",
    });
    return config;
  },
};

export default nextConfig;