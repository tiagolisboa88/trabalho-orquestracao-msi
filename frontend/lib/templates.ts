import type { Proposal, ProposalDocumentSection, ServiceType } from "./types";
import { formatCurrencyBRL, formatDateBR } from "./utils";

const TIPOS_LABEL: Record<ServiceType, string> = {
  montagem: "Montagem Industrial",
  reforma: "Reforma Mecânica",
  desmontagem: "Desmontagem e Logística",
  fabricacao: "Fabricação em Caldeiraria",
};

export function tipoLabel(t: ServiceType): string {
  return TIPOS_LABEL[t] ?? t;
}

export function buildDefaultSections(p: Proposal): ProposalDocumentSection[] {
  const tipo = tipoLabel(p.tipoServico);
  const tabelaItens = p.budget.itens
    .map(
      (i) =>
        `| ${i.funcao} | ${i.quantidade} | ${i.horasMes} | ${i.meses} | ${formatCurrencyBRL(i.valorMensal)} | ${formatCurrencyBRL(i.total)} |`
    )
    .join("\n");
  const tabelaCabecalho = `| Função | Qtd | Horas/Mês | Meses | Valor Mensal | Total |\n|---|---|---|---|---|---|`;

  return [
    {
      id: "objetivo",
      titulo: "1. Objetivo",
      conteudo: `A presente proposta tem por objeto a execução, pela MSI Engenharia, dos serviços de ${tipo} contratados pela ${p.cliente}, conforme escopo técnico avaliado pelo crew multiagente da plataforma MSI SmartBid AI.`,
    },
    {
      id: "abrangencia",
      titulo: "2. Abrangência dos Serviços",
      conteudo: p.escopoManual?.trim()
        ? p.escopoManual
        : `Os serviços compreendem ${tipo.toLowerCase()} executados em campo, com mão de obra qualificada, ferramental, EPIs e gestão de obra fornecidos pela MSI.`,
    },
    {
      id: "funcoes",
      titulo: "3. Funções Alocadas",
      conteudo:
        p.budget.itens.length > 0
          ? `${tabelaCabecalho}\n${tabelaItens}`
          : "A composição de equipes será detalhada após análise final do escopo pelo Compositor HH.",
    },
    {
      id: "resp-contratada",
      titulo: "4. Responsabilidades da Contratada",
      conteudo:
        "Fornecimento de mão de obra qualificada, EPIs, ferramental, supervisão técnica, gestão de SST conforme NR-10/NR-12/NR-33/NR-35, registros de qualidade e documentação de aceite.",
    },
    {
      id: "resp-contratante",
      titulo: "5. Responsabilidades da Contratante",
      conteudo:
        "Disponibilização de frentes de serviço liberadas, energia, ar comprimido, água industrial, acesso ao site, refeitório e infraestrutura básica para a equipe.",
    },
    {
      id: "comerciais",
      titulo: "6. Condições Comerciais",
      conteudo: `Valor global: ${formatCurrencyBRL(p.budget.total)}. Pagamento: ${p.condicoes.pagamento}. Reajuste: ${p.condicoes.reajuste}. Validade da proposta: ${p.condicoes.validadeDias} dias.`,
    },
    {
      id: "gerais",
      titulo: "7. Condições Gerais",
      conteudo:
        "Cláusulas gerais conforme contrato-padrão MSI Engenharia: confidencialidade, propriedade intelectual, foro de eleição São Paulo/SP, conformidade LGPD.",
    },
    {
      id: "exclusoes",
      titulo: "8. Exclusões",
      conteudo:
        "Não estão inclusos: andaimes especiais, içamentos acima de 50 toneladas, alojamento, fretes especiais, materiais de consumo não relacionados nas premissas.",
    },
    {
      id: "disposicoes",
      titulo: "9. Disposições Finais",
      conteudo: `Esta proposta foi gerada em ${formatDateBR(p.document.capa.data)} pela plataforma MSI SmartBid AI, com revisão técnica humana obrigatória antes do envio formal ao CLIENTE.`,
    },
    {
      id: "declaracao",
      titulo: "10. Declaração",
      conteudo:
        "A MSI Engenharia declara que dispõe de capacidade técnica, financeira e operacional para a execução integral dos serviços ora propostos.",
    },
  ];
}

export interface SmartSuggestion {
  id: string;
  titulo: string;
  descricao: string;
}

export function suggestImprovements(p: Proposal): SmartSuggestion[] {
  const out: SmartSuggestion[] = [];
  const escopo = (p.escopoManual ?? "").toLowerCase();

  if (/altura|estrutura|treli/.test(escopo) && !/nr-?35/i.test(escopo)) {
    out.push({
      id: "nr35",
      titulo: "Trabalho em altura — citar NR-35",
      descricao: "O escopo sugere trabalho em altura. Inclua treinamento NR-35, PTA e ancoragem certificada nas premissas.",
    });
  }
  if (/manuten/.test(escopo) && p.tipoServico === "reforma") {
    out.push({
      id: "acesso",
      titulo: "Planejar janelas de manutenção",
      descricao: "Liste janelas de parada com a operação do cliente para evitar penalidades por indisponibilidade.",
    });
  }
  if (/(m[aá]quina|equipamento|m[oô]vel)/.test(escopo) && !/nr-?12/i.test(escopo)) {
    out.push({
      id: "nr12",
      titulo: "Proteções de máquina — NR-12",
      descricao: "Inclua adequações NR-12 (proteções fixas/móveis, intertravamentos) nas premissas técnicas.",
    });
  }
  if (p.budget.total > 0 && p.budget.bdi < 18) {
    out.push({
      id: "bdi",
      titulo: "BDI abaixo da faixa MSI",
      descricao: "O BDI atual está abaixo da faixa MSI (18–28%). Reavalie indiretos e margem antes de enviar ao cliente.",
    });
  }
  if (!p.condicoes.incluiAlimentacao) {
    out.push({
      id: "alimentacao",
      titulo: "Alimentação não inclusa",
      descricao: "Confirme com o cliente se haverá refeitório no site. Caso contrário, prever R$ 65/dia/colaborador.",
    });
  }
  return out;
}
