import type { ComplianceArtefact, TradeOrder } from "@setu/types";
import type { Store } from "../../store/store.js";

export interface ComplianceServiceInterface {
  /** Files the mock EDPMS/e-FIRC/eBRC artefacts once an order's FX has settled. */
  fileArtefacts(store: Store, order: TradeOrder): ComplianceArtefact[];
}
