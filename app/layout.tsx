import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { Toaster } from "sonner";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zona Konsumsi CMS",
  description: "Content Management System untuk kebutuhan manajemen konsumsi internal kantor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          {children}
          <Toaster />
          <PerformanceMonitor />
        </NextAuthProvider>
      </body>
    </html>
  );
}
