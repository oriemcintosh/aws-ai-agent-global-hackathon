import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Academia Agent",
  description: "Academia Agent: Your AI-powered academic pathway assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-purple">
      <head>
        {/* PNG favicons for compatibility */}
  <link rel="icon" href="/favicon-book-16.png" sizes="16x16" />
  <link rel="icon" href="/favicon-book-32.png" sizes="32x32" />
  <link rel="icon" href="/favicon-book-48.png" sizes="48x48" />
  <link rel="apple-touch-icon" href="/favicon-book-180.png" sizes="180x180" />
  <link rel="shortcut icon" href="/favicon-book-32.png" />
        <meta name="theme-color" content="#0b1020" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
