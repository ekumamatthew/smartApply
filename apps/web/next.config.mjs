/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  async rewrites() {
    const backendBase =
      (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(
        /\/+$/,
        ""
      )

    return [
      {
        source: "/api/proxy/:path*",
        destination: `${backendBase}/:path*`,
      },
    ]
  },
}

export default nextConfig
