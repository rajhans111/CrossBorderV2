import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { Card } from "../../components/Card";
import { QueryState } from "../../components/QueryState";
import { StatusPill } from "../../components/StatusPill";
import { formatInr, formatMoney } from "../../lib/format";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </Card>
  );
}

export function Dashboard() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["dashboard"], queryFn: api.getDashboard });
  const primaryCurrency = data?.virtualAccount?.currency ?? "SGD";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">{data?.exporter.companyName}</p>
      </div>

      <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
        {data && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label={`In Escrow (${primaryCurrency})`} value={formatMoney(data.inEscrowSgd, primaryCurrency)} />
              <StatCard label="Received this month" value={formatInr(data.receivedThisMonthInr)} />
              <StatCard label="Active orders" value={String(data.activeOrders)} />
              <StatCard label="FX saved this month" value={formatInr(data.fxSavedThisMonthInr)} />
            </div>

            {data.virtualAccounts.some((a) => a.currency !== primaryCurrency && a.escrowBalance > 0) && (
              <Card>
                <p className="mb-2 text-sm font-medium text-gray-900">Other currency balances</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                  {data.virtualAccounts
                    .filter((a) => a.currency !== primaryCurrency && a.escrowBalance > 0)
                    .map((a) => (
                      <span key={a.currency}>{formatMoney(a.escrowBalance, a.currency)}</span>
                    ))}
                </div>
              </Card>
            )}

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent orders</h2>
                <Link to="/exporter/orders" className="text-sm font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-gray-400">
                    <tr>
                      <th className="pb-2 pr-4">Reference</th>
                      <th className="pb-2 pr-4">Product</th>
                      <th className="pb-2 pr-4">Amount</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.orders.slice(0, 8).map((order) => (
                      <tr key={order.id}>
                        <td className="py-2 pr-4">
                          <Link
                            to={`/exporter/orders/${order.reference}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {order.reference}
                          </Link>
                        </td>
                        <td className="py-2 pr-4 text-gray-700">{order.product}</td>
                        <td className="py-2 pr-4 text-gray-700">{formatMoney(order.amount, order.currency)}</td>
                        <td className="py-2">
                          <StatusPill status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </QueryState>
    </div>
  );
}
