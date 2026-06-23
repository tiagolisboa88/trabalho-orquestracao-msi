"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProposalStatusBadge } from "@/components/proposal-status-badge";
import { useStore } from "@/lib/store";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import type { ProposalStatus, ServiceType } from "@/lib/types";

const STATUS: (ProposalStatus | "todos")[] = [
  "todos",
  "Rascunho",
  "Em análise",
  "Aguardando revisão",
  "Aprovada",
  "Enviada",
  "Reprovada",
];
const TIPOS: (ServiceType | "todos")[] = ["todos", "montagem", "reforma", "desmontagem", "fabricacao"];

export default function HistoricoPage() {
  const proposals = useStore((s) => s.proposals);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<ProposalStatus | "todos">("todos");
  const [tipo, setTipo] = useState<ServiceType | "todos">("todos");

  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      if (status !== "todos" && p.status !== status) return false;
      if (tipo !== "todos" && p.tipoServico !== tipo) return false;
      if (!busca.trim()) return true;
      const b = busca.toLowerCase();
      return [p.titulo, p.cliente, p.numero, p.responsavel]
        .join(" ")
        .toLowerCase()
        .includes(b);
    });
  }, [proposals, busca, status, tipo]);

  return (
    <div className="page-container">
      <header className="mb-6">
        <div className="section-title">Propostas</div>
        <h1 className="font-display text-3xl">Histórico</h1>
        <p className="text-muted-foreground">Todas as propostas geradas pela plataforma.</p>
      </header>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Buscar por título, cliente, número..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          <Select value={status} onValueChange={(v) => setStatus(v as ProposalStatus | "todos")}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {STATUS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tipo} onValueChange={(v) => setTipo(v as ServiceType | "todos")}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              {TIPOS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aberta</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link href={`/propostas/${p.id}`} className="text-primary hover:underline font-medium">
                      {p.numero}
                    </Link>
                  </TableCell>
                  <TableCell>{p.titulo}</TableCell>
                  <TableCell>{p.cliente}</TableCell>
                  <TableCell className="capitalize">{p.tipoServico}</TableCell>
                  <TableCell><ProposalStatusBadge status={p.status} /></TableCell>
                  <TableCell>{formatDateBR(p.dataAbertura)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrencyBRL(p.budget.total)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                    Nenhuma proposta corresponde aos filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
