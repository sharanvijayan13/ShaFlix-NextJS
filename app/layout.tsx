import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MovieProvider } from "@/app/contexts/MovieContext";
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", 
});

export const metadata: Metadata = {
  title: "Shaflix",
  description: "Mood-based Movie Recommender",
  icons:{
    icon: ['/favicon.ico', '/favicon-32x32.png', '/favicon-16x16.png'],
    apple: ['/apple-touch-icon.png'],
    shortcut:['/favicon.ico']
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster position="bottom-center" />
        <MovieProvider>
          {children}
        </MovieProvider>
      </body>
    </html>
  );
}
