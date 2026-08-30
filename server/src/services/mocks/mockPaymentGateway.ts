import type { PaymentGateway } from "../interfaces/paymentGateway.js";
import type { EscrowServiceInterface } from "../interfaces/escrowService.js";
import { transitionOrder } from "../orderService.js";

export function createMockPaymentGateway(escrowService: EscrowServiceInterface): PaymentGateway {
  return {
    processPayment(store, reference) {
      const updated = transitionOrder(store, reference, { type: "PAYMENT_RECEIVED" }, "mock_bank");
      escrowService.hold(store, updated);
      return updated;
    },
  };
}
