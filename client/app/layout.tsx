import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { GlobalWidget } from "@/components/global-widget";

const fontSans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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
