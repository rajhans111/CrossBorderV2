import { useQuery } from "@tanstack/react-query";
import { api } from "../../api";
import { Card } from "../../components/Card";
import { QueryState } from "../../components/QueryState";

export function Onboarding() {
  const { data, isLoading, error } = useQuery({ queryKey: ["dashboard"], queryFn: api.getDashboard });

  const steps = data
    ? [
        { label: "Company details", detail: `${data.exporter.companyName} · ${data.exporter.city}`, done: true },
        {
          label: "Trade registration",
          detail: `GSTIN ${data.exporter.gstin} · IEC ${data.exporter.iec} · MSME ${data.exporter.msmeUdyam}`,
          done: true,
        },
        { label: "KYC verification", detail: `Status: ${data.exporter.kycStatus}`, done: data.exporter.kycStatus === "Approved" },
        { label: "Bank account linked", detail: data.exporter.linkedBankAccount, done: true },
        {
          label: "Virtual SGD account provisioned",
          detail: data.virtualAccount?.accountNo,
          done: Boolean(data.virtualAccount),
        },
      ]
    : [];

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Onboarding</h1>
      <QueryState isLoading={isLoading} error={error}>
        <Card>
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li key={step.label} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    step.done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {step.done ? "✓" : i + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{step.label}</p>
                  <p className="text-sm text-gray-500">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </QueryState>
    </div>
  );
}
