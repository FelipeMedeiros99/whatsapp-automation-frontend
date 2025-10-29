import type { Metadata } from "next";
import "../styles/index.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Automação whatsapp",
  description: "Bot para automatizar respostas no whatsapp",
  icons: {
    icon: "/images/icone-tema.png"
  },
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
