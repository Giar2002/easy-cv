import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "EasY CV — Bikin CV ATS Friendly Cepat & Profesional",
  description: "Buat CV profesional bahasa Indonesia & Inggris secara gratis. Mudah 'Isi CV'-mu dengan preview real-time, AI Asisten, dan ATS mode.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>
        <Toaster position="bottom-right" />
        {children}
      </body>
    </html>
  );
}
