export type ServiceType =
  | "montagem"
  | "reforma"
  | "desmontagem"
  | "fabricacao";

export type ProposalStatus =
  | "Rascunho"
  | "Em análise"
  | "Aguardando revisão"
  | "Aprovada"
  | "Enviada"
  | "Reprovada";

export type RiskSeverity = "baixo" | "medio" | "alto";

export type AgentPhase =
  | "Leitor de Escopo"
  | "Engenheiro de Execução"
  | "Orçamentista"
  | "Analista de Riscos"
  | "Revisor Técnico Humano"
  | "Gerador da Proposta Final";

export type AgentPhaseStatus = "pending" | "running" | "completed" | "failed";

export interface RoleRate {
  id: string;
  nome: string;
  cargaMensal: number;
  hora_normal: number;
  hora_he50: number;
  hora_he100: number;
}

export interface Clause {
  id: string;
  categoria: string;
  titulo: string;
  texto: string;
}

export interface BudgetItem {
  funcao: string;
  quantidade: number;
  horasMes: number;
  meses: number;
  valorMensal: number;
  total: number;
}

export interface Budget {
  itens: BudgetItem[];
  subtotal: number;
  bdi: number;
  contingencia: number;
  total: number;
}

export interface Risk {
  id: string;
  titulo: string;
  severidade: RiskSeverity;
  mitigacao: string;
}

export interface AgentExecutionCard {
  phase: AgentPhase;
  status: AgentPhaseStatus;
  resumo?: string;
  detalhes?: string;
}

export interface ProposalDocumentSection {
  id: string;
  titulo: string;
  conteudo: string;
}

export interface ProposalDocument {
  capa: { numero: string; cliente: string; data: string };
  secoes: ProposalDocumentSection[];
  observacoes: string;
}

export interface ExecutionTaskState {
  name: string;
  label: string;
  status: AgentPhaseStatus;
  output?: string | null;
}

export interface ExecutionProgressDTO {
  execution_id: string;
  projeto: string;
  state: AgentPhaseStatus;
  current_task: string | null;
  tasks: ExecutionTaskState[];
  error?: string | null;
  raw?: string | null;
  started_at?: number;
  finished_at?: number | null;
}

export interface Proposal {
  id: string;
  numero: string;
  titulo: string;
  cliente: string;
  responsavel: string;
  tipoServico: ServiceType;
  dataAbertura: string;
  prazoEntrega?: string;
  status: ProposalStatus;
  escopoManual: string;
  arquivos: { nome: string; status: "lido" | "pendente" | "erro" }[];
  condicoes: {
    pagamento: string;
    reajuste: string;
    validadeDias: number;
    incluiFerramental: boolean;
    incluiTransporte: boolean;
    incluiAlimentacao: boolean;
  };
  agents: AgentExecutionCard[];
  budget: Budget;
  risks: Risk[];
  document: ProposalDocument;
  tasksOutput?: { task: string; raw: string }[];
  progress?: ExecutionProgressDTO;
  executionId?: string;
}
