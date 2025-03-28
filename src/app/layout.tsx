import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import NavbarWrapper from "@/components/NavbarWrapper";
import Script from "next/script";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800']
});


export const viewport = {
  themeColor: "#6366f1",
};

export const metadata: Metadata = {
  title: "Genify",
  description: "Make your AI writing sound human again. The trusted tool for students across the UK.",
  keywords: "AI writing, humanize text, Turnitin bypass, academic writing, essay help",
  authors: [{ name: "Genify Team" }],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} light`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} antialiased bg-white text-foreground`}>
        <AuthProvider>
          <NavbarWrapper>
            <Navbar />
          </NavbarWrapper>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
