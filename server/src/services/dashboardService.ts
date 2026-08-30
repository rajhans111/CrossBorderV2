import type { Store } from "../store/store.js";
import { NotFoundError } from "../errors.js";
import { round2 } from "../util/money.js";

export function getExporterDashboard(store: Store) {
  const exporter = store.getExporter();
  if (!exporter) {
    throw new NotFoundError("No exporter configured");
  }
  const virtualAccount = store.getVirtualAccount(exporter.virtualAccountId);
  const orders = store.getAllOrders();
  const activeOrders = orders.filter((o) => o.status !== "Completed" && o.status !== "Refunded").length;

  let receivedThisMonthInr = 0;
  let fxSavedThisMonthInr = 0;
  for (const order of orders) {
    const quote = store.getFxQuote(order.id);
    if (quote) {
      receivedThisMonthInr += quote.netInr;
      fxSavedThisMonthInr += quote.savedVsBankInr;
    }
  }

  return {
    exporter,
    virtualAccount,
    inEscrowSgd: virtualAccount?.escrowBalanceSgd ?? 0,
    receivedThisMonthInr: round2(receivedThisMonthInr),
    fxSavedThisMonthInr: round2(fxSavedThisMonthInr),
    activeOrders,
    orders,
  };
}

export function getAdminOverview(store: Store) {
  return {
    exporter: store.getExporter(),
    orders: store.getAllOrders(),
    disputes: store.getAllDisputes(),
    screeningCases: store.getScreeningCases(),
    unmatchedCredits: store.getUnmatchedCredits(),
    complianceArtefacts: store.getComplianceArtefacts(),
    auditTrail: store.getAuditTrail(),
  };
}
