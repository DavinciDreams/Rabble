// client/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore the server folder during build
  pageExtensions: ['jsx', 'js'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignore the server folder in client-side builds
      config.resolve.alias['../server'] = false;
      config.resolve.alias['../../server'] = false;
    }
    return config;
  },
};

module.exports = nextConfig;