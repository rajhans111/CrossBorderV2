import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import type { DisputeReason } from "@setu/types";
import { api } from "../../api";
import { Card } from "../../components/Card";
import { QueryState } from "../../components/QueryState";
import { StatusPill } from "../../components/StatusPill";
import { formatSgd } from "../../lib/format";

const DISPUTE_REASONS: { value: DisputeReason; label: string }[] = [
  { value: "goods_not_received", label: "Goods not received" },
  { value: "damaged", label: "Goods damaged" },
  { value: "quantity_mismatch", label: "Quantity mismatch" },
  { value: "quality_issue", label: "Quality issue" },
];

export function BuyerPortal() {
  const { token = "" } = useParams();
  const queryClient = useQueryClient();
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [reason, setReason] = useState<DisputeReason>("goods_not_received");

  const { data, isLoading, error } = useQuery({
    queryKey: ["buyer-portal", token],
    queryFn: () => api.getBuyerPortal(token),
  });

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: ["buyer-portal", token] });
  }

  const payMutation = useMutation({ mutationFn: () => api.buyerPay(token), onSuccess: invalidate });
  const confirmMutation = useMutation({ mutationFn: () => api.buyerConfirm(token), onSuccess: invalidate });
  const disputeMutation = useMutation({
    mutationFn: () => api.buyerDispute(token, reason),
    onSuccess: async () => {
      setShowDisputeForm(false);
      await invalidate();
    },
  });

  const mutationError = payMutation.error ?? confirmMutation.error ?? disputeMutation.error;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-primary">Setu</p>
          <p className="text-sm text-gray-500">Buyer portal</p>
        </div>

        <QueryState isLoading={isLoading} error={error}>
          {data && (
            <>
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">{data.order.reference}</p>
                    <p className="font-semibold text-gray-900">{data.order.product}</p>
                  </div>
                  <StatusPill status={data.order.status} />
                </div>
                <p className="mt-3 text-2xl font-semibold text-gray-900">{formatSgd(data.order.amountSgd)}</p>
              </Card>

              {mutationError && (
                <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {(mutationError as Error).message}
                </p>
              )}

              {data.order.status === "PaymentAwaited" && data.virtualAccount && (
                <Card>
                  <h2 className="mb-2 font-semibold text-gray-900">Pay into escrow</h2>
                  <dl className="mb-4 space-y-1 text-sm text-gray-700">
                    <div>
                      <dt className="inline text-gray-400">Bank: </dt>
                      <dd className="inline">{data.virtualAccount.bankName}</dd>
                    </div>
                    <div>
                      <dt className="inline text-gray-400">Account: </dt>
                      <dd className="inline">{data.virtualAccount.accountNo}</dd>
                    </div>
                    <div>
                      <dt className="inline text-gray-400">SWIFT: </dt>
                      <dd className="inline">{data.virtualAccount.swift}</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => payMutation.mutate()}
                    disabled={payMutation.isPending}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {payMutation.isPending ? "Processing…" : "Simulate payment (demo)"}
                  </button>
                </Card>
              )}

              {data.escrowPosition && (
                <Card>
                  <h2 className="mb-1 font-semibold text-gray-900">Funds in escrow</h2>
                  <p className="text-sm text-gray-600">
                    {formatSgd(data.escrowPosition.amountSgd)} held — released once you confirm delivery.
                  </p>
                </Card>
              )}

              {data.order.status === "Shipped" && (
                <Card>
                  <h2 className="mb-2 font-semibold text-gray-900">Confirm delivery</h2>
                  <p className="mb-4 text-sm text-gray-600">
                    Once you've received the goods, confirm delivery to release escrow to the exporter.
                  </p>
                  <button
                    type="button"
                    onClick={() => confirmMutation.mutate()}
                    disabled={confirmMutation.isPending}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {confirmMutation.isPending ? "Confirming…" : "Confirm delivery"}
                  </button>
                </Card>
              )}

              {data.dispute ? (
                <Card className="border-red-200 bg-red-50">
                  <h2 className="mb-1 font-semibold text-red-900">Dispute {data.dispute.status}</h2>
                  <p className="text-sm text-red-800">Reason: {data.dispute.reason.replace(/_/g, " ")}</p>
                </Card>
              ) : (
                (data.order.status === "InEscrow" || data.order.status === "Shipped") && (
                  <Card>
                    {!showDisputeForm ? (
                      <button
                        type="button"
                        onClick={() => setShowDisputeForm(true)}
                        className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        Raise a dispute
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <h2 className="font-semibold text-gray-900">Raise a dispute</h2>
                        <select
                          value={reason}
                          onChange={(e) => setReason(e.target.value as DisputeReason)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                          {DISPUTE_REASONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => disputeMutation.mutate()}
                            disabled={disputeMutation.isPending}
                            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                          >
                            Submit dispute
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDisputeForm(false)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              )}

              {data.order.status === "Completed" && (
                <Card className="border-green-200 bg-green-50 text-center">
                  <p className="font-semibold text-green-900">Order complete — thank you!</p>
                </Card>
              )}

              {data.buyer && (
                <p className="text-center text-sm">
                  <a href={`/buyer-workspace/${data.buyer.portalToken}`} className="text-primary hover:underline">
                    View all your orders →
                  </a>
                </p>
              )}
            </>
          )}
        </QueryState>
      </div>
    </div>
  );
}
