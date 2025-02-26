/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',  // Allow all hostnames in development
      },
    ],
    unoptimized: true, // Optional: disable image optimization if you're having issues
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // Disable trace in development to avoid permission issues
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // Add this line to ignore ESLint errors during build
  }
};

module.exports = nextConfig;
