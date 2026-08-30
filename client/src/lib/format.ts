import type { Currency } from "@setu/types";

export function formatSgd(amount: number): string {
  return `SGD ${amount.toLocaleString("en-US")}`;
}

export function formatMoney(amount: number, currency: Currency): string {
  return `${currency} ${amount.toLocaleString("en-US")}`;
}

export function formatInr(amount: number): string {
  return `₹ ${Math.round(amount).toLocaleString("en-IN")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
