"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Clause, Proposal, RoleRate } from "./types";
import { SEED_CLAUSES, SEED_PROPOSALS, SEED_ROLES } from "./seed";

interface StoreState {
  hydrated: boolean;
  proposals: Proposal[];
  roleRates: RoleRate[];
  clauseLibrary: Clause[];
  setHydrated: (v: boolean) => void;
  upsertProposal: (proposal: Proposal) => void;
  patchProposal: (id: string, patch: Partial<Proposal>) => void;
  removeProposal: (id: string) => void;
  upsertRole: (role: RoleRate) => void;
  removeRole: (id: string) => void;
  upsertClause: (clause: Clause) => void;
  removeClause: (id: string) => void;
  seedIfEmpty: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      proposals: [],
      roleRates: [],
      clauseLibrary: [],
      setHydrated: (v) => set({ hydrated: v }),
      upsertProposal: (proposal) => {
        const existing = get().proposals.find((p) => p.id === proposal.id);
        const list = existing
          ? get().proposals.map((p) => (p.id === proposal.id ? proposal : p))
          : [proposal, ...get().proposals];
        set({ proposals: list });
      },
      patchProposal: (id, patch) => {
        set({
          proposals: get().proposals.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        });
      },
      removeProposal: (id) => {
        set({ proposals: get().proposals.filter((p) => p.id !== id) });
      },
      upsertRole: (role) => {
        const exists = get().roleRates.find((r) => r.id === role.id);
        const list = exists
          ? get().roleRates.map((r) => (r.id === role.id ? role : r))
          : [...get().roleRates, role];
        set({ roleRates: list });
      },
      removeRole: (id) => {
        set({ roleRates: get().roleRates.filter((r) => r.id !== id) });
      },
      upsertClause: (clause) => {
        const exists = get().clauseLibrary.find((c) => c.id === clause.id);
        const list = exists
          ? get().clauseLibrary.map((c) => (c.id === clause.id ? clause : c))
          : [...get().clauseLibrary, clause];
        set({ clauseLibrary: list });
      },
      removeClause: (id) => {
        set({ clauseLibrary: get().clauseLibrary.filter((c) => c.id !== id) });
      },
      seedIfEmpty: () => {
        const s = get();
        const patch: Partial<StoreState> = {};
        if (!s.proposals?.length) patch.proposals = SEED_PROPOSALS;
        if (!s.roleRates?.length) patch.roleRates = SEED_ROLES;
        if (!s.clauseLibrary?.length) patch.clauseLibrary = SEED_CLAUSES;
        if (Object.keys(patch).length) set(patch);
      },
    }),
    {
      name: "msi-smartbid-store",
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (s) => ({
        proposals: s.proposals,
        roleRates: s.roleRates,
        clauseLibrary: s.clauseLibrary,
      }),
    }
  )
);
