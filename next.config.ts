import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow accessing local dev server from LAN devices.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.1.7",
    "192.168.1.8",
    "192.168.1.9",
  ],
};

export default nextConfig;
