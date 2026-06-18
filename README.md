# MSI Engenharia - Sistema Multiagente de Orqamentacao Tecnica

Sistema multiagente de inteligencia artificial para automacao da orcamentacao tecnica na MSI Engenharia, empresa especializada em montagem mecanica industrial e mineracao. Desenvolvido como trabalho de MBA em Engenharia de Software da FIAP, utilizando o framework CrewAI para orquestracao de agentes.

O sistema recebe um PDF de escopo tecnico do cliente e, de forma autonoma, executa a analise tecnica, composicao de equipes e homem-hora, consolidacao de custos e revisao juridico-tecnica, gerando uma proposta comercial completa.

## Arquitetura

O fluxo sequencial utiliza 4 agentes especializados:

```
PDF de Escopo → Leitor Tecnico → Compositor HH → Orcamentista → Revisor → Proposta Final
```

| Agente | Funcao |
|--------|--------|
| **Leitor Tecnico** | Extrai servicos, quantitativos e requisitos do PDF de escopo |
| **Compositor HH** | Define homem-hora, equipes e produtividade com base historica |
| **Orcamentista** | Consolida custos diretos/indiretos, BDI e cronograma |
| **Revisor** | Revisa aspectos juridicos, tecnicos e valida precos |

## Stack de Tecnologia

- **Orquestracao**: CrewAI v1.14.7
- **LLM**: OpenAI GPT-4o
- **Deploy**: CrewAI Platform (app.crewai.com)
- **Interface Web**: FastAPI + HTML (local)
- **Linguagem**: Python 3.10+
- **Gerenciador de Pacotes**: uv

## Base de Conhecimento

O sistema utiliza dados referenciais embutidos nas instrucoes dos agentes:

- **Base Historica de Obras**: 15 registros de 8 obras anteriores (HH, equipes, custos, produtividade)
- **Tabela de Custos Referenciais**: 24 itens de referencia (mao de obra CCT Sindimetal 2026, materiais, equipamentos, custos indiretos, BDI)

## Instalacao

Requisitos: Python >=3.10 <3.14

```bash
pip install uv
crewai install
```

Configure o arquivo `.env`:

```
MODEL=gpt-4o
OPENAI_API_KEY=sua-chave-aqui
```

## Execucao

### Via CLI

```bash
crewai run
```

### Via Interface Web (local)

```bash
uvicorn trabalho_orquestracao.web.app:app --host 0.0.0.0 --port 8080
```

Acesse `http://localhost:8080`, faca upload do PDF de escopo e acompanhe a execucao.

### Deploy na Plataforma CrewAI

```bash
crewai deploy create
crewai deploy push
```

## Estrutura do Projeto

```
src/trabalho_orquestracao/
├── config/
│   ├── agents.yaml          # Definicao dos 4 agentes
│   └── tasks.yaml           # Definicao das 4 tarefas com base de conhecimento
├── web/
│   ├── app.py               # Backend FastAPI (proxy para CrewAI Platform)
│   └── static/index.html    # Interface web com upload de PDF
├── crew.py                  # Orquestracao do crew (sequencial)
└── main.py                  # Ponto de entrada
knowledge/
├── base_historica_obras.xlsx # Historico de obras MSI
└── tabela_custos.xlsx       # Tabela de custos referenciais
```

## Autor

Tiago Lisboa - MBA FIAP Engenharia de Software
