"use client";

import { CheckCircle2, CircleDashed, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AgentPhaseStatus } from "@/lib/types";

const STATUS_LABEL: Record<AgentPhaseStatus, string> = {
  pending: "Aguardando",
  running: "Executando",
  completed: "Concluído",
  failed: "Falhou",
};

const STATUS_BADGE: Record<AgentPhaseStatus, any> = {
  pending: "secondary",
  running: "info",
  completed: "success",
  failed: "destructive",
};

const STATUS_ICON: Record<AgentPhaseStatus, any> = {
  pending: CircleDashed,
  running: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
};

export function AgentCard({
  title,
  subtitle,
  status,
  body,
  index,
}: {
  title: string;
  subtitle: string;
  status: AgentPhaseStatus;
  body?: string;
  index: number;
}) {
  const Icon = STATUS_ICON[status] ?? CircleDashed;
  return (
    <article
      className={cn(
        "relative rounded-xl border bg-card p-4 shadow-sm",
        status === "running" && "border-primary"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid h-9 w-9 place-items-center rounded-full text-sm font-semibold",
            status === "completed" && "bg-emerald-100 text-emerald-700",
            status === "running" && "bg-primary/10 text-primary",
            status === "failed" && "bg-destructive/10 text-destructive",
            status === "pending" && "bg-muted text-muted-foreground"
          )}
        >
          {index}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{title}</h3>
            <Badge variant={STATUS_BADGE[status]}>
              <Icon
                className={cn("mr-1 h-3 w-3", status === "running" && "animate-spin")}
              />
              {STATUS_LABEL[status]}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
          {body && (
            <pre className="mt-3 max-h-44 overflow-auto whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-xs leading-relaxed">
              {body}
            </pre>
          )}
        </div>
      </div>
    </article>
  );
}
