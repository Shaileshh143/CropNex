/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  images: {
    domains: ['images.unsplash.com', 'lh3.googleusercontent.com'],
  },
  webpack: (config) => {
    config.resolve.symlinks = false;
    config.cache = false;
    return config;
  },
};

export default nextConfig;
