import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import Header from "@/components/Header";
import "../styles/index.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

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
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      {/* <Header /> */}
      {/* <body className={`${geistSans.variable} ${geistMono.variable}`}> */}
      <body>
        {children}
      </body>
    </html>
  );
}
