const nextConfig: import("next").NextConfig = {
  transpilePackages: ["@hellokit/react-rich-editor"],
  // image allow all domain
  images: {
    domains: ["*"],
  },
};

export default nextConfig;
