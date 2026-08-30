import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import type { TradeOrderStatus } from "@setu/types";
import { api } from "../../api";
import { Card } from "../../components/Card";
import { QueryState } from "../../components/QueryState";
import { StatusPill } from "../../components/StatusPill";
import { formatMoney } from "../../lib/format";

const STATUSES: TradeOrderStatus[] = [
  "Created",
  "PaymentAwaited",
  "InEscrow",
  "Shipped",
  "DeliveryConfirmed",
  "FxSettled",
  "Completed",
  "Disputed",
  "Refunded",
];

export function OrdersList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get("status") ?? "") as TradeOrderStatus | "";
  const search = searchParams.get("search") ?? "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", status, search],
    queryFn: () => api.listOrders({ status: status || undefined, search: search || undefined }),
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
        <Link
          to="/exporter/orders/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          New order
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => updateParam("status", e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="search"
          defaultValue={search}
          onChange={(e) => updateParam("search", e.target.value)}
          placeholder="Search reference, product, buyer…"
          className="min-w-64 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <Card className="p-0">
        <QueryState isLoading={isLoading} error={error}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-6 py-3">Reference</th>
                  <th className="px-6 py-3">Buyer</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <Link
                        to={`/exporter/orders/${order.reference}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {order.reference}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-700">{order.buyerName}</td>
                    <td className="px-6 py-3 text-gray-700">{order.product}</td>
                    <td className="px-6 py-3 text-gray-700">{formatMoney(order.amount, order.currency)}</td>
                    <td className="px-6 py-3">
                      <StatusPill status={order.status} />
                    </td>
                  </tr>
                ))}
                {data?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No orders match.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </QueryState>
      </Card>
    </div>
  );
}
