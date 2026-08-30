import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export function App() {
  const health = useQuery({ queryKey: ["health"], queryFn: api.getHealth });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full">
        <h1 className="text-2xl font-semibold text-primary">Setu</h1>
        <p className="mt-2 text-gray-600">
          Cross-border trade + payment workflow platform (MVP scaffold).
        </p>
        <div className="mt-4 text-sm">
          <span className="font-medium">Server status: </span>
          {health.isLoading && <span className="text-gray-500">checking...</span>}
          {health.isError && <span className="text-red-600">unreachable</span>}
          {health.data && (
            <span className="text-emerald-600">
              {health.data.status} ({health.data.service})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
