import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ShippingDocType } from "@setu/types";
import { api } from "../../api";
import { Card } from "../../components/Card";
import { QueryState } from "../../components/QueryState";
import { StatusPill } from "../../components/StatusPill";
import { formatDate, formatInr, formatSgd } from "../../lib/format";

const DOC_LABELS: Record<ShippingDocType, string> = {
  packing_list: "Packing list",
  bill_of_lading: "Bill of lading",
  certificate_of_origin: "Certificate of origin",
  shipping_bill_leo: "Shipping bill / LEO",
};

export function OrderDetail() {
  const { ref = "" } = useParams();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", ref],
    queryFn: () => api.getOrder(ref),
  });

  function invalidate() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["order", ref] }),
      queryClient.invalidateQueries({ queryKey: ["orders"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
  }

  const transitionMutation = useMutation({
    mutationFn: (type: "MARK_PAYMENT_AWAITED" | "MARK_SHIPPED" | "RESOLVE_DISPUTE" | "REFUND") =>
      api.transitionOrder(ref, type),
    onSuccess: invalidate,
  });
  const invoiceMutation = useMutation({ mutationFn: () => api.generateInvoice(ref), onSuccess: invalidate });
  const shippingDocMutation = useMutation({
    mutationFn: (type: ShippingDocType) => api.generateShippingDoc(ref, type),
    onSuccess: invalidate,
  });

  const buyerLink = order ? `${window.location.origin}/buyer/${order.buyerToken}` : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/exporter/orders" className="text-sm text-gray-500 hover:underline">
          ← Orders
        </Link>
      </div>

      <QueryState isLoading={isLoading} error={error}>
        {order && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{order.reference}</h1>
                <p className="text-sm text-gray-500">{order.product}</p>
              </div>
              <StatusPill status={order.status} />
            </div>

            {transitionMutation.isError && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {(transitionMutation.error as Error).message}
              </p>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Card>
                  <h2 className="mb-4 font-semibold text-gray-900">Order details</h2>
                  <dl className="grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-gray-400">Buyer</dt>
                      <dd className="text-gray-900">{order.buyer?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Amount</dt>
                      <dd className="text-gray-900">{formatSgd(order.amountSgd)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Quantity</dt>
                      <dd className="text-gray-900">{order.quantity.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Incoterm</dt>
                      <dd className="text-gray-900">{order.incoterm}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Payment terms</dt>
                      <dd className="text-gray-900">{order.paymentTerms}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">HS code</dt>
                      <dd className="text-gray-900">{order.hsCode}</dd>
                    </div>
                  </dl>
                </Card>

                <Card>
                  <h2 className="mb-4 font-semibold text-gray-900">Shipping documents</h2>
                  <ul className="space-y-2">
                    {order.shippingDocs.map((doc, i) => {
                      const priorConfirmed = order.shippingDocs.slice(0, i).every((d) => d.status === "confirmed");
                      return (
                        <li
                          key={doc.type}
                          className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2"
                        >
                          <span className="text-sm text-gray-700">{DOC_LABELS[doc.type]}</span>
                          {doc.status === "confirmed" ? (
                            <span className="text-xs font-medium text-green-700">Confirmed</span>
                          ) : (
                            <button
                              type="button"
                              disabled={!priorConfirmed || shippingDocMutation.isPending}
                              onClick={() => shippingDocMutation.mutate(doc.type)}
                              className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white disabled:opacity-40"
                            >
                              Generate
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </Card>

                <Card>
                  <h2 className="mb-4 font-semibold text-gray-900">Invoice</h2>
                  {order.invoice ? (
                    <div className="text-sm text-gray-700">
                      <p className="font-medium text-gray-900">{order.invoice.invoiceNo}</p>
                      <p>Total due: {formatSgd(order.invoice.totalDue)}</p>
                      <p className="mt-1 text-gray-500">{order.invoice.paymentInstructions}</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => invoiceMutation.mutate()}
                      disabled={invoiceMutation.isPending}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Generate invoice
                    </button>
                  )}
                </Card>

                {order.dispute && (
                  <Card className="border-red-200 bg-red-50">
                    <h2 className="mb-2 font-semibold text-red-900">Dispute</h2>
                    <p className="text-sm text-red-800">
                      Reason: {order.dispute.reason.replace(/_/g, " ")} · Opened by {order.dispute.openedBy} ·{" "}
                      {order.dispute.status}
                    </p>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <h2 className="mb-3 font-semibold text-gray-900">Actions</h2>
                  <div className="flex flex-col gap-2">
                    {order.status === "Created" && (
                      <button
                        type="button"
                        onClick={() => transitionMutation.mutate("MARK_PAYMENT_AWAITED")}
                        disabled={transitionMutation.isPending}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        Mark payment awaited
                      </button>
                    )}
                    {order.status === "InEscrow" && (
                      <button
                        type="button"
                        onClick={() => transitionMutation.mutate("MARK_SHIPPED")}
                        disabled={
                          transitionMutation.isPending ||
                          !order.shippingDocs.every((d) => d.status === "confirmed")
                        }
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        Mark shipped
                      </button>
                    )}
                    {order.status === "Disputed" && (
                      <>
                        <button
                          type="button"
                          onClick={() => transitionMutation.mutate("RESOLVE_DISPUTE")}
                          disabled={transitionMutation.isPending}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          Resolve dispute (back into flow)
                        </button>
                        <button
                          type="button"
                          onClick={() => transitionMutation.mutate("REFUND")}
                          disabled={transitionMutation.isPending}
                          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-50"
                        >
                          Refund buyer
                        </button>
                      </>
                    )}
                    {["PaymentAwaited", "Shipped", "DeliveryConfirmed", "FxSettled", "Completed", "Refunded"].includes(
                      order.status,
                    ) && <p className="text-sm text-gray-400">No exporter action pending.</p>}
                  </div>
                </Card>

                <Card>
                  <h2 className="mb-3 font-semibold text-gray-900">Buyer magic link</h2>
                  <p className="mb-2 break-all rounded-lg bg-gray-50 p-2 text-xs text-gray-600">{buyerLink}</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(buyerLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                </Card>

                {order.escrowPosition && (
                  <Card>
                    <h2 className="mb-2 font-semibold text-gray-900">Escrow</h2>
                    <p className="text-sm text-gray-700">
                      {formatSgd(order.escrowPosition.amountSgd)} · {order.escrowPosition.status}
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-gray-500">
                      {order.escrowPosition.events.map((e, i) => (
                        <li key={i}>
                          {formatDate(e.when)} — {e.event}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {order.fxQuote && (
                  <Card>
                    <h2 className="mb-2 font-semibold text-gray-900">FX settlement</h2>
                    <p className="text-sm text-gray-700">Rate: {order.fxQuote.rateSgdInr} SGD/INR</p>
                    <p className="text-sm text-gray-700">Net credited: {formatInr(order.fxQuote.netInr)}</p>
                    <p className="text-sm text-emerald-700">
                      Saved vs. bank: {formatInr(order.fxQuote.savedVsBankInr)}
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </QueryState>
    </div>
  );
}
