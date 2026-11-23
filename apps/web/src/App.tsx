
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WebsitePage from "./pages/WebsitePage";
import ClientPage from "./pages/ClientPage";
import AdminPage from "./pages/AdminPage";
import StorePage from "./pages/StorePage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SuperAdminPage from "./pages/SuperAdminPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/sara" replace />} />

        <Route path="/super-admin" element={<SuperAdminPage />} />

        {/* Website principal */}
        <Route path="/:slug" element={<WebsitePage />} />

        {/* Loja */}
        <Route path="/:slug/loja" element={<StorePage />} />

        {/* Reservas */}
        <Route path="/:slug/reservas" element={<ClientPage />} />

        {/* Administração e planos */}
        <Route path="/:slug/admin" element={<AdminPage />} />
        <Route path="/:slug/planos" element={<SubscriptionPage />} />
      </Routes>
    </BrowserRouter>
  );
}
