"use client";

import { forwardRef } from "react";
import type { Proposal } from "@/lib/types";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";

export const PrintView = forwardRef<HTMLDivElement, { proposal: Proposal }>(
  ({ proposal }, ref) => {
    return (
      <div
        ref={ref}
        className="print-page mx-auto bg-white text-msi-ink shadow-xl"
        style={{ width: "794px", minHeight: "1123px", padding: "48px 56px" }}
      >
        <header className="mb-8 border-b pb-4">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">MSI Engenharia · SmartBid AI</div>
          <h1 className="mt-2 font-display text-3xl">{proposal.titulo}</h1>
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-sm">
            <div><strong>Cliente:</strong> {proposal.cliente}</div>
            <div><strong>Proposta:</strong> {proposal.numero}</div>
            <div><strong>Data:</strong> {formatDateBR(proposal.document.capa.data)}</div>
            <div><strong>Responsável:</strong> {proposal.responsavel}</div>
          </div>
        </header>

        {proposal.document.secoes.map((s) => (
          <section key={s.id} className="mb-6">
            <h2 className="font-display text-lg">{s.titulo}</h2>
            <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-msi-ink/90">
              {s.conteudo}
            </div>
          </section>
        ))}

        <section className="mt-6 rounded-md border p-4">
          <h2 className="font-display text-lg">Resumo financeiro</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Subtotal</div>
            <div className="text-right tabular-nums">{formatCurrencyBRL(proposal.budget.subtotal)}</div>
            <div className="text-muted-foreground">BDI ({proposal.budget.bdi}%)</div>
            <div className="text-right tabular-nums">
              {formatCurrencyBRL((proposal.budget.subtotal * proposal.budget.bdi) / 100)}
            </div>
            <div className="text-muted-foreground">Contingência ({proposal.budget.contingencia}%)</div>
            <div className="text-right tabular-nums">
              {formatCurrencyBRL((proposal.budget.subtotal * proposal.budget.contingencia) / 100)}
            </div>
            <div className="font-semibold">Preço global</div>
            <div className="text-right font-semibold tabular-nums">
              {formatCurrencyBRL(proposal.budget.total)}
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t pt-4 text-xs text-muted-foreground">
          Gerado por MSI SmartBid AI · Documento confidencial · Validade {proposal.condicoes.validadeDias} dias
        </footer>
      </div>
    );
  }
);
PrintView.displayName = "PrintView";
