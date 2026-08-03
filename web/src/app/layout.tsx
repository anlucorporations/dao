import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cooperativa Los Cappones",
  description: "Administración transparente de propuestas y aportes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
