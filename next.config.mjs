/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "",
  assetPrefix: "",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "51.112.24.26",
        port: "5001",
        pathname: "/uploads/participant/**",
      },
      {
        protocol: "http",
        hostname: "51.112.24.26",
        port: "5001",
        pathname: "/uploads/event/**",
      },
    ],
  },
};

export default nextConfig;
