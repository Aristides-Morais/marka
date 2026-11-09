import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClientPage from "./ClientPage"; // Vamos mover o código antigo para aqui
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}