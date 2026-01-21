// next.config.js
require("dotenv").config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...(process.env.NEXT_PUBLIC_MEDIA_URL
        ? [
            {
              protocol: new URL(
                process.env.NEXT_PUBLIC_MEDIA_URL
              ).protocol.replace(":", ""),
              hostname: new URL(process.env.NEXT_PUBLIC_MEDIA_URL).hostname,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

module.exports = nextConfig;
