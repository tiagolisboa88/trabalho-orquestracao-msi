# MSI Engenharia · SmartBid AI

> Plataforma multiagente de **orçamentação técnica** para a MSI Engenharia.
> Frontend Next.js + shadcn/ui consumindo um backend FastAPI que executa o
> crew CrewAI **localmente, na máquina do usuário** — sem dependência de
> nuvem proprietária para a inferência.

![status](https://img.shields.io/badge/status-MVP%20funcional-22c55e)
![python](https://img.shields.io/badge/python-3.10%2B-3776AB?logo=python&logoColor=white)
![next](https://img.shields.io/badge/Next.js-14-000?logo=next.js&logoColor=white)
![crewai](https://img.shields.io/badge/CrewAI-1.14.7-ff7a00)
![license](https://img.shields.io/badge/license-MIT-blue)

Trabalho desenvolvido no **MBA em Engenharia de Software — FIAP**, na
disciplina de **Orquestração de Agentes**. O objetivo é demonstrar, na prática,
como orquestrar um time de agentes especializados (CrewAI) atrás de uma
interface de produto realística, ao invés de notebooks de demonstração.

---

## ✨ Por que SmartBid?

A MSI Engenharia, como toda casa que vende serviço técnico, gasta um tempo
desproporcional **traduzindo um escopo bruto em uma proposta comercial**:
ler PDF, montar HH, calcular BDI, lembrar de NRs aplicáveis, redigir cláusulas.
O SmartBid orquestra esse trabalho como uma esteira de 4 especialistas
sequenciais, deixando o engenheiro humano no papel certo: **revisar e decidir**,
não digitar do zero.

| # | Agente | Papel |
|---|---|---|
| 1 | `leitor_tecnico` | Lê o escopo (PDF ou texto), extrai entregáveis, premissas e restrições |
| 2 | `compositor` | Compõe a equipe técnica e estima HH por função |
| 3 | `orcamentista` | Aplica tabela de custos, BDI e contingência → orçamento |
| 4 | `revisor_proposta` | Revisão técnica-jurídica, NRs, riscos, cláusulas |

O 5º passo (geração da proposta final em DOCX/PDF) é feito **na UI**, a partir
dos artefatos produzidos pelo crew.

---

## 🧭 Arquitetura

```
┌─────────────────────────┐    POST /api/kickoff     ┌─────────────────────────┐
│ Next.js 14 (App Router) │ ─────────────────────────▶│ FastAPI (porta 8080)    │
│ shadcn/ui · Zustand     │                           │  • BackgroundTasks      │
│ React Hook Form + Zod   │ ◀─── /api/progress/{id} ──│  • ProgressListener     │
│                         │      (polling 2.5s)       │  • CrewAI 1.14.7        │
└─────────────────────────┘                           └────────────┬────────────┘
                                                                   │
                                                         executa local
                                                                   ▼
                                                        ┌──────────────────────┐
                                                        │ 4 agentes sequenciais│
                                                        │ + outputs/{id}.md    │
                                                        └──────────────────────┘
```

- **FastAPI** instancia o mesmo crew usado em CLI (`crew.py`) e expõe um
  `ProgressListener` que captura eventos do CrewAI
  (`CrewKickoffStarted`, `TaskStarted/Completed/Failed`, etc.) e os traduz para
  um DTO consumido pelo frontend.
- **Cada execução** escreve sua proposta final em `outputs/{execution_id}.md`,
  evitando colisão entre rodadas paralelas.
- **Zustand + localStorage** mantém propostas, funções e cláusulas no cliente
  — não há banco de dados.

| Agente / Task     | Card na UI                                  |
| ----------------- | ------------------------------------------- |
| `leitor_tecnico`  | Leitor de Escopo                            |
| `compositor`      | Engenheiro de Execução                      |
| `orcamentista`    | Orçamentista                                |
| `revisor_proposta`| Analista de Riscos + Revisor Técnico Humano |
| pós-processamento | Gerador da Proposta Final (DOCX/PDF)        |

---

## 🧰 Stack

**Backend**
- Python 3.10+, [`uv`](https://docs.astral.sh/uv/) para dependências
- FastAPI · uvicorn · python-multipart · python-dotenv
- CrewAI 1.14.7 · pdfplumber

**Frontend**
- Next.js 14 (App Router) · React 18 · TypeScript
- Tailwind CSS · shadcn/ui (primitivas Radix) · lucide-react · sonner
- Zustand (`persist` em localStorage) · React Hook Form + Zod
- `docx` + `file-saver` para exportação DOCX

**LLM**
- OpenAI GPT-4o (configurável via `MODEL` no `.env`)

---

## ✅ Pré-requisitos

- Python ≥ 3.10 e [`uv`](https://docs.astral.sh/uv/getting-started/installation/)
- Node.js ≥ 20 e npm
- Uma `OPENAI_API_KEY` válida — gere em
  https://platform.openai.com/api-keys

---

## 🚀 Instalação

```bash
git clone <este-repo>
cd trabalho-orquestracao-msi

# 1. Backend
cp .env.example .env             # depois edite OPENAI_API_KEY
uv sync                          # instala dependências Python

# 2. Frontend
cd frontend
npm install
cd ..
```

> ⚠️ O `.env` está no `.gitignore`. **Nunca** faça commit da sua chave real —
> apenas `.env.example` deve ir para o repositório.

---

## ▶️ Execução local

Suba os dois processos em terminais separados.

**Terminal 1 — backend (porta 8080)**

```bash
uv run uvicorn trabalho_orquestracao.web.app:app --reload --port 8080
```

**Terminal 2 — frontend (porta 3000)**

```bash
cd frontend
npm run dev
```

Abra **http://localhost:3000**. O dashboard já vem populado com propostas seed
para você não olhar pra uma tela vazia.

---

## 🖥️ Telas

| Rota              | O que faz                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| `/`               | **Dashboard** — 8 KPIs (propostas, taxa de aprovação, HH médio, etc.) e atividade recente          |
| `/propostas`      | **Histórico** filtrável por status, cliente, responsável                                           |
| `/propostas/nova` | **Wizard de criação** em 5 etapas (cliente → escopo → upload PDF → revisão → kickoff)              |
| `/propostas/[id]` | **Detalhe** com 3 abas: Pipeline (timeline ao vivo), Editor (10 seções) e Preview (impressão/DOCX) |
| `/admin/funcoes`  | **CRUD** do banco de funções com hora normal, HE 50%, HE 100%                                      |
| `/admin/clausulas`| **CRUD** da biblioteca jurídico-comercial reutilizável                                             |

---

## 🔌 API do backend

| Método | Rota                                  | Descrição                                                                                                                                |
| ------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/health`                         | Status do backend e se `OPENAI_API_KEY` está presente                                                                                    |
| `POST` | `/api/kickoff`                        | Dispara o crew em background. `multipart/form-data` com `projeto`, `escopo_texto` e, opcionalmente, `escopo_pdf`. Retorna `{ execution_id }` |
| `GET`  | `/api/progress/{execution_id}`        | Estado das 4 tasks. Consumido pelo polling do frontend (a cada 2,5 s)                                                                    |
| `GET`  | `/api/proposals/{execution_id}/final` | Markdown final gerado pelo `revisor_proposta`, salvo em `outputs/{execution_id}.md`                                                      |

Exemplo rápido:

```bash
curl http://localhost:8080/api/health
# { "ok": true, "has_api_key": true, "model": "gpt-4o" }
```

---

## 🗂️ Estrutura

```
trabalho-orquestracao-msi/
├── src/trabalho_orquestracao/
│   ├── crew.py                 # definição dos 4 agentes + set_output_file()
│   ├── progress.py             # ProgressListener (eventos CrewAI → DTO)
│   ├── web/app.py              # FastAPI local
│   ├── config/
│   │   ├── agents.yaml         # personas dos agentes
│   │   └── tasks.yaml          # instruções de cada task
│   └── main.py                 # entrypoint CLI (sem UI)
├── frontend/
│   ├── app/                    # páginas Next.js (App Router)
│   ├── components/             # UI shadcn, pipeline, editor, preview
│   └── lib/                    # store, api, types, parser, templates, export
├── outputs/                    # propostas finais (uma por execução)
├── pyproject.toml
├── .env.example
└── README.md
```

---

## 🔍 Verificação manual

1. `curl http://localhost:8080/api/health` → deve retornar `has_api_key: true`.
2. Abra `http://localhost:3000` — o dashboard mostra os KPIs com seeds.
3. Clique em **Nova proposta** → preencha o wizard → **Criar e rodar análise**.
4. Na tela de detalhe, aba **Pipeline**: os 6 cards transitam de
   **pendente → executando → concluído** conforme o crew avança.
5. Aba **Editor**: ajuste as 10 seções e o BDI/contingência.
6. Aba **Preview**: clique em **Imprimir/PDF** ou **Exportar DOCX**.
7. `/admin/funcoes` e `/admin/clausulas` permitem CRUD persistido em
   `localStorage`.

---

## 🛠️ Troubleshooting

**`/api/health` retorna `has_api_key: false`**
> Você não copiou o `.env` ou esqueceu de reiniciar o uvicorn depois de editar.
> O `--reload` recarrega código, mas variáveis de ambiente são lidas no boot.

**O frontend não fala com o backend (CORS / network error)**
> Confirme que o backend está em `http://localhost:8080`. Para apontar para
> outro host, defina `NEXT_PUBLIC_BACKEND_URL` no `.env.local` do frontend.

**`ModuleNotFoundError: crewai.utilities.events`**
> Você está em uma versão antiga do CrewAI. Faça `uv sync` para alinhar com a
> 1.14.7, que move os eventos para `crewai.events.types.*`.

**O pipeline trava em "executando" e nunca conclui**
> Geralmente é cota da OpenAI ou rede. Cheque o terminal do backend — o
> `ProgressListener` registra o erro real do crew em `progress.error`.

**`npm install` reclama de peer dependencies**
> Use Node ≥ 20. O projeto está fixado em React 18.3.1 — não atualize para
> React 19 RC sem ajustar `@hookform/resolvers`.

---

## 🔐 Segurança

- O `.env` está no `.gitignore` e **nunca** deve ser commitado.
- Apenas `.env.example` (com placeholder `sk-...`) é versionado.
- Se sua chave vazar, **rotacione imediatamente** em
  https://platform.openai.com/api-keys e revogue a antiga.
- Por ser uma aplicação **local-first**, nenhum dado de proposta sai da sua
  máquina — exceto as chamadas que o CrewAI faz para o provedor LLM
  configurado.

---

## 🗺️ Roadmap

- [ ] Persistência server-side (Postgres) opcional
- [ ] Autenticação (NextAuth) para uso multiusuário
- [ ] Templates de proposta por tipo de obra (industrial, predial, retrofit)
- [ ] Cache de execuções idênticas
- [ ] Integração com ERP da MSI para puxar tabela de custos atualizada

---

## 🤝 Contribuição

Este é um projeto acadêmico, mas PRs e issues são bem-vindos.

1. Fork → branch (`feat/algo`)
2. `uv sync` e `npm install` (na pasta `frontend/`)
3. Commit com mensagens descritivas (preferir conventional commits)
4. Abra o PR descrevendo o **porquê**, não só o que mudou

---

## 📚 Referências

- [CrewAI docs](https://docs.crewai.com/) — orquestração de agentes
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/) — primitivas Radix com Tailwind
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)

---

## 👤 Autor

**Tiago Lisboa**
MBA em Engenharia de Software — FIAP · Disciplina de Orquestração de Agentes
GitHub: [@tiagolisboa88](https://github.com/tiagolisboa88)

---

## 📄 Licença

MIT. Uso livre para fins acadêmicos e demonstrativos.
