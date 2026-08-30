import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface AuthGateProps {
  mode: "login" | "register";
}

/**
 * Cosmetic demo gate — this MVP has no real password auth (per spec).
 * Submitting either form just drops you into the exporter dashboard.
 * There is nothing to validate against and nothing stored.
 */
export function AuthGate({ mode }: AuthGateProps) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => navigate("/exporter/dashboard"), 400);
  }

  const isRegister = mode === "register";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link to="/" className="text-xl font-semibold text-primary">
            Xinto
          </Link>
          <p className="mt-1 text-sm text-gray-500">
            {isRegister ? "Create your exporter account" : "Welcome back"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Company name</label>
                <input
                  required
                  placeholder="Mehta Knitwear Exports Pvt Ltd"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                required
                type="email"
                placeholder="you@company.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "One moment…" : isRegister ? "Create account" : "Log in"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            Demo mode — this form isn&rsquo;t backed by real authentication. Submitting takes you straight into the
            demo exporter workspace.
          </p>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Register
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
