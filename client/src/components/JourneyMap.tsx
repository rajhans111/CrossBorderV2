import type { TradeOrderStatus } from "@setu/types";

const MAIN_STEPS: { status: TradeOrderStatus; label: string }[] = [
  { status: "Created", label: "Created" },
  { status: "PaymentAwaited", label: "Payment Awaited" },
  { status: "InEscrow", label: "In Escrow" },
  { status: "Shipped", label: "Shipped" },
  { status: "DeliveryConfirmed", label: "Delivery Confirmed" },
  { status: "FxSettled", label: "FX Settled" },
  { status: "Completed", label: "Completed" },
];

export function JourneyMap({
  status,
  branchedFromStatus,
}: {
  status: TradeOrderStatus;
  /** Set when status is Disputed/Refunded: the main-path status it branched off from. */
  branchedFromStatus?: TradeOrderStatus;
}) {
  const isBranched = status === "Disputed" || status === "Refunded";
  const currentIndex = MAIN_STEPS.findIndex((s) => s.status === (isBranched ? branchedFromStatus : status));

  return (
    <div>
      {MAIN_STEPS.map((step, i) => {
        const done = i < currentIndex || (i === currentIndex && !isBranched);
        const isCurrent = i === currentIndex && !isBranched;
        const isLastRow = i === MAIN_STEPS.length - 1 && !isBranched;

        return (
          <div key={step.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`h-3 w-3 shrink-0 rounded-full border-2 ${
                  done || isCurrent ? "border-primary bg-primary" : "border-gray-300 bg-white"
                }`}
              />
              {!isLastRow && <span className="w-px grow bg-gray-200" />}
            </div>
            <div className={isLastRow ? "" : "pb-5"}>
              <p
                className={`text-sm ${
                  isCurrent ? "font-semibold text-primary" : done ? "font-medium text-gray-900" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
              {isCurrent && <p className="text-xs text-gray-400">Now</p>}
            </div>
          </div>
        );
      })}

      {isBranched && (
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`h-3 w-3 shrink-0 rounded-full border-2 ${
                status === "Disputed" ? "border-red-500 bg-red-500" : "border-gray-400 bg-gray-400"
              }`}
            />
          </div>
          <div>
            <p className={`text-sm font-semibold ${status === "Disputed" ? "text-red-700" : "text-gray-600"}`}>
              {status === "Disputed" ? "Disputed" : "Refunded"}
            </p>
            <p className="text-xs text-gray-400">Now</p>
          </div>
        </div>
      )}
    </div>
  );
}
