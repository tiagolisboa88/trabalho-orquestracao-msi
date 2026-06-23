"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function StoreBootstrap() {
  const seedIfEmpty = useStore((s) => s.seedIfEmpty);
  const hydrated = useStore((s) => s.hydrated);
  useEffect(() => {
    if (hydrated) seedIfEmpty();
  }, [hydrated, seedIfEmpty]);
  return null;
}
