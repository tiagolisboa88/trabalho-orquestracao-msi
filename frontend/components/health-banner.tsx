"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { getHealth, type HealthDTO } from "@/lib/api";

export function HealthBanner() {
  const [state, setState] = useState<HealthDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((h) => !cancelled && setState(h))
      .catch((e) => !cancelled && setError(String(e)));
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
        <div>
          <div className="font-semibold text-destructive">Backend offline</div>
          <div className="text-muted-foreground">
            Não foi possível conectar em <code>http://localhost:8080</code>. Verifique se o uvicorn está rodando.
          </div>
        </div>
      </div>
    );
  }

  if (state && !state.has_api_key) {
    return (
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" />
        <div>
          <div className="font-semibold text-amber-900">OPENAI_API_KEY ausente</div>
          <div className="text-amber-800">
            Defina <code>OPENAI_API_KEY</code> no arquivo <code>.env</code> da raiz do projeto e reinicie o backend antes de rodar o crew.
          </div>
        </div>
      </div>
    );
  }

  if (state) {
    return (
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
        <CheckCircle2 className="h-4 w-4" />
        Backend conectado · Modelo <code>{state.model}</code>
      </div>
    );
  }
  return null;
}
