
/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  webpack(config, { dev }) {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
