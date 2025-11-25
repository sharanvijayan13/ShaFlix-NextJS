import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MovieProvider } from "@/app/contexts/MovieContext";
import { Toaster } from '@/components/ui/sonner';
import ThemeProvider from "@/app/components/ThemeProvider";

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
    icon: ['/360_F_95612558_2HHziBV6o5Ti8ZrjDHeapKPj3HbPKQoD.jpg'],
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <Toaster position="bottom-center" />
          <MovieProvider>
            {children}
          </MovieProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
