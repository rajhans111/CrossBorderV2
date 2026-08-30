import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Currency, Incoterm, PaymentTerms } from "@setu/types";
import { CURRENCIES } from "@setu/types";
import { api } from "../../api";
import { Card } from "../../components/Card";

const INCOTERMS: Incoterm[] = ["FOB", "CIF", "EXW"];
const PAYMENT_TERMS: PaymentTerms[] = ["TT", "LC", "DP", "DA"];

export function NewOrder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: buyers } = useQuery({ queryKey: ["buyers"], queryFn: api.getBuyers });

  const [form, setForm] = useState({
    buyerId: "",
    product: "",
    quantity: "",
    amount: "",
    currency: "SGD" as Currency,
    incoterm: "FOB" as Incoterm,
    hsCode: "",
    paymentTerms: "TT" as PaymentTerms,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.createOrder({
        buyerId: form.buyerId,
        product: form.product,
        quantity: Number(form.quantity),
        amount: Number(form.amount),
        currency: form.currency,
        incoterm: form.incoterm,
        hsCode: form.hsCode,
        paymentTerms: form.paymentTerms,
      }),
    onSuccess: async (order) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      navigate(`/exporter/orders/${order.reference}`);
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate();
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">New order</h1>

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Buyer</label>
            <select
              required
              value={form.buyerId}
              onChange={(e) => setForm({ ...form, buyerId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select a buyer…</option>
              {buyers?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.country})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Product</label>
            <input
              required
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="e.g. Cotton knit T-shirts — 12,000 pcs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
              <input
                required
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Amount</label>
              <div className="flex gap-2">
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}
                  className="rounded-lg border border-gray-300 px-2 py-2 text-sm"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  required
                  type="number"
                  min={1}
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Incoterm</label>
              <select
                value={form.incoterm}
                onChange={(e) => setForm({ ...form, incoterm: e.target.value as Incoterm })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {INCOTERMS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Payment terms</label>
              <select
                value={form.paymentTerms}
                onChange={(e) => setForm({ ...form, paymentTerms: e.target.value as PaymentTerms })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {PAYMENT_TERMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">HS code</label>
            <input
              required
              value={form.hsCode}
              onChange={(e) => setForm({ ...form, hsCode: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="e.g. 6109.10"
            />
          </div>

          {createMutation.isError && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {(createMutation.error as Error).message}
            </p>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating…" : "Create order"}
          </button>
        </form>
      </Card>
    </div>
  );
}
