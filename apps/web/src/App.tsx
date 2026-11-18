import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ClientPage from "./pages/ClientPage";
import AdminPage from "./pages/AdminPage";
import StorePage from "./pages/StorePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redireciona a raiz para um negócio padrão */}
        <Route path="/" element={<Navigate to="/sara" replace />} />
        
        {/* Rotas Dinâmicas por Negócio */}
        <Route path="/:slug" element={<ClientPage />} />
        <Route path="/:slug/loja" element={<StorePage />} />
        <Route path="/:slug/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}