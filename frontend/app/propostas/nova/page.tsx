"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  FileUp,
  ListChecks,
  Rocket,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Stepper } from "@/components/wizard/stepper";
import { useStore } from "@/lib/store";
import { postKickoff } from "@/lib/api";
import { uid } from "@/lib/utils";
import { buildDefaultSections } from "@/lib/templates";
import type { Proposal, ServiceType } from "@/lib/types";

const STEPS = [
  { title: "Dados gerais", description: "Cliente e responsável" },
  { title: "Tipo de serviço", description: "Categoria principal" },
  { title: "Documentos", description: "Anexos do escopo" },
  { title: "Escopo manual", description: "Texto livre" },
  { title: "Condições", description: "Comerciais" },
];

const SERVICE_CARDS: { value: ServiceType; titulo: string; descricao: string }[] = [
  { value: "montagem", titulo: "Montagem Industrial", descricao: "Estruturas metálicas, tubulação, equipamentos em campo." },
  { value: "reforma", titulo: "Reforma Mecânica", descricao: "Substituição, modernização e adequação de ativos." },
  { value: "desmontagem", titulo: "Desmontagem & Logística", descricao: "Retirada controlada com içamentos pesados." },
  { value: "fabricacao", titulo: "Fabricação", descricao: "Caldeiraria pesada e montagem em oficina." },
];

interface FileItem {
  nome: string;
  size: number;
  status: "lido" | "pendente" | "erro";
  file: File;
}

