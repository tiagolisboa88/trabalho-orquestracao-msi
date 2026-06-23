
# MSI SmartBid AI — Plataforma Operacional de Propostas

Vou transformar a aplicação atual (demo single-page) em uma plataforma multi-tela completa, mantendo o conceito multiagente mas tornando-o operacional. Tudo client-side com persistência em `localStorage` (sem backend) — adequado para demo profissional e pronta para evoluir.

## Arquitetura de Rotas (TanStack Router)

```
/                          → Dashboard (KPIs + últimas propostas)
/propostas                 → Histórico com filtros
/propostas/nova            → Wizard de 5 etapas
/propostas/$id             → Detalhe + pipeline multiagente + revisão + preview
/propostas/$id/preview     → Visualização documento (capa + 10 seções)
/admin/funcoes             → Banco de funções e valores (homem-hora)
/admin/clausulas           → Banco de cláusulas padrão
```

Layout com **Sidebar shadcn** persistente: Dashboard, Nova Proposta, Histórico, Funções, Cláusulas.

## Identidade Visual MSI

- Paleta: branco / cinza escuro / **azul MSI** (`oklch(0.45 0.15 245)`) / preto
- Tokens em `src/styles.css`, tipografia Space Grotesk (display) + Inter (corpo)
- Aparência corporativa de engenharia: cards densos, tabelas, badges de status, sem gradientes coloridos

## Estado e Persistência

`src/lib/store.ts` — Zustand-style hook simples sobre `localStorage`:
- `proposals[]` — todas propostas com todas as seções editáveis
- `roleRates[]` — banco de funções (Encarregado, Mecânico, Caldeireiro, Soldador, Meio Oficial, Ajudante) com valor hora normal/HE50/HE100, carga mensal
- `clauseLibrary[]` — cláusulas padrão por categoria (exclusões, pagamento, garantia, mobilização, etc.)
- Seed inicial com valores realistas MSI + 3 propostas de exemplo (correia, britagem, bombeamento já existentes)

## Modelo de Dados (`src/lib/types.ts`)

```ts
Proposal {
  id, number, client, unit, location, contact,
  date, validity, responsibleCommercial, responsibleTechnical,
  serviceType, contractType, deadline,
  documents: UploadedDoc[],
  manualScope: string,
  commercial: { taxes, mobilization, lodging, food, transport,
                materials, lifting, painting, projects,
                paymentTerms, executionTerm, warranty, notes },
  agents: { reader, planner, budget, risk, human, generator } // outputs
  budget: { roles: BudgetRole[], extras: BudgetExtra[], bdi, margin, taxes, total },
  risks: Risk[],
  document: {  // seções editáveis da proposta final
    objective, scope, functions, responsibilitiesContractor,
    responsibilitiesClient, commercialConditions, generalConditions,
    exclusions, finalProvisions, signature
  },
  status: 'Rascunho'|'Em análise'|...,
  confidence, riskLevel, estimatedValue
}
```

## Wizard de Nova Proposta (5 Etapas)

Stepper com validação progressiva:
1. **Dados Gerais** — cliente, unidade, local, contato, número, data, responsáveis, validade
2. **Tipo de Serviço** — 9 opções em cards radio (homem-hora, fab+montagem, NR-12, transportadores, etc.)
3. **Upload de Documentos** — drag-drop, lista com status de leitura simulado, remover
4. **Escopo Manual** — textarea grande para colar/digitar escopo do cliente
5. **Condições Comerciais** — switches (impostos, mobilização, hospedagem, alimentação, transporte, materiais, içamento, pintura, projetos) + forma pagamento, prazo, garantia, observações

Botão final "Criar e Rodar Análise" → salva proposta, redireciona para `/propostas/$id` e dispara pipeline.

## Tela de Detalhe da Proposta

3 abas principais:

### Aba 1 — Pipeline Multiagente
Timeline vertical com 6 agentes (cards mantidos do design atual, melhorados):
1. **Leitor de Escopo** — equipamentos, atividades, dúvidas, itens críticos
2. **Engenheiro de Execução** — sequência, frentes, equipe, equipamentos, premissas, segurança
3. **Orçamentista** — tabela editável de funções + extras + BDI/margem/impostos
4. **Analista de Riscos** — matriz com classificação Baixo/Médio/Alto/Crítico + mitigações + cláusulas sugeridas
5. **Revisor Técnico Humano** — lista de premissas com botões Aprovar / Editar / Remover
6. **Gerador da Proposta Final** — produz seções editáveis

Botão "Executar Pipeline" simula análise sequencial (já existe — refatorado).

