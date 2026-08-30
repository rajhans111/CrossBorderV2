import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ShippingDocType } from "@setu/types";
import { api } from "../../api";
import { Card } from "../../components/Card";
import { JourneyMap } from "../../components/JourneyMap";
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
  const buyerWorkspaceLink = order?.buyer
    ? `${window.location.origin}/buyer-workspace/${order.buyer.portalToken}`
    : "";

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
            {transitionMutation.isError && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {(transitionMutation.error as Error).message}
              </p>
            )}

            <Card>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Order detail</p>
              <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm text-primary">{order.reference}</p>
                      <h1 className="text-lg font-semibold text-gray-900">{order.buyer?.name}</h1>
                      <p className="text-sm text-gray-500">
                        {formatSgd(order.amountSgd)} · {order.product}
                      </p>
                    </div>
                    <StatusPill status={order.status} />
                  </div>
                  <div className="mt-6">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Payment timeline
                    </p>
                    <JourneyMap
                      status={order.status}
                      branchedFromStatus={
                        order.status === "Disputed" || order.status === "Refunded"
                          ? order.dispute?.previousStatus
                          : undefined
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4 border-gray-100 lg:border-l lg:pl-8">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Related actions</p>

                  {order.invoice ? (
                    <div className="text-sm text-gray-700">
                      <p className="font-medium text-gray-900">{order.invoice.invoiceNo}</p>
                      <p className="text-xs text-gray-500">Total due: {formatSgd(order.invoice.totalDue)}</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => invoiceMutation.mutate()}
                      disabled={invoiceMutation.isPending}
                      className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Generate invoice
                    </button>
                  )}

                  {order.status === "Created" && (
                    <button
                      type="button"
                      onClick={() => transitionMutation.mutate("MARK_PAYMENT_AWAITED")}
                      disabled={transitionMutation.isPending}
                      className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Mark payment awaited
                    </button>
                  )}
                  {order.status === "InEscrow" && (
                    <button
                      type="button"
                      onClick={() => transitionMutation.mutate("MARK_SHIPPED")}
                      disabled={
                        transitionMutation.isPending || !order.shippingDocs.every((d) => d.status === "confirmed")
                      }
                      className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
                        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        Resolve dispute
                      </button>
                      <button
                        type="button"
                        onClick={() => transitionMutation.mutate("REFUND")}
                        disabled={transitionMutation.isPending}
                        className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-50"
                      >
                        Refund buyer
                      </button>
                    </>
                  )}

                  <div className="space-y-3 border-t border-gray-100 pt-4 text-sm">
                    <div>
                      <p className="mb-1 text-gray-500">
                        Buyer order:{" "}
                        <a
                          href={buyerLink}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-primary hover:underline"
                        >
                          {buyerLink}
                        </a>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(buyerLink);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {copied ? "Copied!" : "Copy link"}
                      </button>
                    </div>

                    {buyerWorkspaceLink && (
                      <p className="text-gray-500">
                        Buyer workspace:{" "}
                        <a
                          href={buyerWorkspaceLink}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-primary hover:underline"
                        >
                          {buyerWorkspaceLink}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

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
                    <p className="text-sm text-gray-400">Not yet generated — see Related actions above.</p>
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
