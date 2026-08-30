import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api";

export function DemoModeBar() {
  const queryClient = useQueryClient();
  const [justReset, setJustReset] = useState(false);

  const resetMutation = useMutation({
    mutationFn: api.resetDemoData,
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      setJustReset(true);
      setTimeout(() => setJustReset(false), 2000);
    },
  });

  return (
    <div className="flex items-center justify-between gap-3 bg-gray-900 px-6 py-2 text-sm text-white">
      <span className="font-medium tracking-wide">DEMO MODE</span>
      <div className="flex items-center gap-3">
        {justReset && <span className="text-emerald-400">Demo data reset ✓</span>}
        <button
          type="button"
          onClick={() => resetMutation.mutate()}
          disabled={resetMutation.isPending}
          className="rounded-md bg-white/10 px-3 py-1 font-medium hover:bg-white/20 disabled:opacity-50"
        >
          {resetMutation.isPending ? "Resetting…" : "Reset demo data"}
        </button>
        <button
          type="button"
          onClick={() => queryClient.invalidateQueries()}
          className="rounded-md bg-white/10 px-3 py-1 font-medium hover:bg-white/20"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
