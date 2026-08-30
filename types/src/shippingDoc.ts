export type ShippingDocType =
  | "packing_list"
  | "bill_of_lading"
  | "certificate_of_origin"
  | "shipping_bill_leo";

export type ShippingDocStatus = "pending" | "generated" | "confirmed";

export interface ShippingDoc {
  type: ShippingDocType;
  status: ShippingDocStatus;
}
