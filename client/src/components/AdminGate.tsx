import { useState, type ReactNode } from "react";

const DEMO_ADMIN_PASSCODE = "admin-demo";
const SESSION_KEY = "xinto-admin-unlocked";

/**
 * A cosmetic gate, not real access control: the passcode is a hardcoded
 * constant, checked client-side, and documented in the README. It exists so
 * /admin isn't silently wide open to anyone with the URL, matching this
 * project's explicit MVP choice (no real auth backend) while still being a
 * deliberate step rather than nothing at all.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [input, setInput] = useState("");
  const [wrongAttempt, setWrongAttempt] = useState(false);

  if (unlocked) {
    return <>{children}</>;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === DEMO_ADMIN_PASSCODE) {
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        // sessionStorage unavailable — still unlock for this render
      }
      setUnlocked(true);
    } else {
      setWrongAttempt(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-lg font-semibold text-gray-900">Admin access</h1>
        <p className="mb-4 text-sm text-gray-500">
          Demo passcode gate — see the README for the passcode. Not real access control.
        </p>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setWrongAttempt(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Passcode"
            autoFocus
          />
          {wrongAttempt && <p className="text-sm text-red-600">Incorrect passcode.</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
