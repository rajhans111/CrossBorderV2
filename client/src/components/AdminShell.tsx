import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { DemoModeBar } from "./DemoModeBar";
import { AdminGate } from "./AdminGate";

export function AdminShell() {
  return (
    <AdminGate>
      <div className="min-h-screen bg-gray-50">
        <DemoModeBar />
        <TopBar />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Outlet />
        </div>
      </div>
    </AdminGate>
  );
}
