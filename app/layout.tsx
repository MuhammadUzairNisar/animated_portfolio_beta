import type { Metadata, Viewport } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const title = "Muhammad Uzair Nisar — Technical Team Lead";
const description =
  "Senior software engineer with 5+ years architecting full-stack enterprise systems — ERP, LMS, SIMS — across React, Next.js, Node.js, Python and .NET.";

export const metadata: Metadata = {
  metadataBase: new URL("https://uzairnisar.site"),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Muhammad Uzair Nisar",
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${spaceGrotesk.variable}`}>
      {/* Browser extensions write attributes onto <body> before React hydrates. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
