"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Copy, Download, FileText, Printer, Save, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProposalStatusBadge } from "@/components/proposal-status-badge";
import { RiskBadge } from "@/components/risk-badge";
import { PipelineTimeline } from "@/components/pipeline/timeline";
import { SectionAccordion } from "@/components/editor/section-accordion";
import { PrintView } from "@/components/preview/print-view";
import { useStore } from "@/lib/store";
import { useExecutionProgress } from "@/lib/use-execution-progress";
import { getFinalMarkdown } from "@/lib/api";
import { parseRisks } from "@/lib/parser";
import { buildDefaultSections, suggestImprovements } from "@/lib/templates";
import { exportProposalDocx } from "@/lib/export-docx";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import type { Proposal, ProposalStatus } from "@/lib/types";

const STATUS_VALUES: ProposalStatus[] = [
  "Rascunho",
  "Em análise",
  "Aguardando revisão",
  "Aprovada",
  "Enviada",
  "Reprovada",
];

export default function ProposalDetailPage() {
  const params = useParams<{ id: string }>();
  const proposals = useStore((s) => s.proposals);
  const hydrated = useStore((s) => s.hydrated);
  const proposal = proposals.find((p) => p.id === params.id);

  if (!hydrated) {
    return (
      <div className="page-container">
        <p className="text-muted-foreground">Carregando…</p>
      </div>
    );
  }
  if (!proposal) {
    notFound();
    return null;
  }
  return <ProposalDetail proposal={proposal} />;
}

