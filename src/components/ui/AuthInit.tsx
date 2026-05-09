"use client";

import { useEffect } from "react";
import { getOrCreateUserId } from "@/lib/supabase/auth";
import { useStore } from "@/lib/store";

/**
 * Silently signs the visitor in as an anonymous Supabase user on first load.
 * Subsequent visits reuse the same session (stored in localStorage), giving
 * them a persistent identity without any signup friction.
 */
export function AuthInit() {
  const setUserId = useStore((s) => s.setUserId);
  const loadMyMoments = useStore((s) => s.loadMyMoments);
  const initHandle = useStore((s) => s.initHandle);

  useEffect(() => {
    getOrCreateUserId().then((id) => {
      if (!id) return;
      setUserId(id);
      loadMyMoments(id);
    });
    initHandle();
  }, [setUserId, loadMyMoments, initHandle]);

  return null;
}
