import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.openai.com",
        pathname: "/**",
      },
      // image.pollinations.ai는 <img> 태그로 직접 로드하므로 remotePatterns 불필요
    ],
  },
};

export default nextConfig;
