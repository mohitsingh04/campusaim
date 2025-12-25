// next.config.js
require("dotenv").config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // ✅ Dev: localhost backend
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/**",
      },

      // ✅ Prod: env-based media URL
      ...(process.env.NEXT_PUBLIC_MEDIA_URL
        ? [
            {
              protocol: new URL(process.env.NEXT_PUBLIC_MEDIA_URL).protocol.replace(":", ""),
              hostname: new URL(process.env.NEXT_PUBLIC_MEDIA_URL).hostname,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

module.exports = nextConfig;
