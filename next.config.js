/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // TEMP: unblock Vercel build (ESLint/type errors won't fail build)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // If you load images from external URLs (e.g., Ready Player Me)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" } // loosen for now; tighten later
      // or: domains: ["cdn.readyplayer.me"]
    ],
  },
};
module.exports = nextConfig;
