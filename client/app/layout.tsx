import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-numbers",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashformance",
  description: "High-performance Lead Management",
};

import { AuthProvider } from "@/context/auth-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} antialiased bg-[#050505] text-white`}
      >
        <AuthProvider>
          {children}
          <Toaster position="top-right" theme="dark" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
