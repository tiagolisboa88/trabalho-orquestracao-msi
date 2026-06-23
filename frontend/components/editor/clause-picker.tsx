"use client";

import { useState } from "react";
import { Library } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export function ClausePicker({ onPick }: { onPick: (texto: string) => void }) {
  const clauseLibrary = useStore((s) => s.clauseLibrary);
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Library className="h-4 w-4" /> Inserir cláusula padrão
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Banco de cláusulas MSI</DialogTitle>
          <DialogDescription>
            Escolha uma cláusula para anexar ao final da seção.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 space-y-3 overflow-auto">
          {clauseLibrary.map((c) => (
            <article key={c.id} className="rounded-md border p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.categoria}</div>
              <div className="font-semibold">{c.titulo}</div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{c.texto}</p>
              <div className="mt-2 text-right">
                <Button
                  size="sm"
                  onClick={() => {
                    onPick(`\n\n${c.titulo}: ${c.texto}`);
                    setOpen(false);
                  }}
                >
                  Inserir
                </Button>
              </div>
            </article>
          ))}
          {clauseLibrary.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma cláusula cadastrada.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
