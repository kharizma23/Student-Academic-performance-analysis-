import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"; // Using Inter for a professional, clean sans-serif look globally
import { cn } from "@/lib/utils";
import "./globals.css";
import { GlobalWidget } from "@/components/global-widget";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Student Academic Development Platform",
  description: "AI-Powered Academic Intelligence System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen text-foreground font-sans antialiased",
          fontSans.variable
        )}
      >
        {children}
        <GlobalWidget />
      </body>
    </html>
  );
}
