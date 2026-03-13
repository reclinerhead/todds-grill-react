import type { Metadata } from "next";
//import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

// Primary font - for body text
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // only what you need
  variable: "--font-inter", // for Tailwind CSS var
  display: "swap", // prevents invisible text
});

export const metadata: Metadata = {
  title: "Todd's Grill and Bait",
  description: "Kalamazoo's best grilled food and fresh bait!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans antialiased`}>
      <body>
        {children}
        <Toaster position="top-right" richColors theme="system" />
      </body>
    </html>
  );
}
