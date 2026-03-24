import AppProvider from "@/components/providers/app-provider";
import type { Metadata } from "next";
import { Assistant, Geist, Outfit } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outlines",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eduvia",
  description: "The Path of Education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
