import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Checkout Seguro",
  description: "Finalize sua compra com segurança",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} font-sans antialiased`}>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
