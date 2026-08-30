import { Navigate, Route, Routes } from "react-router-dom";
import { ExporterShell } from "./components/ExporterShell";
import { AdminShell } from "./components/AdminShell";
import { Dashboard } from "./pages/exporter/Dashboard";
import { OrdersList } from "./pages/exporter/OrdersList";
import { OrderDetail } from "./pages/exporter/OrderDetail";
import { NewOrder } from "./pages/exporter/NewOrder";
import { Onboarding } from "./pages/exporter/Onboarding";
import { VirtualAccountPage } from "./pages/exporter/VirtualAccountPage";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { BuyerPortal } from "./pages/buyer/BuyerPortal";
import { BuyerWorkspace } from "./pages/buyer/BuyerWorkspace";
import { Landing } from "./pages/marketing/Landing";
import { AuthGate } from "./pages/marketing/AuthGate";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthGate mode="login" />} />
      <Route path="/register" element={<AuthGate mode="register" />} />

      <Route path="/exporter" element={<ExporterShell />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<OrdersList />} />
        <Route path="orders/new" element={<NewOrder />} />
        <Route path="orders/:ref" element={<OrderDetail />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="virtual-account" element={<VirtualAccountPage />} />
      </Route>

      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<AdminOverview />} />
      </Route>

      <Route path="/buyer/:token" element={<BuyerPortal />} />
      <Route path="/buyer-workspace/:token" element={<BuyerWorkspace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
