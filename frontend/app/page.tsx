"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Activity,
  AlarmClock,
  AlertTriangle,
  BadgeCheck,
  CircleDollarSign,
  ClipboardList,
  PieChart,
  Plus,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProposalStatusBadge } from "@/components/proposal-status-badge";
import { HealthBanner } from "@/components/health-banner";
import { useStore } from "@/lib/store";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";

export default function DashboardPage() {
  const proposals = useStore((s) => s.proposals);

  const kpis = useMemo(() => {
    const total = proposals.length;
    const aprovadas = proposals.filter((p) => p.status === "Aprovada").length;
    const enviadas = proposals.filter((p) => p.status === "Enviada").length;
    const emAnalise = proposals.filter((p) => p.status === "Em análise").length;
    const aguardando = proposals.filter((p) => p.status === "Aguardando revisão").length;
    const volume = proposals.reduce((acc, p) => acc + (p.budget?.total ?? 0), 0);
    const ticketMedio = total ? volume / total : 0;
    const riscosAltos = proposals.reduce(
      (acc, p) => acc + (p.risks?.filter((r) => r.severidade === "alto").length ?? 0),
      0
    );
    return { total, aprovadas, enviadas, emAnalise, aguardando, volume, ticketMedio, riscosAltos };
  }, [proposals]);

  const tiles = [
    { label: "Propostas no portfólio", value: kpis.total, icon: ClipboardList },
    { label: "Aprovadas", value: kpis.aprovadas, icon: BadgeCheck },
    { label: "Em análise", value: kpis.emAnalise, icon: Activity },
    { label: "Aguardando revisão", value: kpis.aguardando, icon: AlarmClock },
    { label: "Enviadas ao cliente", value: kpis.enviadas, icon: Sparkles },
    { label: "Riscos altos", value: kpis.riscosAltos, icon: AlertTriangle },
    { label: "Volume estimado", value: formatCurrencyBRL(kpis.volume), icon: CircleDollarSign },
    { label: "Ticket médio", value: formatCurrencyBRL(kpis.ticketMedio), icon: PieChart },
  ];

  const recent = [...proposals]
    .sort((a, b) => (a.dataAbertura < b.dataAbertura ? 1 : -1))
    .slice(0, 6);

  return (
    <div className="page-container">
      <HealthBanner />
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="section-title">MSI Engenharia</div>
          <h1 className="font-display text-3xl">SmartBid AI — Centro de Comando</h1>
          <p className="text-muted-foreground">
            Pipeline multiagente, propostas em andamento e indicadores chave.
          </p>
        </div>
        <Button asChild>
          <Link href="/propostas/nova">
            <Plus className="h-4 w-4" /> Nova proposta
          </Link>
        </Button>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map(({ label, value, icon: Icon }) => (
          <div key={label} className="kpi-card">
            <div className="flex items-center justify-between">
              <span className="section-title">{label}</span>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 font-display text-2xl">{value}</div>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Últimas propostas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Aberta em</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link className="font-medium text-primary hover:underline" href={`/propostas/${p.id}`}>
                        {p.numero}
                      </Link>
                    </TableCell>
                    <TableCell>{p.titulo}</TableCell>
                    <TableCell>{p.cliente}</TableCell>
                    <TableCell className="capitalize">{p.tipoServico}</TableCell>
                    <TableCell>{formatDateBR(p.dataAbertura)}</TableCell>
                    <TableCell>
                      <ProposalStatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrencyBRL(p.budget.total)}</TableCell>
                  </TableRow>
                ))}
                {recent.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                      Nenhuma proposta encontrada. Crie a primeira agora.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
