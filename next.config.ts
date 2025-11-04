import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: [
      "https://9000-firebase-studio-1748673432455.cluster-44kx2eiocbhe2tyk3zoyo3ryuo.cloudworkstations.dev",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "d1dmb2897axey0.cloudfront.net", // AWS CloudFront domain
      // add other AWS S3 or CloudFront domains here if needed
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1dmb2897axey0.cloudfront.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      // remove localhost patterns if not needed anymore
      // add more patterns for other AWS image URLs if required
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
