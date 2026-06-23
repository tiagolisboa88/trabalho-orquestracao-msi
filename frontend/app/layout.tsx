import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { StoreBootstrap } from "@/components/store-bootstrap";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "MSI SmartBid AI",
  description: "Plataforma multiagente de orçamentação MSI Engenharia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${display.variable}`}>
      <body>
        <StoreBootstrap />
        <div className="flex min-h-screen">
          <AppSidebar />
          <main className="flex-1 bg-msi-slate/40">{children}</main>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
