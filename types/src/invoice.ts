import type { Currency } from "./currency.js";

export type InvoiceStatus = "Draft" | "Sent";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  invoiceNo: string;
  orderId: string;
  from: string;
  billTo: string;
  currency: Currency;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  totalDue: number;
  paymentInstructions: string;
  status: InvoiceStatus;
}
