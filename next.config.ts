import "./env/client";
import "./env/server";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  serverExternalPackages: [
    "@react-email/components",
    "@react-email/render",
    "react-email",
  ],
};

export default nextConfig;
