import { Badge } from "@/components/ui/badge";
import type { RiskSeverity } from "@/lib/types";

const MAP: Record<RiskSeverity, { variant: any; label: string }> = {
  baixo: { variant: "success", label: "Baixo" },
  medio: { variant: "warning", label: "Médio" },
  alto: { variant: "destructive", label: "Alto" },
};

export function RiskBadge({ severity }: { severity: RiskSeverity }) {
  const cfg = MAP[severity] ?? MAP.baixo;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
