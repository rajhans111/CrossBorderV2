import type { ReactNode } from "react";

export function QueryState({
  isLoading,
  error,
  children,
}: {
  isLoading: boolean;
  error: unknown;
  children: ReactNode;
}) {
  if (isLoading) {
    return <p className="p-6 text-sm text-gray-500">Loading…</p>;
  }
  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error instanceof Error ? error.message : "Something went wrong."}
      </p>
    );
  }
  return <>{children}</>;
}
