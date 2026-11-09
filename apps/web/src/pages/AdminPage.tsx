import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

type Service = { id: string; name: string; durationMin: number; price: number };
type Reservation = { id: string; clientName: string; clientPhone: string; startTime: string; service: { name: string } };

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Estados do Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Estados do Painel
  const [services, setServices] = useState<Service[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [formData, setFormData] = useState({ name: "", durationMin: "30", price: "" });
  const [loading, setLoading] = useState(false);
  
  // Notificações
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function loadData() {
    setLoading(true);
    try {
      const [resSvc, resRes] = await Promise.all([
        fetch("/api/v1/reservations/services").then(r => r.json()), // Rota pública
        fetch("/api/v1/reservations", { credentials: "include" }).then(r => {
          if (r.status === 401) throw new Error("Sessão expirada");
          return r.json();
        })
      ]);
      setServices(Array.isArray(resSvc) ? resSvc : []);
      setReservations(Array.isArray(resRes) ? resRes : []);
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  // Tenta carregar os dados ao abrir a página (se já tiver o cookie de login, entra direto)
  useEffect(() => {
    loadData();
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(), // <-- CORREÇÃO AQUI: Limpa espaços do email
          password: password 
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Email ou password incorretos");
      
      showToast("Login efetuado com sucesso!", "success");
      await loadData();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" });
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
  }

  async function handleCreateService(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/reservations/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          durationMin: Number(formData.durationMin),
          price: Number(formData.price),
        }),
        credentials: "include", // Envia o cookie de autenticação
      });
      
      if (!res.ok) throw new Error("Erro ao criar serviço");
      
      setFormData({ name: "", durationMin: "30", price: "" });
      loadData();
      showToast("Serviço criado com sucesso!", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  }

  async function handleCancelReservation(id: string) {
    if (!window.confirm("Tem a certeza que deseja cancelar esta reserva?")) return;
    try {
      const res = await fetch(`/api/v1/reservations/${id}/cancel`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao cancelar");
      loadData();
      showToast("Reserva cancelada.", "success");
    } catch (err) {
      showToast("Erro ao cancelar reserva.", "error");
    }
  }

  // Ecrã de Login
  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
            {toast.message}
          </div>
        )}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-200 w-full max-w-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-zinc-900">Área Restrita</h2>
            <p className="text-sm text-zinc-500 mt-1">Painel de Gestão do Marka</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-700 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-zinc-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                placeholder="admin@marka.ao"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-zinc-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 mt-2">
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>
          
          <Link to="/" className="block text-center mt-6 text-xs text-zinc-400 hover:text-zinc-900">
            Voltar à página inicial
          </Link>
        </div>
      </div>
    );
  }

  // Ecrã de Loading
  if (loading && !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500">A carregar...</div>;
  }

  // Ecrã do Painel
  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10 relative overflow-hidden">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Painel de Gestão</h1>
          <p className="text-sm text-zinc-500">Gerir serviços e reservas</p>
        </div>
        <div className="flex gap-3">
          <Link to="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-300 px-4 py-2 rounded-lg">
            Ver Site
          </Link>
          <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-800 border border-red-200 px-4 py-2 rounded-lg bg-red-50 transition-colors">
            Sair
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Novo Serviço</h2>
          <form onSubmit={handleCreateService} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-700 mb-1">Nome</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="Ex: Manicure" />
            </div>
            <div>
              <label className="block text-sm text-zinc-700 mb-1">Duração (min)</label>
              <input type="number" required min="5" value={formData.durationMin} onChange={e => setFormData({...formData, durationMin: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-zinc-700 mb-1">Preço (Kz)</label>
              <input type="number" required min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="Ex: 3000" />
            </div>
            <button type="submit" className="w-full bg-zinc-900 text-white py-2 rounded-lg font-medium hover:bg-zinc-800 transition-colors">
              Adicionar
            </button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50">
              <h2 className="font-semibold text-zinc-900">Agenda de Reservas</h2>
            </div>
            {reservations.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-sm">Nenhuma reserva.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Data/Hora</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Serviço</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {reservations.map(r => (
                    <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3 text-zinc-700">{new Date(r.startTime).toLocaleString("pt-AO")}</td>
                      <td className="px-4 py-3 font-medium">{r.clientName} <span className="text-zinc-400 block text-xs">{r.clientPhone}</span></td>
                      <td className="px-4 py-3 text-zinc-600">{r.service.name}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleCancelReservation(r.id)} className="text-xs font-medium text-red-600 hover:text-red-800 hover:underline">
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
            <h2 className="font-semibold text-zinc-900 mb-4">Serviços no Catálogo</h2>
            <ul className="space-y-2">
              {services.map(s => (
                <li key={s.id} className="flex justify-between items-center text-sm border-b border-zinc-100 pb-2">
                  <span className="text-zinc-800">{s.name} ({s.durationMin} min)</span>
                  <span className="font-medium text-zinc-900">{s.price} Kz</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}