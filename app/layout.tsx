import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Semestr — Academic OS & Daily Companion",
  description: "Platform akademik personal berstandar commercial CMS & mobile app untuk mahasiswa Teknik Informatika Telkom University Purwokerto.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Semestr",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#007AFF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-ios-bg text-ios-textPrimary min-h-screen antialiased selection:bg-ios-accent/20">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
