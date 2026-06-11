import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArthSaathi Demo",
  description:
    "A guided demo of ArthSaathi, a WhatsApp-first financial guidance assistant for India."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
