import type { TradeOrderStatus } from "@setu/types";

const STATUS_STYLES: Record<TradeOrderStatus, string> = {
  Created: "bg-teal-100 text-teal-800",
  PaymentAwaited: "bg-amber-100 text-amber-800",
  InEscrow: "bg-amber-100 text-amber-800",
  Shipped: "bg-teal-100 text-teal-800",
  DeliveryConfirmed: "bg-teal-100 text-teal-800",
  FxSettled: "bg-emerald-100 text-emerald-800",
  Completed: "bg-green-100 text-green-800",
  Disputed: "bg-red-100 text-red-800",
  Refunded: "bg-gray-200 text-gray-700",
};

const STATUS_LABELS: Record<TradeOrderStatus, string> = {
  Created: "Created",
  PaymentAwaited: "Payment Awaited",
  InEscrow: "In Escrow",
  Shipped: "Shipped",
  DeliveryConfirmed: "Delivery Confirmed",
  FxSettled: "FX Settled",
  Completed: "Completed",
  Disputed: "Disputed",
  Refunded: "Refunded",
};

export function StatusPill({ status }: { status: TradeOrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
