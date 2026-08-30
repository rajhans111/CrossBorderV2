export type InvoiceStatus = "Draft" | "Sent";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPriceSgd: number;
}

export interface Invoice {
  invoiceNo: string;
  orderId: string;
  from: string;
  billTo: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  totalDue: number;
  paymentInstructions: string;
  status: InvoiceStatus;
}
