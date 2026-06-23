"use client";

import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import type { Proposal } from "./types";

export async function exportProposalDocx(p: Proposal): Promise<void> {
  const sections = p.document.secoes;
  const body: Paragraph[] = [];
  body.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({ text: `Proposta ${p.numero}`, bold: true, size: 36 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${p.titulo}`, italics: true, size: 28 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Cliente: ${p.cliente}`, size: 22 }),
      ],
    }),
    new Paragraph({ children: [new TextRun(" ")] })
  );

  for (const s of sections) {
    body.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: s.titulo, bold: true, size: 26 })],
      })
    );
    for (const line of s.conteudo.split(/\r?\n/)) {
      body.push(
        new Paragraph({
          children: [new TextRun({ text: line, size: 22 })],
        })
      );
    }
    body.push(new Paragraph({ children: [new TextRun(" ")] }));
  }

  const doc = new Document({
    creator: "MSI SmartBid AI",
    title: `Proposta ${p.numero}`,
    sections: [{ children: body }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${p.numero}-proposta-msi.docx`);
}
