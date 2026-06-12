import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { currentPlayer } from "@/lib/session";
import { logout } from "./actions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bolão Copa GPAA",
  description: "Bolão da Copa do Mundo 2026 do escritório",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const player = await currentPlayer();
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-emerald-950 text-emerald-50">
        <header className="bg-emerald-900/80 border-b border-emerald-800 sticky top-0 z-10 backdrop-blur">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <Link href={player ? "/jogos" : "/"} className="font-bold text-lg whitespace-nowrap">
              ⚽ Bolão GPAA
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              {player && (
                <>
                  <Link href="/jogos" className="hover:text-amber-300">Jogos</Link>
                  <Link href="/ranking" className="hover:text-amber-300">Ranking</Link>
                  <form action={logout}>
                    <button className="text-emerald-300 hover:text-amber-300 cursor-pointer">
                      Sair ({player.name})
                    </button>
                  </form>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">{children}</main>
        <footer className="text-center text-xs text-emerald-400/60 py-4">
          Copa do Mundo 2026 · Bolão do escritório GPAA
        </footer>
      </body>
    </html>
  );
}