export default function NovaPropostaPage() {
  const router = useRouter();
  const upsertProposal = useStore((s) => s.upsertProposal);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [cliente, setCliente] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [tipoServico, setTipoServico] = useState<ServiceType>("montagem");
  const [prazo, setPrazo] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [escopoManual, setEscopoManual] = useState("");
  const [pagamento, setPagamento] = useState("Medições mensais com retenção de 5%");
  const [reajuste, setReajuste] = useState("IPCA acumulado a cada 12 meses");
  const [validadeDias, setValidadeDias] = useState(30);
  const [incluiFerramental, setIncluiFerramental] = useState(true);
  const [incluiTransporte, setIncluiTransporte] = useState(true);
  const [incluiAlimentacao, setIncluiAlimentacao] = useState(true);

  function validate(): string | null {
    if (step === 0) {
      if (titulo.trim().length < 4) return "Informe um título descritivo.";
      if (cliente.trim().length < 2) return "Informe o cliente.";
      if (responsavel.trim().length < 2) return "Informe o responsável.";
    }
    if (step === 3 && escopoManual.trim().length < 20 && files.length === 0) {
      return "Descreva o escopo (mín. 20 caracteres) ou anexe um PDF.";
    }
    return null;
  }

  function next() {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function onDropFiles(list: FileList | null) {
    if (!list) return;
    const next: FileItem[] = [];
    Array.from(list).forEach((f) => {
      next.push({ nome: f.name, size: f.size, status: "pendente", file: f });
    });
    setFiles((prev) => [...prev, ...next]);
  }

  async function submit() {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);
    const id = uid("prop");
    const numero = `MSI-${id.slice(-6).toUpperCase()}`;
    const dataAbertura = new Date().toISOString();
    const proposal: Proposal = {
      id,
      numero,
      titulo,
      cliente,
      responsavel,
      tipoServico,
      dataAbertura,
      prazoEntrega: prazo || undefined,
      status: "Em análise",
      escopoManual,
      arquivos: files.map((f) => ({ nome: f.nome, status: f.status })),
      condicoes: {
        pagamento,
        reajuste,
        validadeDias: Number(validadeDias) || 30,
        incluiFerramental,
        incluiTransporte,
        incluiAlimentacao,
      },
      agents: [],
      budget: { itens: [], subtotal: 0, bdi: 22, contingencia: 5, total: 0 },
      risks: [],
      document: {
        capa: { numero, cliente, data: dataAbertura },
        secoes: [],
        observacoes: "",
      },
    };
    proposal.document.secoes = buildDefaultSections(proposal);

    try {
      const firstPdf = files.find((f) => f.file.type.includes("pdf"))?.file;
      const kickoff = await postKickoff({
        projeto: titulo,
        escopo_texto: escopoManual,
        escopo_pdf: firstPdf ?? null,
      });
      proposal.executionId = kickoff.execution_id;
      proposal.status = "Em análise";
      upsertProposal(proposal);
      toast.success("Proposta criada e crew em execução.");
      router.push(`/propostas/${id}?execution=${kickoff.execution_id}`);
    } catch (e: any) {
      toast.warning(
        "Backend indisponível — proposta salva localmente. Inicie o backend e rode o crew manualmente."
      );
      upsertProposal(proposal);
      router.push(`/propostas/${id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <header className="mb-6">
        <div className="section-title">Wizard de proposta</div>
        <h1 className="font-display text-3xl">Nova Proposta</h1>
        <p className="text-muted-foreground">5 etapas — dados, tipo, documentos, escopo e condições.</p>
      </header>

      <Stepper steps={STEPS} current={step} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Etapa {step + 1} — {STEPS[step].title}</CardTitle>
          <CardDescription>{STEPS[step].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Título da proposta</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Montagem de pipe-rack — Linha 3" />
              </div>
              <div className="space-y-1">
                <Label>Cliente</Label>
                <Input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Mineradora Vale" />
              </div>
              <div className="space-y-1">
                <Label>Responsável técnico MSI</Label>
                <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Eng. Roberto Lima" />
              </div>
              <div className="space-y-1">
                <Label>Prazo solicitado pelo cliente</Label>
                <Input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3 md:grid-cols-2">
              {SERVICE_CARDS.map((c) => {
                const active = tipoServico === c.value;
                const Icon = c.value === "montagem" ? Building2 : c.value === "reforma" ? Wrench : c.value === "fabricacao" ? Rocket : ListChecks;
                return (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setTipoServico(c.value)}
                    className={`rounded-lg border p-4 text-left transition-colors ${active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/40"}`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-primary" />
                      {active && <Badge variant="info">selecionado</Badge>}
                    </div>
                    <div className="mt-3 font-semibold">{c.titulo}</div>
                    <div className="text-sm text-muted-foreground">{c.descricao}</div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div>
              <label
                className="grid place-items-center gap-2 rounded-lg border-2 border-dashed p-10 text-sm text-muted-foreground hover:bg-muted/30"
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => { e.preventDefault(); onDropFiles(e.dataTransfer.files); }}
              >
                <FileUp className="h-6 w-6" />
                <div className="font-medium text-foreground">Arraste PDFs aqui ou clique para selecionar</div>
                <div>Aceitamos um ou mais documentos — o primeiro PDF é enviado ao backend.</div>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => onDropFiles(e.target.files)}
                />
              </label>
              {files.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {files.map((f, idx) => (
                    <li key={idx} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <div>
                        <div className="font-medium">{f.nome}</div>
                        <div className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <Badge variant={f.status === "erro" ? "destructive" : f.status === "pendente" ? "warning" : "success"}>
                        {f.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label>Descrição manual do escopo</Label>
              <Textarea
                rows={10}
                value={escopoManual}
                onChange={(e) => setEscopoManual(e.target.value)}
                placeholder="Descreva o escopo, quantitativos, normas aplicáveis e condições de campo."
              />
              <p className="text-xs text-muted-foreground">
                O texto será concatenado com o conteúdo extraído dos PDFs antes de ser enviado ao crew.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Condição de pagamento</Label>
                <Input value={pagamento} onChange={(e) => setPagamento(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Cláusula de reajuste</Label>
                <Input value={reajuste} onChange={(e) => setReajuste(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Validade (dias)</Label>
                <Select value={String(validadeDias)} onValueChange={(v) => setValidadeDias(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[15, 30, 45, 60, 90].map((d) => (
                      <SelectItem key={d} value={String(d)}>{d} dias</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-md border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span>Incluir ferramental</span>
                  <Switch checked={incluiFerramental} onCheckedChange={setIncluiFerramental} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Incluir transporte</span>
                  <Switch checked={incluiTransporte} onCheckedChange={setIncluiTransporte} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Incluir alimentação</span>
                  <Switch checked={incluiAlimentacao} onCheckedChange={setIncluiAlimentacao} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={back} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>
            Próxima <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Iniciando crew..." : "Criar e rodar análise"} <Rocket className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
