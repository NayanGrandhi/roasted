import type { Metadata, Viewport } from "next";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/inter/index.css";
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Roasted — Get absolutely cooked by AI",
    template: "%s · Roasted",
  },
  description:
    "Drop your resume, code, GitHub, music taste, outfit or startup idea and get a savage AI roast, then real advice to fix it. Free, no login.",
  openGraph: {
    title: "Roasted — Get absolutely cooked by AI",
    description: "Savage AI roasts of your resume, code, GitHub, music, outfit and more. Plus real advice.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0e0c0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="relative flex min-h-dvh flex-col overflow-x-hidden">
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "#1e1a17",
              border: "1px solid #3a322c",
              color: "#f5ede3",
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
