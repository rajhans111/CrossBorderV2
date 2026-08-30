import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { Card } from "../../components/Card";
import { QueryState } from "../../components/QueryState";
import { StatusPill } from "../../components/StatusPill";
import { formatMoney } from "../../lib/format";

export function VirtualAccountPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["virtual-accounts"],
    queryFn: api.getVirtualAccounts,
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Virtual accounts</h1>
        <p className="text-sm text-gray-500">One virtual account per currency you trade in.</p>
      </div>

      <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
        <div className="space-y-6">
          {data?.accounts.map((account) => (
            <Card key={account.id}>
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  {account.currency}
                </span>
                <span className="text-lg font-semibold text-primary">
                  {formatMoney(account.escrowBalance, account.currency)}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-gray-400">Account number</dt>
                  <dd className="font-medium text-gray-900">{account.accountNo}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Bank</dt>
                  <dd className="font-medium text-gray-900">{account.bankName}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">SWIFT</dt>
                  <dd className="font-medium text-gray-900">{account.swift}</dd>
                </div>
              </dl>

              {account.heldPositions.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Funds currently held
                  </p>
                  <ul className="divide-y divide-gray-100">
                    {account.heldPositions.map((p) => (
                      <li key={p.reference} className="flex items-center justify-between py-2 text-sm">
                        <Link
                          to={`/exporter/orders/${p.reference}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {p.reference}
                        </Link>
                        <span className="text-gray-700">{formatMoney(p.amount, account.currency)}</span>
                        <StatusPill status={p.status === "Disputed" ? "Disputed" : "InEscrow"} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
