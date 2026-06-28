/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use CRA-style URL imports for images instead of next/image static analysis.
  images: {
    disableStaticImages: true,
  },
  webpack: (config) => {
    config.module.rules.push(
      {
        test: /\.(png|jpe?g|gif|webp|svg|ico|bmp)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(mp3|wav|ogg|mpe?g|mp4|webm)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(glb|gltf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(obj|mtl)$/i,
        type: 'asset/resource',
      }
    );
    return config;
  },
};

export default nextConfig;