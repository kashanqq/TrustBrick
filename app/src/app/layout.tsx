import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { LanguageProvider } from "@/components/LanguageContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "TrustBrick | The Archive",
  description: "Institutional-grade asset tokenization for the sovereign era",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-body selection:bg-primary/30">
        <Providers>
          <LanguageProvider>
            <Sidebar />
            <Navbar />
            <main className="ml-64 pt-20 min-h-screen">{children}</main>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
