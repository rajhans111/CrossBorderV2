import { createHash, randomUUID } from "node:crypto";
import type {
  AuditEvent,
  Buyer,
  ComplianceArtefact,
  Dispute,
  EscrowPosition,
  Exporter,
  FxQuote,
  Invoice,
  ScreeningCase,
  TradeOrder,
  UnmatchedVaCredit,
  VirtualAccount,
} from "@setu/types";

/**
 * A deterministic token derived from a stable seed string (e.g. an order
 * reference). Used instead of randomUUID() for magic-link tokens so a
 * bookmarked/shared link to a *seeded* demo order keeps working across
 * server restarts and redeploys — the in-memory store reseeds from scratch
 * every boot, so a randomly generated token would break on every deploy.
 */
function deterministicToken(seed: string): string {
  return createHash("sha256").update(seed).digest("hex").slice(0, 32);
}

export class Store {
  private exporters = new Map<string, Exporter>();
  private virtualAccounts = new Map<string, VirtualAccount>();
  private buyers = new Map<string, Buyer>();
  private buyerIdByPortalToken = new Map<string, string>();
  private tradeOrders = new Map<string, TradeOrder>();
  private orderIdByReference = new Map<string, string>();
  private orderIdByToken = new Map<string, string>();
  private escrowPositions = new Map<string, EscrowPosition>();
  private invoices = new Map<string, Invoice>();
  private disputes = new Map<string, Dispute>();
  private complianceArtefacts: ComplianceArtefact[] = [];
  private screeningCases: ScreeningCase[] = [];
  private unmatchedCredits: UnmatchedVaCredit[] = [];
  private fxQuotes = new Map<string, FxQuote>();
  private auditLog: AuditEvent[] = [];

  // --- Exporter / VirtualAccount ---

  createExporter(input: Omit<Exporter, "id">): Exporter {
    const exporter: Exporter = { ...input, id: randomUUID() };
    this.exporters.set(exporter.id, exporter);
    return exporter;
  }

  saveExporter(exporter: Exporter): void {
    this.exporters.set(exporter.id, exporter);
  }

  getExporter(): Exporter | undefined {
    return [...this.exporters.values()][0];
  }

  getExporterById(id: string): Exporter | undefined {
    return this.exporters.get(id);
  }

  createVirtualAccount(input: Omit<VirtualAccount, "id">): VirtualAccount {
    const account: VirtualAccount = { ...input, id: randomUUID() };
    this.virtualAccounts.set(account.id, account);
    return account;
  }

  saveVirtualAccount(account: VirtualAccount): void {
    this.virtualAccounts.set(account.id, account);
  }

  getVirtualAccount(id: string): VirtualAccount | undefined {
    return this.virtualAccounts.get(id);
  }

  getVirtualAccountByCurrency(currency: VirtualAccount["currency"]): VirtualAccount | undefined {
    return [...this.virtualAccounts.values()].find((a) => a.currency === currency);
  }

  getAllVirtualAccounts(): VirtualAccount[] {
    return [...this.virtualAccounts.values()];
  }

  // --- Buyer ---

  createBuyer(input: Omit<Buyer, "id" | "portalToken">): Buyer {
    const buyer: Buyer = {
      ...input,
      id: randomUUID(),
      portalToken: deterministicToken(`buyer:${input.name}`),
    };
    this.buyers.set(buyer.id, buyer);
    this.buyerIdByPortalToken.set(buyer.portalToken, buyer.id);
    return buyer;
  }

  getBuyerByPortalToken(token: string): Buyer | undefined {
    const id = this.buyerIdByPortalToken.get(token);
    return id ? this.buyers.get(id) : undefined;
  }

  getBuyer(id: string): Buyer | undefined {
    return this.buyers.get(id);
  }

  getBuyers(): Buyer[] {
    return [...this.buyers.values()];
  }

  // --- TradeOrder ---

  createOrder(input: Omit<TradeOrder, "id" | "createdAt" | "updatedAt" | "buyerToken">): TradeOrder {
    const now = new Date().toISOString();
    const order: TradeOrder = {
      ...input,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      buyerToken: deterministicToken(`order:${input.reference}`),
    };
    this.tradeOrders.set(order.id, order);
    this.orderIdByReference.set(order.reference, order.id);
    this.orderIdByToken.set(order.buyerToken, order.id);
    return order;
  }

