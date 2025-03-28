/** @type {import('next').NextConfig} */
const nextConfig = {
  // TODO: Remove ignoreBuildErrors and fix Promise<> type issues and others. e.g: 
  // https://nextjs.org/docs/app/building-your-application/upgrading/version-15#params--searchparams
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  // Configure specific modules to not be used in the Edge Runtime
  // This prevents Next.js from trying to use Node.js modules in Edge middleware
  experimental: {
    serverExternalPackages: [
      'mongoose',
      'bcryptjs',
      'jsonwebtoken',
      'stripe',
      'nodemailer'
    ],
  },
  // Enable standalone output mode for containerized deployments
  output: 'standalone',
};

module.exports = nextConfig; 