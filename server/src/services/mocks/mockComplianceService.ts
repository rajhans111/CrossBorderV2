import type { ComplianceServiceInterface } from "../interfaces/complianceService.js";

export const mockComplianceService: ComplianceServiceInterface = {
  fileArtefacts(store, order) {
    const edpms = store.addComplianceArtefact({
      orderId: order.id,
      type: "EDPMS",
      status: "Pending Ad Bank Ack",
    });
    const firc = store.addComplianceArtefact({ orderId: order.id, type: "FIRC", status: "Issued" });
    const ebrc = store.addComplianceArtefact({ orderId: order.id, type: "eBRC", status: "Issued" });

    store.addAuditEvent({
      event: "compliance.filed",
      actor: "system",
      entity: `TradeOrder:${order.reference}`,
      privileged: false,
    });

    return [edpms, firc, ebrc];
  },
};
