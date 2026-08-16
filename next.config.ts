import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Keep client Router Cache from retaining stale RSC/action IDs across deploys.
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Quality 100 is allowed so Orbit can request original-faithful delivery
    // for hero and above-the-fold imagery via next/image quality={100}.
    qualities: [75, 85, 90, 95, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // HTML / RSC documents must not be cached across deploys (avoids stale
      // Server Action / flight IDs from Cloudflare or browser caches).
      {
        source:
          "/((?!_next/static|_next/image|media/|videos/|images/|favicon\\.ico|.*\\.(?:js|css|map|woff2?|png|jpe?g|webp|avif|svg|mp4|webm|ico)$).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Cloudflare-CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "Accept-Ranges", value: "bytes" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
