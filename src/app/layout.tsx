import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pantry Chef",
  description: "Find and share recipes based on your ingredients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Navbar />
        <main>{children}</main>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
