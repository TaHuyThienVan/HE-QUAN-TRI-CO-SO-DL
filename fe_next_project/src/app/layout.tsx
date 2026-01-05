import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/app/components/ChatWidget"; // ✅ đúng đường dẫn hiện tại

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MathBridge",
  description: "Comprehensive Management System for Math Tutoring",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-neutral-950 text-neutral-100`}
      >
        {children}
        <ChatWidget
          schoolName="MathBridge"
          hotline="0901 234 567"
          email="support@mathbridge.io"
          primaryColor="bg-blue-600"
        />
      </body>
    </html>
  );
}
