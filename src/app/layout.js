import './globals.css';
import { ServiceWorkerRegistration } from '../components/sw-register';

export const metadata = {
  title: 'Solestride',
  description: 'Your running history, rebuilt as an RPG character codex.',
  manifest: '/manifest.json',
  themeColor: '#0e0c0a',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Solestride',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-[#0e0c0a]">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </head>
      <body className="min-h-screen min-h-dvh bg-[#0e0c0a] text-[#e8dcc8] antialiased">
        <ServiceWorkerRegistration />
        <main className="max-w-lg mx-auto relative">
          {children}
        </main>
      </body>
    </html>
  );
}
