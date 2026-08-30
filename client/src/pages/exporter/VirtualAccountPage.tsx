import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { Card } from "../../components/Card";
import { QueryState } from "../../components/QueryState";
import { StatusPill } from "../../components/StatusPill";
import { formatSgd } from "../../lib/format";

export function VirtualAccountPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["virtual-account"],
    queryFn: api.getVirtualAccount,
  });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Virtual SGD account</h1>
      <QueryState isLoading={isLoading} error={error}>
        {data && (
          <>
            <Card>
              <dl className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <dt className="text-gray-400">Account number</dt>
                  <dd className="font-medium text-gray-900">{data.accountNo}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Bank</dt>
                  <dd className="font-medium text-gray-900">{data.bankName}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">SWIFT</dt>
                  <dd className="font-medium text-gray-900">{data.swift}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Escrow balance</dt>
                  <dd className="text-lg font-semibold text-primary">{formatSgd(data.escrowBalanceSgd)}</dd>
                </div>
              </dl>
            </Card>

            <Card>
              <h2 className="mb-3 font-semibold text-gray-900">Funds currently held</h2>
              {data.heldPositions.length === 0 ? (
                <p className="text-sm text-gray-400">No funds currently held in escrow.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {data.heldPositions.map((p) => (
                    <li key={p.reference} className="flex items-center justify-between py-2 text-sm">
                      <Link to={`/exporter/orders/${p.reference}`} className="font-medium text-primary hover:underline">
                        {p.reference}
                      </Link>
                      <span className="text-gray-700">{formatSgd(p.amountSgd)}</span>
                      <StatusPill status={p.status === "Disputed" ? "Disputed" : "InEscrow"} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        )}
      </QueryState>
    </div>
  );
}
