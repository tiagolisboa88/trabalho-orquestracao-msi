import type { Clause, Proposal, RoleRate } from "./types";
import { uid } from "./utils";

export const SEED_ROLES: RoleRate[] = [
  { id: "role_encarregado", nome: "Encarregado", cargaMensal: 220, hora_normal: 130, hora_he50: 195, hora_he100: 260 },
  { id: "role_mecanico", nome: "Mecânico Industrial", cargaMensal: 220, hora_normal: 105, hora_he50: 157.5, hora_he100: 210 },
  { id: "role_caldeireiro", nome: "Caldeireiro", cargaMensal: 220, hora_normal: 95, hora_he50: 142.5, hora_he100: 190 },
  { id: "role_soldador", nome: "Soldador Qualificado", cargaMensal: 220, hora_normal: 110, hora_he50: 165, hora_he100: 220 },
  { id: "role_meio_oficial", nome: "Meio Oficial", cargaMensal: 220, hora_normal: 70, hora_he50: 105, hora_he100: 140 },
  { id: "role_ajudante", nome: "Ajudante", cargaMensal: 220, hora_normal: 55, hora_he50: 82.5, hora_he100: 110 },
];

export const SEED_CLAUSES: Clause[] = [
  {
    id: "clause_garantia",
    categoria: "Garantia",
    titulo: "Garantia técnica padrão MSI",
    texto:
      "A CONTRATADA garante todos os serviços executados pelo período de 12 (doze) meses contados a partir do Termo de Aceite, conforme NR-13 e normas internas MSI Engenharia.",
  },
  {
    id: "clause_pagamento",
    categoria: "Pagamento",
    titulo: "Medições mensais com retenção",
    texto:
      "Pagamento mediante medições mensais aprovadas pelo CLIENTE, com 5% (cinco por cento) de retenção liberada após aceite final e entrega do dossiê técnico.",
  },
  {
    id: "clause_seguranca",
    categoria: "Segurança",
    titulo: "Conformidade NR-10, NR-12, NR-35",
    texto:
      "Todos os trabalhos seguirão as Normas Regulamentadoras NR-10 (elétrica), NR-12 (máquinas), NR-33 (espaço confinado) e NR-35 (trabalho em altura) sob responsabilidade da CONTRATADA.",
  },
  {
    id: "clause_exclusao",
    categoria: "Exclusões",
    titulo: "Itens não inclusos no escopo",
    texto:
      "Não estão incluídos no preço desta proposta: andaimes tubulares de grande porte, içamentos acima de 50t, alojamento para a equipe da CONTRATADA quando não fornecido pelo CLIENTE.",
  },
];

function makeProposal(partial: Partial<Proposal>): Proposal {
  const id = partial.id ?? uid("prop");
  return {
    id,
    numero: partial.numero ?? `MSI-${id.slice(-6).toUpperCase()}`,
    titulo: partial.titulo ?? "Proposta MSI",
    cliente: partial.cliente ?? "Cliente Exemplo",
    responsavel: partial.responsavel ?? "Eng. Coordenador",
    tipoServico: partial.tipoServico ?? "montagem",
    dataAbertura: partial.dataAbertura ?? new Date().toISOString(),
    prazoEntrega: partial.prazoEntrega,
    status: partial.status ?? "Em análise",
    escopoManual: partial.escopoManual ?? "",
    arquivos: partial.arquivos ?? [],
    condicoes: partial.condicoes ?? {
      pagamento: "Medições mensais com retenção de 5%",
      reajuste: "IPCA acumulado a cada 12 meses",
      validadeDias: 30,
      incluiFerramental: true,
      incluiTransporte: true,
      incluiAlimentacao: true,
    },
    agents: partial.agents ?? [],
    budget: partial.budget ?? {
      itens: [],
      subtotal: 0,
      bdi: 22,
      contingencia: 5,
      total: 0,
    },
    risks: partial.risks ?? [],
    document: partial.document ?? {
      capa: {
        numero: partial.numero ?? `MSI-${id.slice(-6).toUpperCase()}`,
        cliente: partial.cliente ?? "Cliente Exemplo",
        data: new Date().toISOString(),
      },
      secoes: [],
      observacoes: "",
    },
  };
}

export const SEED_PROPOSALS: Proposal[] = [
  makeProposal({
    id: "seed_proposal_vale",
    numero: "MSI-2026-001",
    titulo: "Montagem de Estrutura Metálica - Pelotização III",
    cliente: "Mineradora Vale",
    responsavel: "Eng. Roberto Lima",
    tipoServico: "montagem",
    status: "Aprovada",
    dataAbertura: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    prazoEntrega: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
    escopoManual:
      "Montagem de 250 ton de estrutura metálica, incluindo treliças, plataformas e escadas, com elevação por guindaste 50t.",
    budget: {
      itens: [
        { funcao: "Encarregado", quantidade: 1, horasMes: 220, meses: 3, valorMensal: 28600, total: 85800 },
        { funcao: "Montador Industrial", quantidade: 12, horasMes: 220, meses: 3, valorMensal: 224400, total: 673200 },
        { funcao: "Soldador Qualificado", quantidade: 4, horasMes: 220, meses: 3, valorMensal: 96800, total: 290400 },
      ],
      subtotal: 1049400,
      bdi: 22,
      contingencia: 5,
      total: 1410028,
    },
    risks: [
      { id: uid("risk"), titulo: "Atraso na entrega de aço", severidade: "medio", mitigacao: "Pedido firme com fornecedor Gerdau, multa contratual." },
      { id: uid("risk"), titulo: "Trabalho em altura", severidade: "alto", mitigacao: "Equipe NR-35 + PTA documentado e treinamento mensal." },
    ],
  }),
  makeProposal({
    id: "seed_proposal_csn",
    numero: "MSI-2026-002",
    titulo: "Reforma de tubulação - Linha 4 CSN",
    cliente: "Siderúrgica CSN",
    responsavel: "Eng. Marina Souza",
    tipoServico: "reforma",
    status: "Em análise",
    dataAbertura: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    escopoManual:
      "Substituição de 1500m de tubulação Sch40 com revestimento térmico e novas soldas qualificadas.",
    budget: {
      itens: [
        { funcao: "Tubulador", quantidade: 6, horasMes: 220, meses: 2, valorMensal: 118800, total: 237600 },
        { funcao: "Soldador Qualificado", quantidade: 3, horasMes: 220, meses: 2, valorMensal: 72600, total: 145200 },
      ],
      subtotal: 382800,
      bdi: 22,
      contingencia: 5,
      total: 514401,
    },
    risks: [
      { id: uid("risk"), titulo: "Parada de produção limitada a 12h", severidade: "alto", mitigacao: "Equipe dobrada em turnos coordenados, pré-fabricação no canteiro." },
    ],
  }),
  makeProposal({
    id: "seed_proposal_anglo",
    numero: "MSI-2026-003",
    titulo: "Fabricação de skids - Anglo American",
    cliente: "Mineradora Anglo",
    responsavel: "Eng. Caio Bezerra",
    tipoServico: "fabricacao",
    status: "Rascunho",
    dataAbertura: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    escopoManual:
      "Fabricação de 8 skids para sistema de bombeamento, incluindo soldagem, tratamento e testes hidrostáticos.",
    budget: {
      itens: [],
      subtotal: 0,
      bdi: 22,
      contingencia: 5,
      total: 0,
    },
    risks: [],
  }),
];
