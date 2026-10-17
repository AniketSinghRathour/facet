import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Cloudflare R2 presigned preview URLs (grabpic-previews bucket)
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        // AWS S3 original photo URLs (mine-pic-app-storage bucket, ap-south-1)
        protocol: "https",
        hostname: "**.s3.amazonaws.com",
      },
      {
        // AWS S3 path-style URLs
        protocol: "https",
        hostname: "s3.*.amazonaws.com",
      },
    ],
  },
  async rewrites() {
    const backendOrigin =
      process.env.BETTER_AUTH_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
      "http://localhost:8080";

    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
