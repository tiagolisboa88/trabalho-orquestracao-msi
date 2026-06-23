"use client";

import { useEffect, useRef, useState } from "react";
import { getProgress } from "./api";
import type { ExecutionProgressDTO } from "./types";

const POLL_MS = 2500;

export function useExecutionProgress(executionId: string | null | undefined) {
  const [data, setData] = useState<ExecutionProgressDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef(false);

  useEffect(() => {
    stopRef.current = false;
    setData(null);
    setError(null);
    if (!executionId) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    async function tick() {
      try {
        const dto = await getProgress(executionId as string);
        if (stopRef.current) return;
        setData(dto);
        if (dto.state !== "completed" && dto.state !== "failed") {
          timer = setTimeout(tick, POLL_MS);
        }
      } catch (e: any) {
        if (stopRef.current) return;
        setError(String(e?.message ?? e));
        timer = setTimeout(tick, POLL_MS * 2);
      }
    }
    tick();
    return () => {
      stopRef.current = true;
      if (timer) clearTimeout(timer);
    };
  }, [executionId]);

  return { data, error };
}