function ProposalDetail({ proposal }: { proposal: Proposal }) {
  const searchParams = useSearchParams();
  const patchProposal = useStore((s) => s.patchProposal);
  const upsertProposal = useStore((s) => s.upsertProposal);

  const executionId = searchParams.get("execution") ?? proposal.executionId ?? null;
  const { data: progress } = useExecutionProgress(executionId);
  const [finalMarkdown, setFinalMarkdown] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!executionId || progress?.state !== "completed") return;
    let cancelled = false;
    getFinalMarkdown(executionId)
      .then((md) => !cancelled && setFinalMarkdown(md))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [executionId, progress?.state]);

  const parsedRisks = useMemo(() => {
    const reviewOutput = progress?.tasks.find((t) => t.name === "revisao_proposta")?.output;
    return parseRisks(reviewOutput);
  }, [progress]);

  useEffect(() => {
    if (!progress) return;
    const patch: Partial<Proposal> = {};
    const tasksOutput = progress.tasks
      .filter((t) => t.output)
      .map((t) => ({ task: t.name, raw: t.output as string }));
    if (tasksOutput.length) patch.tasksOutput = tasksOutput;
    if (parsedRisks.length) patch.risks = parsedRisks;
    if (progress.state === "completed" && proposal.status === "Em análise") {
      patch.status = "Aguardando revisão";
    }
    patch.executionId = executionId ?? proposal.executionId;
    patch.progress = progress;
    if (Object.keys(patch).length) patchProposal(proposal.id, patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, parsedRisks, proposal.id]);

  useEffect(() => {
    if (proposal.document.secoes.length === 0) {
      upsertProposal({
        ...proposal,
        document: { ...proposal.document, secoes: buildDefaultSections(proposal) },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal.id, proposal.document.secoes.length]);

  const suggestions = suggestImprovements(proposal);

  function setStatus(status: ProposalStatus) {
    patchProposal(proposal.id, { status });
  }

  function regenerateAllSections() {
    upsertProposal({
      ...proposal,
      document: { ...proposal.document, secoes: buildDefaultSections(proposal) },
    });
    toast.success("Seções regeneradas a partir dos templates.");
  }

  async function handleExportDocx() {
    try {
      await exportProposalDocx(proposal);
      toast.success("DOCX gerado com sucesso.");
    } catch (e) {
      toast.error("Falha ao gerar DOCX.");
    }
  }

  async function handleCopy() {
    const txt = proposal.document.secoes
      .map((s) => `${s.titulo}\n${s.conteudo}`)
      .join("\n\n");
    await navigator.clipboard.writeText(txt);
    toast.success("Texto copiado para a área de transferência.");
  }

  return (
    <div className="page-container">
      <header className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Button variant="ghost" asChild className="-ml-3">
              <Link href="/propostas"><ArrowLeft className="h-4 w-4" /> Histórico</Link>
            </Button>
            <h1 className="font-display text-3xl">{proposal.titulo}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{proposal.numero}</span>
              <span>·</span>
              <span>{proposal.cliente}</span>
              <span>·</span>
              <span>{formatDateBR(proposal.dataAbertura)}</span>
              <span>·</span>
              <span>Resp. {proposal.responsavel}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ProposalStatusBadge status={proposal.status} />
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={proposal.status}
              onChange={(e) => setStatus(e.target.value as ProposalStatus)}
            >
              {STATUS_VALUES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline Multiagente</TabsTrigger>
          <TabsTrigger value="editor">Editor da Proposta</TabsTrigger>
          <TabsTrigger value="preview">Preview & Exportação</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <PipelineTimeline
              progress={progress}
              parsedRisks={parsedRisks}
              finalMarkdown={finalMarkdown}
            />

            <aside className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Status da execução</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">execution_id</span>
                    <code className="text-xs">{executionId ?? "—"}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">estado</span>
                    <Badge variant={progress?.state === "completed" ? "success" : progress?.state === "failed" ? "destructive" : "info"}>
                      {progress?.state ?? "sem execução"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">task corrente</span>
                    <span>{progress?.current_task ?? "—"}</span>
                  </div>
                  {progress?.error && (
                    <p className="rounded-md bg-destructive/10 p-2 text-destructive">
                      {progress.error}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Riscos detectados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {parsedRisks.length === 0 && (
                    <p className="text-muted-foreground">Nenhum risco detectado ainda.</p>
                  )}
                  {parsedRisks.map((r) => (
                    <div key={r.id} className="rounded-md border p-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium">{r.titulo}</div>
                        <RiskBadge severity={r.severidade} />
                      </div>
                      <p className="text-xs text-muted-foreground">{r.mitigacao}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Sugestões inteligentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {suggestions.length === 0 && (
                    <p className="text-muted-foreground">Sem sugestões adicionais.</p>
                  )}
                  {suggestions.map((s) => (
                    <div key={s.id} className="rounded-md border p-2">
                      <div className="font-medium">{s.titulo}</div>
                      <p className="text-xs text-muted-foreground">{s.descricao}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="editor">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>Seções editáveis</CardTitle>
                <Button size="sm" variant="outline" onClick={regenerateAllSections}>
                  Regenerar todas
                </Button>
              </CardHeader>
              <CardContent>
                <SectionAccordion
                  proposal={proposal}
                  onChangeSections={(secoes) =>
                    upsertProposal({
                      ...proposal,
                      document: { ...proposal.document, secoes },
                    })
                  }
                />
              </CardContent>
            </Card>

            <aside className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo orçamentário</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">{formatCurrencyBRL(proposal.budget.subtotal)}</span></div>
                  <div className="flex justify-between items-center gap-2">
                    <span>BDI (%)</span>
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      value={proposal.budget.bdi}
                      onChange={(e) => {
                        const bdi = Number(e.target.value);
                        const total = proposal.budget.subtotal * (1 + bdi / 100 + proposal.budget.contingencia / 100);
                        upsertProposal({
                          ...proposal,
                          budget: { ...proposal.budget, bdi, total },
                        });
                      }}
                      className="h-8 w-24 text-right"
                    />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span>Contingência (%)</span>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={proposal.budget.contingencia}
                      onChange={(e) => {
                        const contingencia = Number(e.target.value);
                        const total = proposal.budget.subtotal * (1 + proposal.budget.bdi / 100 + contingencia / 100);
                        upsertProposal({
                          ...proposal,
                          budget: { ...proposal.budget, contingencia, total },
                        });
                      }}
                      className="h-8 w-24 text-right"
                    />
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">{formatCurrencyBRL(proposal.budget.total)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Premissas humanas</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="min-h-[180px] w-full rounded-md border bg-background p-2 text-sm"
                    placeholder="Anote premissas adicionais validadas pelo revisor técnico humano."
                    value={proposal.document.observacoes ?? ""}
                    onChange={(e) =>
                      upsertProposal({
                        ...proposal,
                        document: { ...proposal.document, observacoes: e.target.value },
                      })
                    }
                  />
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="mb-4 flex flex-wrap items-center gap-2 no-print">
            <Button onClick={() => window.print()}><Printer className="h-4 w-4" /> Imprimir / PDF</Button>
            <Button variant="outline" onClick={handleExportDocx}><Download className="h-4 w-4" /> Exportar DOCX</Button>
            <Button variant="outline" onClick={handleCopy}><Copy className="h-4 w-4" /> Copiar texto</Button>
            <Button variant="secondary" onClick={() => toast.success("Proposta salva.")}>
              <Save className="h-4 w-4" /> Salvar
            </Button>
            {finalMarkdown && (
              <Button
                variant="ghost"
                onClick={() => {
                  const blob = new Blob([finalMarkdown], { type: "text/markdown" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `${proposal.numero}-final.md`;
                  a.click();
                }}
              >
                <FileText className="h-4 w-4" /> Markdown do crew
              </Button>
            )}
          </div>
          <PrintView ref={printRef} proposal={proposal} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
