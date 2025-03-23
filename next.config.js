/** @type {import('next').NextConfig} */
const nextConfig = {
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