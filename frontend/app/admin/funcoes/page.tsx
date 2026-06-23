"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { uid } from "@/lib/utils";
import { formatCurrencyBRL } from "@/lib/utils";
import type { RoleRate } from "@/lib/types";

const EMPTY: RoleRate = {
  id: "",
  nome: "",
  cargaMensal: 220,
  hora_normal: 0,
  hora_he50: 0,
  hora_he100: 0,
};

export default function FuncoesPage() {
  const roleRates = useStore((s) => s.roleRates);
  const upsertRole = useStore((s) => s.upsertRole);
  const removeRole = useStore((s) => s.removeRole);

  const [editing, setEditing] = useState<RoleRate | null>(null);
  const [open, setOpen] = useState(false);

  function openNew() {
    setEditing({ ...EMPTY, id: uid("role") });
    setOpen(true);
  }

  function save() {
    if (!editing) return;
    upsertRole(editing);
    setOpen(false);
    setEditing(null);
  }

  return (
    <div className="page-container">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="section-title">Administração</div>
          <h1 className="font-display text-3xl">Banco de Funções</h1>
          <p className="text-muted-foreground">Carga mensal e custos por função MSI.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4" /> Nova função</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing?.nome ? "Editar função" : "Nova função"}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="col-span-2 space-y-1">
                  <Label>Nome</Label>
                  <Input value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Carga mensal (h)</Label>
                  <Input type="number" value={editing.cargaMensal} onChange={(e) => setEditing({ ...editing, cargaMensal: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label>Hora normal (R$)</Label>
                  <Input type="number" value={editing.hora_normal} onChange={(e) => setEditing({ ...editing, hora_normal: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label>HE 50% (R$)</Label>
                  <Input type="number" value={editing.hora_he50} onChange={(e) => setEditing({ ...editing, hora_he50: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label>HE 100% (R$)</Label>
                  <Input type="number" value={editing.hora_he100} onChange={(e) => setEditing({ ...editing, hora_he100: Number(e.target.value) })} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Funções cadastradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Função</TableHead>
                <TableHead>Carga mensal</TableHead>
                <TableHead>Hora normal</TableHead>
                <TableHead>HE 50%</TableHead>
                <TableHead>HE 100%</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleRates.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.nome}</TableCell>
                  <TableCell>{r.cargaMensal} h</TableCell>
                  <TableCell className="tabular-nums">{formatCurrencyBRL(r.hora_normal)}</TableCell>
                  <TableCell className="tabular-nums">{formatCurrencyBRL(r.hora_he50)}</TableCell>
                  <TableCell className="tabular-nums">{formatCurrencyBRL(r.hora_he100)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => removeRole(r.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {roleRates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    Nenhuma função cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
