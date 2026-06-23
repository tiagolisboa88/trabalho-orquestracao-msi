"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  FileSpreadsheet,
  Gauge,
  Hammer,
  Library,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/propostas/nova", label: "Nova Proposta", icon: Plus },
  { href: "/propostas", label: "Histórico", icon: FileSpreadsheet },
  { href: "/admin/funcoes", label: "Banco de Funções", icon: Hammer },
  { href: "/admin/clausulas", label: "Cláusulas Padrão", icon: Library },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-msi-ink text-white">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary font-display font-bold">M</div>
          <div className="leading-tight">
            <div className="text-xs uppercase tracking-widest text-white/60">MSI Engenharia</div>
            <div className="font-display text-lg">SmartBid AI</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/20 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-white/10 text-xs text-white/60">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5" /> CrewAI local
        </div>
        <div className="mt-1">Polling a cada 2,5s</div>
      </div>
    </aside>
  );
}
