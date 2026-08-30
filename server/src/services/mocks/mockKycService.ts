import type { KycServiceInterface } from "../interfaces/kycService.js";
import { NotFoundError } from "../../errors.js";

export const mockKycService: KycServiceInterface = {
  approve(store, exporterId) {
    const exporter = store.getExporterById(exporterId);
    if (!exporter) {
      throw new NotFoundError(`No exporter with id "${exporterId}"`);
    }

    const updated = { ...exporter, kycStatus: "Approved" as const };
    store.saveExporter(updated);
    store.addAuditEvent({
      event: "kyc.approved",
      actor: "ops",
      entity: `Exporter:${updated.companyName}`,
      privileged: true,
    });
    return updated;
  },
};
