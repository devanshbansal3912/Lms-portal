
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
