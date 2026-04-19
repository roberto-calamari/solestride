/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/skills', destination: '/dashboard', permanent: false },
      { source: '/skills/:id', destination: '/dashboard', permanent: false },
      { source: '/runs', destination: '/dashboard', permanent: false },
      { source: '/settings', destination: '/dashboard', permanent: false },
      { source: '/share', destination: '/dashboard', permanent: false },
      { source: '/build/history', destination: '/dashboard', permanent: false },
    ];
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    }];
  },
};

module.exports = nextConfig;
