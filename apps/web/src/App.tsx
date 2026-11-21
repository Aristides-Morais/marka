import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ClientPage from "./pages/ClientPage";
import AdminPage from "./pages/AdminPage";
import StorePage from "./pages/StorePage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SuperAdminPage from "./pages/SuperAdminPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redireciona a raiz para um negócio padrão */}
        <Route path="/" element={<Navigate to="/sara" replace />} />
        
        {/* Rota Secreta do Fundador */}
        <Route path="/super-admin" element={<SuperAdminPage />} />

        {/* Rotas Dinâmicas por Negócio */}
        <Route path="/:slug" element={<ClientPage />} />
        <Route path="/:slug/loja" element={<StorePage />} />
        <Route path="/:slug/admin" element={<AdminPage />} />
        <Route path="/:slug/planos" element={<SubscriptionPage />} />
      </Routes>
    </BrowserRouter>
  );
}