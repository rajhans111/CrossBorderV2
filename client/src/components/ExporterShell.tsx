import { NavLink, Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";

const MODULES = [
  { to: "/exporter/dashboard", label: "Dashboard" },
  { to: "/exporter/orders", label: "Orders" },
  { to: "/exporter/orders/new", label: "New order" },
  { to: "/exporter/onboarding", label: "Onboarding" },
  { to: "/exporter/virtual-account", label: "Virtual accounts" },
];

export function ExporterShell() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-48 shrink-0 md:block">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Modules
          </p>
          <nav className="flex flex-col gap-1">
            {MODULES.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                end={m.to === "/exporter/orders"}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-white text-primary shadow-sm border border-gray-200" : "text-gray-600 hover:bg-white/60"
                  }`
                }
              >
                {m.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
