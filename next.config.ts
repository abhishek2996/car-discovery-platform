import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use local temp dir for dev when set (avoids EBUSY/.smbdelete on SMB/network volumes)
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
