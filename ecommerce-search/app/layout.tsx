import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MXcomp – Buscador Inteligente",
  description:
    "Encuentra el mejor precio en electrónica y tecnología. Comparamos cientos de proveedores para darte la oferta perfecta.",
  keywords: "tienda online, electrónica, tecnología, mejores precios, comprar",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
