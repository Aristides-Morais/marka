import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ModuleAwareWebsitePage from "./pages/ModuleAwareWebsitePage";
import ClientPage from "./pages/ClientPage";
import AdminPage from "./pages/AdminPage";
import StorePage from "./pages/StorePage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SuperAdminPage from "./pages/SuperAdminPage";
import BusinessModulesPage from "./pages/BusinessModulesPage";
import TenantSiteContentPage from "./pages/TenantSiteContentPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/sara" replace />} />
        <Route path="/super-admin" element={<SuperAdminPage />} />
        <Route path="/super-admin/modulos" element={<BusinessModulesPage />} />
        <Route path="/:slug/admin/website" element={<TenantSiteContentPage />} />
        <Route path="/:slug" element={<ModuleAwareWebsitePage />} />
        <Route path="/:slug/loja" element={<StorePage />} />
        <Route path="/:slug/reservas" element={<ClientPage />} />
        <Route path="/:slug/admin" element={<AdminPage />} />
        <Route path="/:slug/planos" element={<SubscriptionPage />} />
      </Routes>
    </BrowserRouter>
  );
}