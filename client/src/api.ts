import type {
  AuditEvent,
  Buyer,
  ComplianceArtefact,
  Currency,
  Dispute,
  DisputeReason,
  EscrowPosition,
  Exporter,
  FxQuote,
  Incoterm,
  Invoice,
  PaymentTerms,
  ScreeningCase,
  TradeOrder,
  TradeOrderStatus,
  UnmatchedVaCredit,
  VirtualAccount,
} from "@setu/types";

export interface OrderSummary extends TradeOrder {
  buyerName: string;
}

export interface OrderDetail extends TradeOrder {
  buyer?: Buyer;
  escrowPosition?: EscrowPosition;
  dispute?: Dispute;
  fxQuote?: FxQuote;
  invoice?: Invoice;
  complianceArtefacts: ComplianceArtefact[];
}

export interface ExporterDashboard {
  exporter: Exporter;
  virtualAccount?: VirtualAccount;
  virtualAccounts: VirtualAccount[];
  inEscrowSgd: number;
  receivedThisMonthInr: number;
  fxSavedThisMonthInr: number;
  activeOrders: number;
  orders: TradeOrder[];
}

export interface HeldPosition {
  reference: string;
  amount: number;
  status: EscrowPosition["status"];
}

export interface VirtualAccountView extends VirtualAccount {
  heldPositions: HeldPosition[];
}

export interface BuyerPortalView {
  order: TradeOrder;
  buyer?: Buyer;
  virtualAccount?: VirtualAccount;
  escrowPosition?: EscrowPosition;
  dispute?: Dispute;
}

export interface BuyerWorkspaceView {
  buyer: Buyer;
  orders: TradeOrder[];
}

export interface AdminOverview {
  exporter?: Exporter;
  orders: TradeOrder[];
  disputes: Dispute[];
  screeningCases: ScreeningCase[];
  unmatchedCredits: UnmatchedVaCredit[];
  complianceArtefacts: ComplianceArtefact[];
  auditTrail: AuditEvent[];
}

export interface OnboardingSubmission {
  companyName: string;
  gstin: string;
  iec: string;
  msmeUdyam: string;
  city: string;
  industry: string;
  directorName: string;
  directorPan: string;
  bankAccountNo: string;
  ifsc: string;
  bankName: string;
  settlementCurrency: Currency;
}

export interface CreateOrderPayload {
  buyerId: string;
  product: string;
  quantity: number;
  amount: number;
  currency: Currency;
  incoterm: Incoterm;
  hsCode: string;
  paymentTerms: PaymentTerms;
}

export class ApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => undefined)) as { error?: string; code?: string } | undefined;
    throw new ApiError(body?.error ?? `Request to ${path} failed with ${res.status}`, body?.code);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  getHealth: () => request<{ status: string; service: string }>("/health"),

  // Orders
  listOrders: (params?: { status?: TradeOrderStatus; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return request<OrderSummary[]>(`/orders${qs ? `?${qs}` : ""}`);
  },
  getOrder: (reference: string) => request<OrderDetail>(`/orders/${reference}`),
  createOrder: (payload: CreateOrderPayload) =>
    request<TradeOrder>("/orders", { method: "POST", body: JSON.stringify(payload) }),
  transitionOrder: (reference: string, type: "MARK_PAYMENT_AWAITED" | "MARK_SHIPPED" | "RESOLVE_DISPUTE" | "REFUND") =>
    request<TradeOrder>(`/orders/${reference}/transition`, {
      method: "POST",
      body: JSON.stringify({ type }),
    }),
  generateInvoice: (reference: string) =>
    request<Invoice>(`/orders/${reference}/invoice`, { method: "POST" }),
  generateShippingDoc: (reference: string, type: string) =>
    request<TradeOrder>(`/orders/${reference}/shipping-docs/${type}/generate`, { method: "POST" }),

  // Exporter
  getDashboard: () => request<ExporterDashboard>("/exporter/dashboard"),
  getVirtualAccounts: () => request<{ accounts: VirtualAccountView[] }>("/exporter/virtual-account"),
  getBuyers: () => request<Buyer[]>("/exporter/buyers"),
  submitOnboarding: (payload: OnboardingSubmission) =>
    request<Exporter>("/exporter/onboarding", { method: "POST", body: JSON.stringify(payload) }),

  // Buyer (magic link)
  getBuyerPortal: (token: string) => request<BuyerPortalView>(`/buyer/${token}`),
  getBuyerWorkspace: (token: string) => request<BuyerWorkspaceView>(`/buyer-workspace/${token}`),
  buyerPay: (token: string) => request<TradeOrder>(`/buyer/${token}/pay`, { method: "POST" }),
  buyerConfirm: (token: string) => request<TradeOrder>(`/buyer/${token}/confirm`, { method: "POST" }),
  buyerDispute: (token: string, reason: DisputeReason) =>
    request<TradeOrder>(`/buyer/${token}/dispute`, { method: "POST", body: JSON.stringify({ reason }) }),

  // Admin
  getAdminOverview: () => request<AdminOverview>("/admin/overview"),
  approveKyc: (exporterId: string) =>
    request<Exporter>(`/admin/kyc/${exporterId}/approve`, { method: "POST" }),
  resetDemoData: () => request<{ status: string }>("/admin/reset", { method: "POST" }),
};
