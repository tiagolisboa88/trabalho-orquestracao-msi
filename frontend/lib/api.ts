import type { ExecutionProgressDTO } from "./types";

const BACKEND =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BACKEND_URL) ||
  "http://localhost:8080";

export interface HealthDTO {
  ok: boolean;
  has_api_key: boolean;
  outputs_dir: string;
  model: string;
}

export async function getHealth(): Promise<HealthDTO> {
  const res = await fetch(`${BACKEND}/api/health`, { cache: "no-store" });
  if (!res.ok) throw new Error(`health falhou: ${res.status}`);
  return res.json();
}

export interface KickoffPayload {
  projeto: string;
  escopo_texto: string;
  base_historica?: string;
  escopo_pdf?: File | null;
}

export async function postKickoff(
  payload: KickoffPayload
): Promise<{ execution_id: string; state: string }> {
  const form = new FormData();
  form.append("projeto", payload.projeto);
  form.append("escopo_texto", payload.escopo_texto);
  form.append(
    "base_historica",
    payload.base_historica ?? "base_historica_obras.xlsx"
  );
  if (payload.escopo_pdf) {
    form.append("escopo_pdf", payload.escopo_pdf);
  }
  const res = await fetch(`${BACKEND}/api/kickoff`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`kickoff falhou (${res.status}): ${txt}`);
  }
  return res.json();
}

export async function getProgress(
  executionId: string
): Promise<ExecutionProgressDTO> {
  const res = await fetch(`${BACKEND}/api/progress/${executionId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`progress falhou: ${res.status}`);
  return res.json();
}

export async function getFinalMarkdown(executionId: string): Promise<string> {
  const res = await fetch(`${BACKEND}/api/proposals/${executionId}/final`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`final falhou: ${res.status}`);
  return res.text();
}
