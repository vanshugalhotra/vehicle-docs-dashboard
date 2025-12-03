"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { apiRoutes } from "@/lib/apiRoutes";

interface TriggerReminderPayload {
  triggeredBy?: string;
  preface?: string;
}

const default_preface =
  "Greetings! Here's your document expiry summary as requested.\n\nPlease review the documents below and take necessary action for any expiring or expired items.";

export function useTriggerReminder() {
  const mutation = useMutation({
    mutationFn: async (payload?: TriggerReminderPayload) => {
      // 1) FIRST → RESCHEDULE
      await fetchWithAuth(apiRoutes.reminder_reschedule.base, {
        method: "POST",
      });

      // 2) THEN → TRIGGER REMINDER
      return await fetchWithAuth(apiRoutes.reminder_trigger.base, {
        method: "POST",
        body: JSON.stringify({
          triggeredBy: payload?.triggeredBy ?? "Manual: Reminders Page",
          preface: payload?.preface ?? default_preface,
        }),
      });
    },
  });

  return {
    trigger: (payload?: TriggerReminderPayload) =>
      mutation.mutateAsync(payload),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
