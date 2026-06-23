"use client";

import { RotateCcw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ClausePicker } from "./clause-picker";
import { buildDefaultSections } from "@/lib/templates";
import type { Proposal, ProposalDocumentSection } from "@/lib/types";

export function SectionAccordion({
  proposal,
  onChangeSections,
}: {
  proposal: Proposal;
  onChangeSections: (sections: ProposalDocumentSection[]) => void;
}) {
  const sections = proposal.document.secoes;

  function updateSection(id: string, patch: Partial<ProposalDocumentSection>) {
    onChangeSections(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function restore(id: string) {
    const fresh = buildDefaultSections(proposal).find((s) => s.id === id);
    if (!fresh) return;
    updateSection(id, { conteudo: fresh.conteudo });
  }

  return (
    <Accordion type="multiple" className="w-full">
      {sections.map((s) => (
        <AccordionItem key={s.id} value={s.id}>
          <AccordionTrigger>{s.titulo}</AccordionTrigger>
          <AccordionContent>
            <Textarea
              rows={8}
              value={s.conteudo}
              onChange={(e) => updateSection(s.id, { conteudo: e.target.value })}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => restore(s.id)}>
                <RotateCcw className="h-4 w-4" /> Restaurar do agente
              </Button>
              <ClausePicker onPick={(text) => updateSection(s.id, { conteudo: s.conteudo + text })} />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
