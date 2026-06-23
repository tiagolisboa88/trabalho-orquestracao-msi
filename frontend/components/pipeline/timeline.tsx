"use client";

import { AgentCard } from "./agent-card";
import type { AgentPhase, AgentPhaseStatus, ExecutionProgressDTO, Risk } from "@/lib/types";
import { summarize } from "@/lib/parser";

interface Phase {
  title: AgentPhase;
  subtitle: string;
  origem: string;
}

const PHASES: Phase[] = [
  { title: "Leitor de Escopo", subtitle: "Interpretação do PDF e do escopo manual", origem: "task: leitura_tecnica" },
  { title: "Engenheiro de Execução", subtitle: "Composição de HH e equipes", origem: "task: composicao_hh" },
  { title: "Orçamentista", subtitle: "Custos diretos/indiretos + BDI", origem: "task: consolidacao_orcamento" },
  { title: "Analista de Riscos", subtitle: "Riscos jurídico-técnicos extraídos do parecer", origem: "parecer revisor → parser" },
  { title: "Revisor Técnico Humano", subtitle: "Validação de premissas e aderência ao mercado", origem: "task: revisao_proposta + humano" },
  { title: "Gerador da Proposta Final", subtitle: "Documento markdown + 10 seções editáveis", origem: "outputs/{id}.md" },
];

interface Props {
  progress: ExecutionProgressDTO | null;
  parsedRisks: Risk[];
  finalMarkdown: string | null;
}

function pickTaskStatus(progress: ExecutionProgressDTO | null, name: string): { status: AgentPhaseStatus; output?: string | null } {
  if (!progress) return { status: "pending" };
  const t = progress.tasks.find((tt) => tt.name === name);
  if (!t) return { status: "pending" };
  return { status: t.status, output: t.output };
}

export function PipelineTimeline({ progress, parsedRisks, finalMarkdown }: Props) {
  const leitura = pickTaskStatus(progress, "leitura_tecnica");
  const compos = pickTaskStatus(progress, "composicao_hh");
  const orca = pickTaskStatus(progress, "consolidacao_orcamento");
  const revisao = pickTaskStatus(progress, "revisao_proposta");

  const statuses: Record<AgentPhase, { status: AgentPhaseStatus; body?: string }> = {
    "Leitor de Escopo": { status: leitura.status, body: summarize(leitura.output) },
    "Engenheiro de Execução": { status: compos.status, body: summarize(compos.output) },
    "Orçamentista": { status: orca.status, body: summarize(orca.output) },
    "Analista de Riscos": {
      status: revisao.status === "completed" ? "completed" : revisao.status,
      body: parsedRisks.length
        ? parsedRisks.map((r) => `• [${r.severidade.toUpperCase()}] ${r.titulo}`).join("\n")
        : revisao.status === "completed"
          ? "Sem riscos críticos identificados pelo parser."
          : "Aguardando parecer do revisor.",
    },
    "Revisor Técnico Humano": {
      status: revisao.status,
      body: revisao.status === "completed"
        ? "Revisão automática concluída. Pendência: revisão humana antes do envio."
        : summarize(revisao.output) || "Aguardando.",
    },
    "Gerador da Proposta Final": {
      status: finalMarkdown ? "completed" : revisao.status === "completed" ? "running" : "pending",
      body: finalMarkdown ? summarize(finalMarkdown, 600) : "Será gerada após revisão.",
    },
  };

  return (
    <ol className="relative space-y-3">
      {PHASES.map((p, idx) => (
        <li key={p.title}>
          <AgentCard
            index={idx + 1}
            title={p.title}
            subtitle={`${p.subtitle} · ${p.origem}`}
            status={statuses[p.title].status}
            body={statuses[p.title].body}
          />
        </li>
      ))}
    </ol>
  );
}
