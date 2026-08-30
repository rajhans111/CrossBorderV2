import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api, ApiError, type ExporterDashboard, type OnboardingSubmission } from "../../api";
import { Card } from "../../components/Card";
import { QueryState } from "../../components/QueryState";

const STEP_LABELS = ["1. Business", "2. Director KYC", "3. Bank account", "4. Review"];
const INDUSTRIES = ["Textile", "Electronics", "Pharmaceuticals", "Chemicals", "Handicrafts", "Agriculture", "Other"];

const REQUIRED_BY_STEP: (keyof OnboardingSubmission)[][] = [
  ["companyName", "gstin", "iec", "city", "industry"],
  ["directorName", "directorPan"],
  ["bankAccountNo", "ifsc", "bankName"],
  [],
];

function emptyForm(): OnboardingSubmission {
  return {
    companyName: "",
    gstin: "",
    iec: "",
    msmeUdyam: "",
    city: "",
    industry: "",
    directorName: "",
    directorPan: "",
    bankAccountNo: "",
    ifsc: "",
    bankName: "",
  };
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

export function Onboarding() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["dashboard"], queryFn: api.getDashboard });
  const [view, setView] = useState<"walkthrough" | "summary">("walkthrough");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingSubmission>(emptyForm());
  const [loadedFromExporter, setLoadedFromExporter] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (data && !loadedFromExporter) {
      setForm({
        companyName: data.exporter.companyName,
        gstin: data.exporter.gstin,
        iec: data.exporter.iec,
        msmeUdyam: data.exporter.msmeUdyam,
        city: data.exporter.city,
        industry: data.exporter.industry,
        directorName: data.exporter.directorName,
        directorPan: data.exporter.directorPan,
        bankAccountNo: data.exporter.bankAccountNo,
        ifsc: data.exporter.ifsc,
        bankName: data.exporter.bankName,
      });
      setLoadedFromExporter(true);
    }
  }, [data, loadedFromExporter]);

  const mutation = useMutation({
    mutationFn: (payload: OnboardingSubmission) => api.submitOnboarding(payload),
    onSuccess: (exporter) => {
      queryClient.setQueryData<ExporterDashboard>(["dashboard"], (prev) => (prev ? { ...prev, exporter } : prev));
      setSubmitError(null);
      setSubmitted(true);
    },
    onError: (err: unknown) => {
      setSubmitError(err instanceof ApiError ? err.message : "Could not save onboarding details.");
    },
  });

  function update<K extends keyof OnboardingSubmission>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSubmitted(false);
  }

  function stepComplete(i: number): boolean {
    return REQUIRED_BY_STEP[i]!.every((key) => form[key].trim().length > 0);
  }

  const canSubmit = REQUIRED_BY_STEP.flat().every((key) => form[key].trim().length > 0);

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
              Edit any step below and submit — it updates your exporter profile immediately (demo KYC/bank checks
              are stubs, no real verification happens).
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
                      {stepComplete(i) && step !== i ? " ✓" : ""}
                    </button>
                  ))}
                </div>

                <Card>
                  {step === 0 && (
                    <div className="space-y-4">
                      <Field label="Company name" value={form.companyName} onChange={(v) => update("companyName", v)} />
                      <Field label="GSTIN" value={form.gstin} onChange={(v) => update("gstin", v.toUpperCase())} />
                      <Field
                        label="IEC (Import Export Code)"
                        value={form.iec}
                        onChange={(v) => update("iec", v.toUpperCase())}
                      />
                      <Field
                        label="MSME Udyam (optional)"
                        value={form.msmeUdyam}
                        onChange={(v) => update("msmeUdyam", v)}
                      />
                      <Field label="City" value={form.city} onChange={(v) => update("city", v)} />
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Industry</label>
                        <select
                          value={form.industry}
                          onChange={(e) => update("industry", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="">Select an industry</option>
                          {INDUSTRIES.map((industry) => (
                            <option key={industry} value={industry}>
                              {industry}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-4">
                      <Field
                        label="Director / promoter name"
                        value={form.directorName}
                        onChange={(v) => update("directorName", v)}
                      />
                      <Field
                        label="PAN"
                        value={form.directorPan}
                        onChange={(v) => update("directorPan", v.toUpperCase())}
                        placeholder="AAAPM1234A"
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked readOnly disabled />
                        Aadhaar OTP verified (demo stub)
                      </label>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <Field
                        label="INR current account number"
                        value={form.bankAccountNo}
                        onChange={(v) => update("bankAccountNo", v)}
                      />
                      <Field label="IFSC" value={form.ifsc} onChange={(v) => update("ifsc", v.toUpperCase())} />
                      <Field label="Bank name" value={form.bankName} onChange={(v) => update("bankName", v)} />
                      <p className="text-sm text-gray-500">Penny-drop verification runs as a demo stub on save.</p>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-3 text-sm text-gray-700">
                      <p>
                        <span className="text-gray-400">Company: </span>
                        <span className="font-medium text-gray-900">{form.companyName || "—"}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">GSTIN / IEC: </span>
                        <span className="font-medium text-gray-900">
                          {form.gstin || "—"} / {form.iec || "—"}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-400">Director / PAN: </span>
                        <span className="font-medium text-gray-900">
                          {form.directorName || "—"} / {form.directorPan || "—"}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-400">INR account: </span>
                        <span className="font-medium text-gray-900">
                          {form.bankAccountNo || "—"} ({form.ifsc || "—"})
                        </span>
                      </p>
                      {!canSubmit && (
                        <p className="text-amber-600">Fill in every required field on the earlier steps first.</p>
                      )}
                      {submitError && <p className="text-red-600">{submitError}</p>}
                      {submitted && <p className="font-medium text-green-600">Saved — your exporter profile has been updated.</p>}
                      <p className="pt-2 font-medium text-primary">
                        Submitting updates the company, director, and bank details used across your dashboard,
                        orders, and documents.
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
                        onClick={() => {
                          setSubmitError(null);
                          mutation.mutate(form);
                        }}
                        disabled={!canSubmit || mutation.isPending}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                      >
                        {mutation.isPending ? "Saving…" : "Submit onboarding"}
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
                      {data.exporter.directorName} / {data.exporter.directorPan}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">INR account: </span>
                    <span className="font-medium text-gray-900">
                      {data.exporter.bankAccountNo} ({data.exporter.ifsc})
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setView("walkthrough")}
                  className="mt-4 text-sm font-medium text-primary hover:underline"
                >
                  Edit onboarding →
                </button>
              </Card>
            )}

            <Card>
              <h2 className="mb-3 font-semibold text-gray-900">Virtual accounts provisioned via onboarding</h2>
              <p className="mb-3 text-sm text-gray-500">
                These were created and linked to this exporter when onboarding first completed — editing the
                profile above doesn't re-provision them.
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
