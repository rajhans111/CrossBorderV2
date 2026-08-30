import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api";
import { Card } from "../../components/Card";
import { QueryState } from "../../components/QueryState";
import { StatusPill } from "../../components/StatusPill";
import { formatMoney } from "../../lib/format";

export function BuyerWorkspace() {
  const { token = "" } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["buyer-workspace", token],
    queryFn: () => api.getBuyerWorkspace(token),
  });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-primary">Setu</p>
          <p className="text-sm text-gray-500">Buyer workspace</p>
        </div>

        <QueryState isLoading={isLoading} error={error}>
          {data && (
            <>
              <Card>
                <p className="text-sm text-gray-500">{data.buyer.country}</p>
                <h1 className="text-lg font-semibold text-gray-900">{data.buyer.name}</h1>
                <p className="text-sm text-gray-500">{data.buyer.email}</p>
              </Card>

              <Card className="p-0">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="font-semibold text-gray-900">Your orders ({data.orders.length})</h2>
                </div>
                {data.orders.length === 0 ? (
                  <p className="p-6 text-sm text-gray-400">No orders yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {data.orders.map((order) => (
                      <li key={order.id}>
                        <Link
                          to={`/buyer/${order.buyerToken}`}
                          className="flex items-center justify-between gap-3 px-6 py-4 hover:bg-gray-50"
                        >
                          <div>
                            <p className="text-sm font-medium text-primary">{order.reference}</p>
                            <p className="text-sm text-gray-700">{order.product}</p>
                            <p className="text-xs text-gray-400">{formatMoney(order.amount, order.currency)}</p>
                          </div>
                          <StatusPill status={order.status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </>
          )}
        </QueryState>
      </div>
    </div>
  );
}
