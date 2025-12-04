/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@prisma/client'],
  env: {
    NEXT_PUBLIC_COMMIT_SHA: process.env.COMMIT_SHA || ''
  },
  async redirects() {
    return [
      {
        source: '/servicos/governanca-administrativa',
        destination: '/servicos/governanca-seguranca-publica',
        permanent: true,
      },
    ];
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
