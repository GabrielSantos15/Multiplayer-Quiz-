import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SocketProvider from "@/providers/SocketProvider";
import { SoundProvider } from "@/providers/SoundProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atlas Arena",
  description: "Teste seus conhecimentos de geografia contra outros jogadores em tempo real.",
  openGraph: {
    title: "Atlas Arena | Quiz Multiplayer",
    description: "Um quiz interativo sobre bandeiras, capitais e mapas do mundo. Jogue agora!",
    type: "website",
    locale: "pt_BR",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SocketProvider>
          <SoundProvider>
            <main className=" ">
              {children}
            </main>
          </SoundProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
