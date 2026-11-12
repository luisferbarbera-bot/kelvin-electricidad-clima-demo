import type { Metadata, Viewport } from "next";
import "../styles.css";

const description = "Kelvin: electricidad y climatización con licencia en Midland–Odessa. Diagnóstico, presupuesto por escrito y garantía. Concepto demo.";

export const metadata: Metadata = {
  title: "Kelvin Electricidad y Clima",
  description,
  openGraph: { title: "Kelvin · Energía precisa. Aire perfecto.", description, type: "website" },
};
export const viewport: Viewport = { themeColor: "#0b1424", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400..700&family=Geist+Mono:wght@400..600&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
