/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: "/playground", destination: "/lab", permanent: true }];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
