import type { ReactNode } from "react";

export function QueryState({
  isLoading,
  error,
  onRetry,
  children,
}: {
  isLoading: boolean;
  error: unknown;
  /** Pass the query's refetch function so a failed load can be retried in place. */
  onRetry?: () => void;
  children: ReactNode;
}) {
  if (isLoading) {
    return <p className="p-6 text-sm text-gray-500">Loading…</p>;
  }
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>{error instanceof Error ? error.message : "Something went wrong."}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            Retry
          </button>
        )}
      </div>
    );
  }
  return <>{children}</>;
}
