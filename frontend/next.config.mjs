let userConfig = undefined;
try {
  userConfig = await import("./v0-user-next.config");
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix workspace root warning by explicitly setting the output file tracing root
  outputFileTracingRoot: process.cwd(),
  // Fix React Server Components bundler errors
  serverExternalPackages: [],
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  // Disable source maps in development to avoid bundler issues
  productionBrowserSourceMaps: false,
  async rewrites() {
    // Default to production backend URL
    const defaultApiUrl = "https://rai-compliance-backend.onrender.com";

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;

    return [
      {
        source: "/api/:path*",
        destination: apiUrl ? `${apiUrl}/api/:path*` : "/api/:path*",
      },
    ];
  },
};

mergeConfig(nextConfig, userConfig);

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return;
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === "object" &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      };
    } else {
      nextConfig[key] = userConfig[key];
    }
  }
}

export default nextConfig;
