/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
  env: {
    NEXT_PUBLIC_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_SHA || ''
  },
  async headers() {
    return [
      {
        source: '/logo-clara.svg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }
        ]
      },
      {
        source: '/logo-escura.svg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }
        ]
      }
    ];
  }
};

export default nextConfig;
