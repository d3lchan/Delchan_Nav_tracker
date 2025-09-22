import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";

// Temporarily disable Google Fonts due to network issues
// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
//   display: 'swap',
// });

export const metadata: Metadata = {
  title: "Gym Progress Tracker - Nav & Delchan",
  description: "Premium fitness progress tracking for Nav and Delchan with detailed analytics and beautiful visualizations.",
  keywords: ['fitness', 'gym', 'progress tracking', 'analytics', 'workout'],
  authors: [{ name: 'Gym Tracker Team' }],
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gym Tracker',
  },
  openGraph: {
    title: 'Gym Progress Tracker',
    description: 'Track your fitness journey with precision and style',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Gym Tracker" />
      </head>
      <body className="font-sans antialiased h-full overflow-x-hidden">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
          {children}
        </div>
      </body>
    </html>
  );
}
