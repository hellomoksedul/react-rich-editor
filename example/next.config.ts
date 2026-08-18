import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hellokit/react-rich-editor"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@hellokit/react-rich-editor/index.css": require("path").resolve(
        __dirname,
        "../src/index.css",
      ),
      "@hellokit/react-rich-editor": require("path").resolve(
        __dirname,
        "../src/index.ts",
      ),
    };
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        "@hellokit/react-rich-editor/index.css": "../src/index.css",
        "@hellokit/react-rich-editor": "../src/index.ts",
      },
    },
  },
};

export default nextConfig;
