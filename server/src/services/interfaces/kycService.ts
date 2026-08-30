import type { Exporter } from "@setu/types";
import type { Store } from "../../store/store.js";

export interface KycServiceInterface {
  approve(store: Store, exporterId: string): Exporter;
}