### Aba 2 — Editor da Proposta
10 seções editáveis em accordion (Objetivo, Abrangência, Descrição das Funções, Responsabilidades Contratada/Contratante, Condições Comerciais com tabela editável, Condições Gerais, Exclusões, Disposições Finais, Declaração). Cada seção: textarea + botão "Restaurar do agente" + "Inserir cláusula padrão" (modal puxando do banco).

### Aba 3 — Preview do Documento
Renderização tipo papel A4: capa MSI (logo + cliente + número + título), header/footer em cada página, seções numeradas, tabela comercial formatada, assinatura. Botões: **Exportar PDF** (`window.print()` com `@media print`), **Exportar DOCX** (gerar via `docx` lib), **Copiar texto**, **Salvar**.

## Geração de Texto (Templates Determinísticos)

Sem chamadas reais de IA — usar **templates parametrizados** por tipo de serviço. Cada agente tem função pura que recebe a proposta e devolve texto técnico/formal compatível com padrão MSI. Linguagem formal já validada (objetivo, abrangência, responsabilidades padrão para homem-hora, etc.).

Validador pré-geração: alerta se faltar cliente, local, tipo, prazo, pagamento, responsabilidade por materiais/içamento, critério medição, garantia, validade — e insere redação segura ("a ser validado entre as partes").

## Sugestões Inteligentes de Escopo

Função `suggestImprovements(proposal)` que, baseada no tipo de serviço, retorna lista de sugestões (NR-12, acessos manutenção, proteções mecânicas, sequência segura, etc.). Exibida em painel lateral no editor.

## Telas Admin

- **/admin/funcoes** — tabela CRUD: Função, Valor hora normal, HE50, HE100, Carga mensal, Observações. Seed com 6 funções padrão MSI.
- **/admin/clausulas** — biblioteca CRUD por categoria, com busca. Seed com cláusulas reais (exclusões, mobilização, garantia, medição, paralisação, validade).

## Dashboard

- 8 KPI cards (total, em elaboração, aguardando revisão, aprovadas, valor em negociação, taxa aprovação, risco médio, confiança média)
- Tabela "Últimas Propostas": cliente, número, tipo, valor, status badge, data, responsável, botão "Abrir"

## Exportação

- **PDF**: `react-to-print` + estilos `@media print` (capa, quebras de página, header/footer)
- **DOCX**: lib `docx` (já documentada nas skills) — gera estrutura idêntica à preview
- **Copiar texto**: monta plain-text e copia para clipboard

## Detalhes Técnicos

- Bibliotecas a adicionar: `zustand`, `docx`, `react-to-print`
- Sidebar shadcn (`SidebarProvider` em `__root.tsx`)
- Todos os formulários com Zod + react-hook-form (já no projeto)
- Toasts via `sonner` para ações (salvar, exportar, aprovar)
- Status badges com cores semânticas (rascunho=cinza, análise=azul, revisão=amber, aprovada=green, reprovada=red)

## Arquivos a Criar/Editar

- `src/styles.css` — paleta MSI azul corporativa
- `src/routes/__root.tsx` — adicionar SidebarProvider + AppSidebar
- `src/components/app-sidebar.tsx`
- `src/components/proposal-status-badge.tsx`
- `src/components/risk-badge.tsx`
- `src/lib/types.ts` — tipos completos
- `src/lib/store.ts` — store persistente
- `src/lib/templates.ts` — geradores de texto por tipo de serviço
- `src/lib/agents.ts` — 6 funções de agente (refatorar do atual)
- `src/lib/validation.ts` — validador de campos obrigatórios
- `src/lib/seed.ts` — dados iniciais (funções, cláusulas, propostas exemplo)
- `src/lib/export-docx.ts` — geração DOCX
- `src/routes/index.tsx` — Dashboard (substitui demo atual)
- `src/routes/propostas.tsx` — layout (Outlet)
- `src/routes/propostas.index.tsx` — Histórico com filtros
- `src/routes/propostas.nova.tsx` — Wizard 5 etapas
- `src/routes/propostas.$id.tsx` — Detalhe com 3 abas
- `src/routes/admin.funcoes.tsx`
- `src/routes/admin.clausulas.tsx`

## Escopo Fora desta Iteração

- Parsing real de PDF/DOCX/XLSX (apenas registra upload com status simulado)
- Chamadas reais de LLM (templates determinísticos cobrem o padrão MSI)
- Backend / multi-usuário (tudo `localStorage` — pronto para plugar Lovable Cloud depois)
- Login / autenticação

Se aprovar, sigo direto para implementação.
