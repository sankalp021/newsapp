/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Api-Key",
          },
          {
            key: "Content-Security-Policy",
            value: "connect-src 'self' https://api.newsdatahub.com https://generativelanguage.googleapis.com"
          }
        ],
      },
    ];
  },
  images: {
    domains: [
      'ichef.bbci.co.uk',
      'cdn.vox-cdn.com',
      'www.reuters.com',
      'static.foxnews.com',
      'www.aljazeera.com',
      'media.npr.org',
      'media.cnn.com',
      's.yimg.com',
      'assets.bwbx.io',
      'c.ndtvimg.com',
      'www.washingtonpost.com',
      'www.ft.com',
      'nypost.com',
      'assets2.cbsnewsstatic.com',
      'images.wsj.net',
      'assets1.cbsnewsstatic.com',
      'static01.nyt.com',
      'si.wsj.net',
      'www.adnkronos.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
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
