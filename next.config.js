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
  },
  async headers() {
    return [
      {
        // Allow CORS for API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://bytenewz.vercel.app" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          has: [
            {
              type: 'header',
              key: 'origin',
              value: '(?<origin>.*)',
            },
          ],
          destination: '/api/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;
