"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

export function useEditFromQuery<T>(
  baseUrl: string, // e.g. "/api/vehicles"
  editFn: (record: T) => void, // how to open edit mode
  focusFn?: () => void // optional scroll/focus
) {
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const triggered = useRef(false);

  useEffect(() => {
    if (!editId || triggered.current) return;

    triggered.current = true;

    (async () => {
      try {
        const record = (await fetchWithAuth(`${baseUrl}/${editId}`)) as T;

        if (record) {
          editFn(record);
          focusFn?.();
        }
      } catch (err) {
        console.error("Failed to fetch item via editId:", err);
      }
    })();
  }, [editId, editFn, focusFn, baseUrl]);

  return { editId };
}
