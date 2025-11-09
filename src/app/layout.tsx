import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProvider } from "@/providers/client-provider";
import { Activity, BarChart3, Download, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poupe seu tempo, faça sua ficha pelo celular",
  description: "Aplicativo Smart Triagem",
  openGraph: {
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`,
        alt: "Preview elegante do aplicativo Smart Triagem",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProvider>
          <div className="flex">
            <aside className="w-64 border-r border-border bg-sidebar min-h-[calc(100vh-4rem)]">
              <nav className="p-4 space-y-2">
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Link href="/">
                    <Users className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Link href="/reports">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Relatórios
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/patients">
                    <Heart className="h-4 w-4 mr-2" />
                    Pacientes
                  </Link>
                </Button>
              </nav>
            </aside>

            <div className="w-full">
              <header className="border-b border-border bg-card">
                <div className="flex h-16 items-center justify-between px-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-8 w-8 text-accent" />
                      <h1 className="text-xl font-semibold text-foreground">
                        Painel Médico
                      </h1>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        DR
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </header>

              <div className="min-h-screen bg-background">
                <div className="flex">
                  <main className="flex-1 p-6">{children}</main>
                </div>
              </div>
            </div>
          </div>
        </ClientProvider>
      </body>
    </html>
  );
}
