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
  // Alternatively, if you want to be more specific about allowed domains:
  // images: {
  //   domains: [
  //     'media-cldnry.s-nbcnews.com',
  //     'ichef.bbci.co.uk',
  //     'cdn.cnn.com',
  //     'static.foxnews.com',
  //     'media.npr.org',
  //     'assets.bwbx.io',
  //     'images.wsj.net',
  //     'nypost.com',
  //     'assets.reuters.com',
  //   ],
  // },
}

module.exports = nextConfig
