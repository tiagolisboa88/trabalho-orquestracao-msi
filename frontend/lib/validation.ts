import { z } from "zod";

export const wizardSchema = z.object({
  titulo: z.string().min(4, "Informe um título descritivo"),
  cliente: z.string().min(2, "Informe o cliente"),
  responsavel: z.string().min(2, "Responsável obrigatório"),
  tipoServico: z.enum(["montagem", "reforma", "desmontagem", "fabricacao"]),
  prazoEntrega: z.string().optional(),
  escopoManual: z.string().min(20, "Descreva o escopo (mínimo 20 caracteres)"),
  pagamento: z.string().min(3, "Condição de pagamento obrigatória"),
  reajuste: z.string().min(3, "Condição de reajuste obrigatória"),
  validadeDias: z.coerce.number().int().min(7).max(180),
  incluiFerramental: z.boolean(),
  incluiTransporte: z.boolean(),
  incluiAlimentacao: z.boolean(),
});

export type WizardValues = z.infer<typeof wizardSchema>;
