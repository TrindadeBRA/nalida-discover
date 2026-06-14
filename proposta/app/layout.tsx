import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nalida MVP — Proposta de Escopo",
  description: "Visualização interativa do escopo e estimativa do MVP da Nalida.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
