import { Badge } from "@/components/ui/badge";
import type { ProposalStatus } from "@/lib/types";

const MAP: Record<ProposalStatus, { variant: any; label: string }> = {
  Rascunho: { variant: "secondary", label: "Rascunho" },
  "Em análise": { variant: "info", label: "Em análise" },
  "Aguardando revisão": { variant: "warning", label: "Aguardando revisão" },
  Aprovada: { variant: "success", label: "Aprovada" },
  Enviada: { variant: "default", label: "Enviada" },
  Reprovada: { variant: "destructive", label: "Reprovada" },
};

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const cfg = MAP[status] ?? MAP.Rascunho;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
