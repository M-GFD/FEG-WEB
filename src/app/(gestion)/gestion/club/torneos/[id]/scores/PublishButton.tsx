"use client";

import React, { useTransition } from "react";
import { publishTournamentScores } from "./actions";
import { Button } from "@/components/ui/button";

export function PublishButton({ tournamentId }: { tournamentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = React.useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  return (
    <div className="mt-6">
      <form
        action={() => {
          startTransition(async () => {
            const result = await publishTournamentScores(tournamentId);
            if (result.ok) {
              setMessage({ type: "ok", text: result.message ?? "Publicado" });
            } else {
              setMessage({ type: "error", text: result.error ?? "Error" });
            }
          });
        }}
      >
        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          className="px-8"
        >
          {isPending ? "Publicando..." : "Publicar resultados"}
        </Button>
      </form>
      {message && (
        <p
          className={`mt-3 rounded p-3 text-sm ${
            message.type === "ok"
              ? "bg-[var(--feg-green-2)]/10 text-[var(--feg-green-2)]"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
