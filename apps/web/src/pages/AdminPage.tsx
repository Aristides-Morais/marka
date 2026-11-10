import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiFetch, setAccessToken } from "../lib/api";

type Service = { id: string; name: string; durationMin: number; price: number };
type Reservation = { id: string; clientName: string; clientPhone: string; startTime: string; status: string; service: { name: string } };

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"reservations" | "services" | "settings">("reservations");
  
  const [services, setServices] = useState<Service[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [hours, setHours] = useState({ openTime: "08:00", closeTime: "18:00" });
  
  const [formData, setFormData] = useState({ name: "", durationMin: "30", price: "" });
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function loadData() {
    try {
      const [resSvc, resRes, resHours] = await Promise.all([
        apiFetch<Service[]>("/api/v1/reservations/services", { skipAuth: true }),
        apiFetch<Reservation[]>("/api/v1/reservations"),
        apiFetch<{ openTime: string, closeTime: string }>("/api/v1/reservations/hours", { skipAuth: true })
      ]);
      setServices(resSvc);
      setReservations(resRes);
      setHours(resHours);
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
        skipAuth: true,
      });
      setAccessToken(data.token);
      showToast("Login efetuado!", "success");
      await loadData();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateService(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/v1/reservations/services", {
        method: "POST",
        body: JSON.stringify({ name: formData.name, durationMin: Number(formData.durationMin), price: Number(formData.price) }),
      });
      setFormData({ name: "", durationMin: "30", price: "" });
      await loadData();
      showToast("Serviço criado!", "success");
    } catch (err: any) { 
      showToast(err.message, "error"); 
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteService(id: string) {
    if (!confirm("Apagar este serviço?")) return;
    setLoading(true);
    try {
      await apiFetch(`/api/v1/reservations/services/${id}`, { method: "DELETE" });
      await loadData();
      showToast("Serviço apagado.", "success");
    } catch (err) { 
      showToast("Erro ao apagar", "error"); 
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelReservation(id: string) {
    if (!confirm("Cancelar esta reserva?")) return;
    setLoading(true);
    try {
      await apiFetch(`/api/v1/reservations/${id}/cancel`, { method: "PATCH" });
      await loadData();
      showToast("Reserva cancelada.", "success");
    } catch (err) { 
      showToast("Erro ao cancelar", "error"); 
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateHours(e: FormEvent) {
    e.preventDefault();
    console.log("🟢 BOTÃO CLICADO: A iniciar guardar do horário"); // LOG DE DEBUG
    setLoading(true);
    try {
      await apiFetch("/api/v1/reservations/hours", { method: "PATCH", body: JSON.stringify(hours) });
      showToast("Horário atualizado!", "success");
      console.log("🟢 HORÁRIO GUARDADO COM SUCESSO");
    } catch (err) { 
      showToast("Erro ao atualizar", "error"); 
      console.log("🔴 ERRO AO GUARDAR HORÁRIO");
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        {toast && <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>{toast.message}</div>}
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-zinc-200">
          <h2 className="text-2xl font-bold text-center mb-6">Área Restrita</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border rounded-lg px-4 py-2 text-sm" />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full border rounded-lg px-4 py-2 text-sm" />
            <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-2 rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50">
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>
          <Link to="/" className="block text-center mt-6 text-xs text-zinc-500">Voltar ao site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 relative">
      {toast && <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>{toast.message}</div>}
      
      <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold">Painel de Gestão</h1>
        <div className="flex gap-2">
          <Link to="/" className="text-sm border border-zinc-300 px-4 py-2 rounded-lg bg-white">Ver Site</Link>
          <button onClick={() => { setAccessToken(null); setIsAuthenticated(false); }} className="text-sm border border-red-200 bg-red-50 text-red-600 px-4 py-2 rounded-lg">Sair</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto flex gap-4 border-b border-zinc-200 mb-6">
        <button onClick={() => setActiveTab("reservations")} className={`pb-2 text-sm font-medium ${activeTab === "reservations" ? "border-b-2 border-zinc-900" : "text-zinc-500"}`}>Reservas</button>
        <button onClick={() => setActiveTab("services")} className={`pb-2 text-sm font-medium ${activeTab === "services" ? "border-b-2 border-zinc-900" : "text-zinc-500"}`}>Serviços</button>
        <button onClick={() => setActiveTab("settings")} className={`pb-2 text-sm font-medium ${activeTab === "settings" ? "border-b-2 border-zinc-900" : "text-zinc-500"}`}>Horário</button>
      </div>

      <div className="max-w-5xl mx-auto">
        {activeTab === "reservations" && (
          <div className="bg-white rounded-xl border border-zinc-200 overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase"><tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Serviço</th><th className="px-4 py-3">Ação</th></tr></thead>
              <tbody className="divide-y divide-zinc-100">
                {reservations.map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-3">{new Date(r.startTime).toLocaleString("pt-AO")}</td>
                    <td className="px-4 py-3 font-medium">{r.clientName}</td>
                    <td className="px-4 py-3 text-zinc-600">{r.service.name}</td>
                    <td className="px-4 py-3">
                      {r.status !== "CANCELLED" ? (
                        <button onClick={() => handleCancelReservation(r.id)} disabled={loading} className="text-red-500 hover:underline text-xs font-medium disabled:opacity-50">
                          {loading ? "A cancelar..." : "Cancelar"}
                        </button>
                      ) : (
                        <span className="text-zinc-400 text-xs">Cancelada</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "services" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-zinc-200 h-fit">
              <h2 className="font-semibold mb-4">Novo Serviço</h2>
              <form onSubmit={handleCreateService} className="space-y-3">
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome" className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input type="number" required value={formData.durationMin} onChange={e => setFormData({...formData, durationMin: e.target.value})} placeholder="Duração (min)" className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Preço (Kz)" className="w-full border rounded-lg px-3 py-2 text-sm" />
                <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-2 rounded-lg font-medium disabled:opacity-50">
                  {loading ? "A criar..." : "Adicionar"}
                </button>
              </form>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="font-semibold mb-4">Serviços Ativos</h2>
              <ul className="space-y-2">
                {services.map(s => (
                  <li key={s.id} className="flex justify-between items-center text-sm border-b pb-2">
                    <span>{s.name} ({s.durationMin} min) - {Number(s.price).toLocaleString("pt-AO")} Kz</span>
                    <button onClick={() => handleDeleteService(s.id)} disabled={loading} className="text-red-500 text-xs hover:underline disabled:opacity-50">Apagar</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white p-6 rounded-xl border border-zinc-200 max-w-sm">
            <h2 className="font-semibold mb-4">Horário de Funcionamento</h2>
            <form onSubmit={handleUpdateHours} className="space-y-4">
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Abertura</label>
                <input type="time" required value={hours.openTime} onChange={e => setHours({...hours, openTime: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Fecho</label>
                <input type="time" required value={hours.closeTime} onChange={e => setHours({...hours, closeTime: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-2 rounded-lg font-medium disabled:opacity-50">
                {loading ? "A guardar..." : "Guardar Horário"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}