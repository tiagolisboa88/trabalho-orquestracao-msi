import { cn } from "@/lib/utils";

export interface StepperStep {
  title: string;
  description?: string;
}

export function Stepper({
  steps,
  current,
}: {
  steps: StepperStep[];
  current: number;
}) {
  return (
    <ol className="grid grid-cols-1 gap-3 md:grid-cols-5">
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "active" : "pending";
        return (
          <li
            key={s.title}
            className={cn(
              "rounded-lg border p-3 text-sm",
              state === "active" && "border-primary bg-primary/5 text-primary",
              state === "done" && "border-emerald-300 bg-emerald-50 text-emerald-800",
              state === "pending" && "border-border text-muted-foreground"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Etapa {i + 1}</span>
              <span className="text-xs">
                {state === "done" ? "OK" : state === "active" ? "em curso" : "pendente"}
              </span>
            </div>
            <div className="mt-1 font-medium">{s.title}</div>
            {s.description && (
              <div className="text-xs text-muted-foreground">{s.description}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
