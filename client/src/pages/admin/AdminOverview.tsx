import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../api";
import { Card } from "../../components/Card";
import { QueryState } from "../../components/QueryState";
import { StatusPill } from "../../components/StatusPill";
import { formatDate, formatMoney } from "../../lib/format";

const SLA_WARN_HOURS = 72;

export function AdminOverview() {
  const queryClient = useQueryClient();
  const [showAllEvents, setShowAllEvents] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: api.getAdminOverview,
  });

  const approveMutation = useMutation({
    mutationFn: (exporterId: string) => api.approveKyc(exporterId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
  });

  const heldOrders = data
    ? data.orders
        .filter((o) => o.status === "InEscrow" || o.status === "Shipped" || o.status === "Disputed")
        .map((o) => {
          const heldSince = new Date(o.updatedAt).getTime();
          const hoursHeld = (Date.now() - heldSince) / (1000 * 60 * 60);
          return { order: o, hoursHeld };
        })
    : [];

  const visibleEvents = data
    ? showAllEvents
      ? data.auditTrail
      : data.auditTrail.filter((e) => e.privileged)
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Admin overview</h1>

      <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
        {data && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-3 font-semibold text-gray-900">KYC review</h2>
              {data.exporter && (
                <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{data.exporter.companyName}</p>
                    <p className="text-xs text-gray-500">GSTIN {data.exporter.gstin}</p>
                  </div>
                  {data.exporter.kycStatus === "Approved" ? (
                    <span className="text-xs font-medium text-green-700">Approved</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => approveMutation.mutate(data.exporter!.id)}
                      disabled={approveMutation.isPending}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                </div>
              )}
            </Card>

            <Card>
              <h2 className="mb-3 font-semibold text-gray-900">AML / screening</h2>
              {data.screeningCases.length === 0 ? (
                <p className="text-sm text-gray-400">No screening cases.</p>
              ) : (
                <ul className="space-y-2">
                  {data.screeningCases.map((c) => (
                    <li key={c.id} className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {c.entityName} <span className="text-xs text-gray-500">({c.list})</span>
                      </p>
                      <p className="text-xs text-amber-800">{c.status.replace(/_/g, " ")}</p>
                      <p className="mt-1 text-xs text-gray-600">{c.note}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <h2 className="mb-3 font-semibold text-gray-900">Escrow SLA monitoring</h2>
              {heldOrders.length === 0 ? (
                <p className="text-sm text-gray-400">No orders currently holding funds.</p>
              ) : (
                <ul className="space-y-2">
                  {heldOrders.map(({ order, hoursHeld }) => (
                    <li
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{order.reference}</p>
                        <p className="text-xs text-gray-500">{formatMoney(order.amount, order.currency)}</p>
                      </div>
                      <div className="text-right">
                        <StatusPill status={order.status} />
                        <p
                          className={`mt-1 text-xs ${hoursHeld > SLA_WARN_HOURS ? "font-medium text-red-600" : "text-gray-400"}`}
                        >
                          Held {Math.round(hoursHeld)}h
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <h2 className="mb-3 font-semibold text-gray-900">Unmatched VA credits</h2>
              {data.unmatchedCredits.length === 0 ? (
                <p className="text-sm text-gray-400">Nothing unmatched.</p>
              ) : (
                <ul className="space-y-2">
                  {data.unmatchedCredits.map((c) => (
                    <li key={c.id} className="rounded-lg border border-gray-100 px-4 py-2 text-sm">
                      <p className="font-medium text-gray-900">
                        {formatMoney(c.amount, c.currency)} — {c.remitterName}
                      </p>
                      <p className="text-xs text-gray-500">{c.note}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Audit trail</h2>
                <label className="flex items-center gap-2 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={showAllEvents}
                    onChange={(e) => setShowAllEvents(e.target.checked)}
                  />
                  Show all events (not just privileged)
                </label>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 border-b border-gray-100 bg-white text-xs uppercase text-gray-400">
                    <tr>
                      <th className="py-2 pr-4">When</th>
                      <th className="py-2 pr-4">Event</th>
                      <th className="py-2 pr-4">Actor</th>
                      <th className="py-2 pr-4">Entity</th>
                      <th className="py-2">Privileged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[...visibleEvents].reverse().map((e) => (
                      <tr key={e.id}>
                        <td className="py-2 pr-4 text-gray-500">{formatDate(e.when)}</td>
                        <td className="py-2 pr-4 font-mono text-xs text-gray-800">{e.event}</td>
                        <td className="py-2 pr-4 text-gray-600">{e.actor}</td>
                        <td className="py-2 pr-4 text-gray-600">{e.entity}</td>
                        <td className="py-2">{e.privileged ? "Yes" : ""}</td>
                      </tr>
                    ))}
                    {visibleEvents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-400">
                          No events to show.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </QueryState>
    </div>
  );
}
