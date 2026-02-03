import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RealtimeListener } from "@/components/RealtimeListener";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Manejate - Presupuesto Colaborativo",
  description: "Tu app de presupuesto colaborativo offline-first.",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Manejate",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RealtimeListener />
        {children}
      </body>
    </html>
  );
}