  saveOrder(order: TradeOrder): void {
    this.tradeOrders.set(order.id, order);
    this.orderIdByReference.set(order.reference, order.id);
    this.orderIdByToken.set(order.buyerToken, order.id);
  }

  getOrderByReference(reference: string): TradeOrder | undefined {
    const id = this.orderIdByReference.get(reference);
    return id ? this.tradeOrders.get(id) : undefined;
  }

  getOrderByToken(token: string): TradeOrder | undefined {
    const id = this.orderIdByToken.get(token);
    return id ? this.tradeOrders.get(id) : undefined;
  }

  getAllOrders(): TradeOrder[] {
    return [...this.tradeOrders.values()];
  }

  // --- EscrowPosition ---

  saveEscrowPosition(position: EscrowPosition): void {
    this.escrowPositions.set(position.orderId, position);
  }

  getEscrowPosition(orderId: string): EscrowPosition | undefined {
    return this.escrowPositions.get(orderId);
  }

  // --- Invoice ---

  saveInvoice(invoice: Invoice): void {
    this.invoices.set(invoice.orderId, invoice);
  }

  getInvoiceByOrderId(orderId: string): Invoice | undefined {
    return this.invoices.get(orderId);
  }

  // --- Dispute ---

  createDispute(input: Omit<Dispute, "id">): Dispute {
    const dispute: Dispute = { ...input, id: randomUUID() };
    this.disputes.set(dispute.id, dispute);
    return dispute;
  }

  updateDispute(dispute: Dispute): void {
    this.disputes.set(dispute.id, dispute);
  }

  getDispute(id: string): Dispute | undefined {
    return this.disputes.get(id);
  }

  getAllDisputes(): Dispute[] {
    return [...this.disputes.values()];
  }

  // --- FxQuote ---

  saveFxQuote(orderId: string, quote: FxQuote): void {
    this.fxQuotes.set(orderId, quote);
  }

  getFxQuote(orderId: string): FxQuote | undefined {
    return this.fxQuotes.get(orderId);
  }

  // --- ComplianceArtefact / ScreeningCase / UnmatchedVaCredit ---

  addComplianceArtefact(input: Omit<ComplianceArtefact, "id">): ComplianceArtefact {
    const artefact: ComplianceArtefact = { ...input, id: randomUUID() };
    this.complianceArtefacts.push(artefact);
    return artefact;
  }

  getComplianceArtefacts(): ComplianceArtefact[] {
    return [...this.complianceArtefacts];
  }

  addScreeningCase(input: Omit<ScreeningCase, "id">): ScreeningCase {
    const screeningCase: ScreeningCase = { ...input, id: randomUUID() };
    this.screeningCases.push(screeningCase);
    return screeningCase;
  }

  getScreeningCases(): ScreeningCase[] {
    return [...this.screeningCases];
  }

  addUnmatchedCredit(input: Omit<UnmatchedVaCredit, "id">): UnmatchedVaCredit {
    const credit: UnmatchedVaCredit = { ...input, id: randomUUID() };
    this.unmatchedCredits.push(credit);
    return credit;
  }

  getUnmatchedCredits(): UnmatchedVaCredit[] {
    return [...this.unmatchedCredits];
  }

  // --- Audit log (append-only) ---

  addAuditEvent(input: Omit<AuditEvent, "id" | "when">): AuditEvent {
    const event: AuditEvent = Object.freeze({
      ...input,
      id: randomUUID(),
      when: new Date().toISOString(),
    });
    this.auditLog.push(event);
    return event;
  }

  getAuditTrail(): readonly AuditEvent[] {
    return [...this.auditLog];
  }

  // --- Reset ---

  clear(): void {
    this.exporters.clear();
    this.virtualAccounts.clear();
    this.buyers.clear();
    this.buyerIdByPortalToken.clear();
    this.tradeOrders.clear();
    this.orderIdByReference.clear();
    this.orderIdByToken.clear();
    this.escrowPositions.clear();
    this.invoices.clear();
    this.disputes.clear();
    this.complianceArtefacts = [];
    this.screeningCases = [];
    this.unmatchedCredits = [];
    this.fxQuotes.clear();
    this.auditLog = [];
  }
}
