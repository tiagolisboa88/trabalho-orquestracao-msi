import type { Risk, RiskSeverity } from "./types";
import { uid } from "./utils";

function detectSeverity(text: string): RiskSeverity {
  const t = text.toLowerCase();
  if (/(alto|cr[ií]tico|severo|grave)/.test(t)) return "alto";
  if (/(m[eé]dio|moderado)/.test(t)) return "medio";
  return "baixo";
}

export function parseRisks(reviewOutput: string | undefined | null): Risk[] {
  if (!reviewOutput) return [];
  const lines = reviewOutput.split(/\r?\n/);
  const risks: Risk[] = [];

  const riskBlocks: string[] = [];
  let buffer: string[] = [];
  let inRiskSection = false;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^(##+|\*\*).*risco/i.test(line) || /risc(o|os)/i.test(line) && /^[#*]/.test(line)) {
      if (buffer.length) riskBlocks.push(buffer.join("\n"));
      buffer = [];
      inRiskSection = true;
      continue;
    }
    if (inRiskSection && /^[-*•]\s+/.test(line)) {
      if (buffer.length) riskBlocks.push(buffer.join("\n"));
      buffer = [line.replace(/^[-*•]\s+/, "")];
    } else if (inRiskSection && line.startsWith(" ")) {
      buffer.push(line.trim());
    } else if (inRiskSection && line === "") {
      if (buffer.length) {
        riskBlocks.push(buffer.join("\n"));
        buffer = [];
      }
    } else if (inRiskSection && /^(##|\*\*)/.test(line)) {
      if (buffer.length) {
        riskBlocks.push(buffer.join("\n"));
        buffer = [];
      }
      inRiskSection = /risc(o|os)/i.test(line);
    } else if (inRiskSection) {
      if (line) buffer.push(line.trim());
    }
  }
  if (buffer.length) riskBlocks.push(buffer.join("\n"));

  for (const block of riskBlocks) {
    if (!block.trim()) continue;
    const titulo = block.split(/[:\.\n]/)[0].slice(0, 110).trim();
    if (!titulo) continue;
    const mitigacaoMatch = block.match(/mitiga[cç][aã]o[:\s]+(.+)/i);
    const mitigacao = mitigacaoMatch
      ? mitigacaoMatch[1].trim()
      : "Plano de mitigação a definir com a área técnica.";
    risks.push({
      id: uid("risk"),
      titulo,
      severidade: detectSeverity(block),
      mitigacao,
    });
  }

  if (risks.length === 0) {
    const fallback = reviewOutput
      .split(/\n+/)
      .filter((l) => /risco|atraso|seguran[cç]a|nr-?\d+/i.test(l))
      .slice(0, 6);
    for (const line of fallback) {
      const titulo = line.replace(/^[-*•\s]+/, "").slice(0, 110);
      if (!titulo) continue;
      risks.push({
        id: uid("risk"),
        titulo,
        severidade: detectSeverity(line),
        mitigacao: "Mitigação a ser detalhada pelo revisor técnico humano.",
      });
    }
  }

  return risks.slice(0, 8);
}

export function summarize(text: string | null | undefined, maxLen = 360): string {
  if (!text) return "";
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > maxLen ? `${flat.slice(0, maxLen)}…` : flat;
}
