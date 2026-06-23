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
import { Textarea } from "@/components/ui/textarea";
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
import type { Clause } from "@/lib/types";

const EMPTY: Clause = { id: "", categoria: "", titulo: "", texto: "" };

export default function ClausulasPage() {
  const clauseLibrary = useStore((s) => s.clauseLibrary);
  const upsertClause = useStore((s) => s.upsertClause);
  const removeClause = useStore((s) => s.removeClause);

  const [editing, setEditing] = useState<Clause | null>(null);
  const [open, setOpen] = useState(false);

  function openNew() {
    setEditing({ ...EMPTY, id: uid("clause") });
    setOpen(true);
  }

  function save() {
    if (!editing) return;
    upsertClause(editing);
    setOpen(false);
    setEditing(null);
  }

  return (
    <div className="page-container">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="section-title">Administração</div>
          <h1 className="font-display text-3xl">Cláusulas Padrão</h1>
          <p className="text-muted-foreground">Biblioteca jurídico-comercial reutilizável no editor de propostas.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4" /> Nova cláusula</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing?.titulo ? "Editar cláusula" : "Nova cláusula"}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Categoria</Label>
                    <Input value={editing.categoria} onChange={(e) => setEditing({ ...editing, categoria: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Título</Label>
                    <Input value={editing.titulo} onChange={(e) => setEditing({ ...editing, titulo: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Texto</Label>
                  <Textarea rows={6} value={editing.texto} onChange={(e) => setEditing({ ...editing, texto: e.target.value })} />
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
          <CardTitle>Cláusulas cadastradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Trecho</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clauseLibrary.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.categoria}</TableCell>
                  <TableCell>{c.titulo}</TableCell>
                  <TableCell className="max-w-md text-muted-foreground line-clamp-2">{c.texto}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => removeClause(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {clauseLibrary.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    Nenhuma cláusula cadastrada.
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
