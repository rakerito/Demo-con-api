import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MXcomp – Asesor de compra",
  description:
    "Cuéntanos qué necesitas y encuentra opciones de tecnología ajustadas a tus prioridades.",
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
