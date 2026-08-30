import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../api";
import { Card } from "../../components/Card";
import { QueryState } from "../../components/QueryState";

const STEP_LABELS = ["1. Business", "2. Director KYC", "3. Bank account", "4. Review"];

// Fields the current domain model doesn't carry (director identity, bank
// account number) are demo constants — this page is an already-onboarded
// exporter's locked preview of the wizard, not a live editable form (real
// registration flow is out of MVP scope; see completeOnboarding() server-side
// for where these values would actually come from).
const DIRECTOR_NAME = "Rajesh Mehta";
const BANK_NAME = "HDFC Bank";
const INR_ACCOUNT_NO = "123456789012";

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        readOnly
        value={value}
        className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-700"
      />
    </div>
  );
}

export function Onboarding() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["dashboard"], queryFn: api.getDashboard });
  const [view, setView] = useState<"walkthrough" | "summary">("walkthrough");
  const [step, setStep] = useState(0);

  const ifsc = data?.exporter.linkedBankAccount.replace(/\s*\(Demo\)\s*$/, "") ?? "";

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Onboarding</h1>
        <p className="text-sm text-gray-500">Set up your export workspace</p>
      </div>

      <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
        {data && (
          <>
            <p className="text-sm text-gray-600">
              Walk through the 4 steps new exporters complete after login. Your details are pre-filled (read-only).
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setView("walkthrough")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  view === "walkthrough" ? "bg-primary text-white" : "border border-gray-300 text-gray-700"
                }`}
              >
                Walk through steps
              </button>
              <button
                type="button"
                onClick={() => setView("summary")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  view === "summary" ? "bg-primary text-white" : "border border-gray-300 text-gray-700"
                }`}
              >
                Profile summary
              </button>
            </div>

            {view === "walkthrough" ? (
              <>
                <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
                  Preview mode — fields are locked. New exporters fill these after register → login.
                </div>

                <div className="flex flex-wrap gap-2">
                  {STEP_LABELS.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setStep(i)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                        step === i ? "bg-primary text-white" : "bg-primary/10 text-gray-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <Card>
                  {step === 0 && (
                    <div className="space-y-4">
                      <LockedField label="Company name" value={data.exporter.companyName} />
                      <LockedField label="GSTIN" value={data.exporter.gstin} />
                      <LockedField label="IEC (Import Export Code)" value={data.exporter.iec} />
                      <LockedField label="MSME Udyam (optional)" value={data.exporter.msmeUdyam} />
                      <LockedField label="City" value={data.exporter.city} />
                      <LockedField label="Industry" value={data.exporter.industry} />
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-4">
                      <LockedField label="Director / promoter name" value={DIRECTOR_NAME} />
                      <LockedField label="PAN" value={data.exporter.iec} />
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked readOnly disabled />
                        Aadhaar OTP verified (demo stub)
                      </label>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <LockedField label="INR current account number" value={INR_ACCOUNT_NO} />
                      <LockedField label="IFSC" value={ifsc} />
                      <LockedField label="Bank name" value={BANK_NAME} />
                      <p className="text-sm text-gray-500">Penny-drop verification runs as a demo stub on save.</p>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-3 text-sm text-gray-700">
                      <p>
                        <span className="text-gray-400">Company: </span>
                        <span className="font-medium text-gray-900">{data.exporter.companyName}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">GSTIN / IEC: </span>
                        <span className="font-medium text-gray-900">
                          {data.exporter.gstin} / {data.exporter.iec}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-400">Director / PAN: </span>
                        <span className="font-medium text-gray-900">
                          {DIRECTOR_NAME} / {data.exporter.iec}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-400">INR account: </span>
                        <span className="font-medium text-gray-900">
                          {INR_ACCOUNT_NO} ({ifsc})
                        </span>
                      </p>
                      <p className="pt-2 font-medium text-primary">
                        Final step — submitting unlocks Virtual SGD, orders, and documents.
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep((s) => Math.max(0, s - 1))}
                      disabled={step === 0}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
                    >
                      Back
                    </button>
                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={() => setStep((s) => Math.min(3, s + 1))}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
                      >
                        Next step
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setView("summary")}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                      >
                        Back to dashboard
                      </button>
                    )}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="border-primary/30 bg-primary/5">
                <p className="mb-2 font-semibold text-primary">Status: {data.exporter.kycStatus}</p>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="text-gray-400">Company: </span>
                    <span className="font-medium text-gray-900">{data.exporter.companyName}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">GSTIN / IEC: </span>
                    <span className="font-medium text-gray-900">
                      {data.exporter.gstin} / {data.exporter.iec}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Director / PAN: </span>
                    <span className="font-medium text-gray-900">
                      {DIRECTOR_NAME} / {data.exporter.iec}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">INR account: </span>
                    <span className="font-medium text-gray-900">
                      {INR_ACCOUNT_NO} ({ifsc})
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setView("walkthrough");
                    setStep(0);
                  }}
                  className="mt-4 text-sm font-medium text-primary hover:underline"
                >
                  See onboarding steps →
                </button>
              </Card>
            )}

            <Card>
              <h2 className="mb-3 font-semibold text-gray-900">Virtual accounts provisioned via onboarding</h2>
              <p className="mb-3 text-sm text-gray-500">
                Completing onboarding is what creates these — not server startup — and links them to this exporter.
              </p>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {data.virtualAccounts.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-gray-100 px-3 py-2 text-center text-sm font-medium text-gray-700"
                  >
                    {a.currency}
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </QueryState>
    </div>
  );
}
