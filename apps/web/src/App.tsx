import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ClientPage from "./pages/ClientPage";
import AdminPage from "./pages/AdminPage";
import StorePage from "./pages/StorePage";
import SubscriptionPage from "./pages/SubscriptionPage"; // <--- NOVO

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/sara" replace />} />
        <Route path="/:slug" element={<ClientPage />} />
        <Route path="/:slug/loja" element={<StorePage />} />
        <Route path="/:slug/admin" element={<AdminPage />} />
        <Route path="/:slug/planos" element={<SubscriptionPage />} /> {/* <--- NOVO */}
      </Routes>
    </BrowserRouter>
  );
}