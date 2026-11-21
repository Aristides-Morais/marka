import { useEffect, useState } from "react";
import { apiFetch, setAccessToken, getAccessToken } from "../lib/api";

type Business = { id: string; name: string; slug: string; active: boolean; createdAt: string; _count: { users: number; products: number; reservations: number } };

export default function SuperAdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getAccessToken());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  
  const [form, setForm] = useState({ name: "", slug: "", adminEmail: "", adminPassword: "" });
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadBusinesses() {
    try {
      const data = await apiFetch<Business[]>("/api/v1/super-admin/businesses");
      setBusinesses(data);
    } catch (err) {
      // Se der erro (ex: 401), limpamos o token antigo e forçamos o login
      setAccessToken(null); 
      setIsLoggedIn(false);
    }
  }

  useEffect(() => {
    if (isLoggedIn) loadBusinesses();
  }, [isLoggedIn]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ token: string }>("/api/v1/super-admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipAuth: true, // Não envia token antigo
      });
      setAccessToken(data.token);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleBusiness(id: string) {
    try {
      await apiFetch(`/api/v1/super-admin/businesses/${id}/toggle`, { method: "PATCH" });
      loadBusinesses();
    } catch (err) { alert("Erro ao alterar estado."); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiFetch("/api/v1/super-admin/businesses", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShowCreate(false);
      setForm({ name: "", slug: "", adminEmail: "", adminPassword: "" });
      loadBusinesses();
      alert("Negócio criado com sucesso!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="bg-zinc-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-zinc-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white tracking-tighter">MARKA<span className="text-emerald-500">.</span></h1>
            <p className="text-zinc-400 text-sm mt-1">Painel do Fundador</p>
          </div>
          {error && <div className="bg-red-500/10 text-red-400 text-xs p-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email de Super Admin" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500" />
            <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors">{loading ? "A entrar..." : "Entrar no Sistema"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 text-white font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tighter">MARKA<span className="text-emerald-500">.</span> ADMIN</h1>
          <p className="text-zinc-400 text-sm">Gestão de Clientes e Subscrições</p>
        </div>
        <button onClick={() => { setAccessToken(null); setIsLoggedIn(false); }} className="text-sm bg-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-700">Sair</button>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Clientes Ativos ({businesses.length})</h2>
          <button onClick={() => setShowCreate(!showCreate)} className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-600 text-sm">
            + Novo Cliente
          </button>
        </div>

        {showCreate && (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8">
            <h3 className="font-bold text-lg mb-4">Criar Novo Cliente</h3>
            {error && <div className="bg-red-500/10 text-red-400 text-xs p-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Nome do Negócio (Ex: Sara Belle)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none" />
              <input required placeholder="Slug/Link (Ex: sara)" value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none" />
              <input required type="email" placeholder="Email do Admin" value={form.adminEmail} onChange={e => setForm({...form, adminEmail: e.target.value})} className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none" />
              <input required type="text" placeholder="Password do Admin" value={form.adminPassword} onChange={e => setForm({...form, adminPassword: e.target.value})} className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none" />
              <button type="submit" disabled={loading} className="md:col-span-2 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600">{loading ? "A criar..." : "Criar Conta"}</button>
            </form>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950 text-zinc-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Negócio</th>
                <th className="px-6 py-4">Link (Slug)</th>
                <th className="px-6 py-4">Estatísticas</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {businesses.map(b => (
                <tr key={b.id} className="hover:bg-zinc-800/50">
                  <td className="px-6 py-4 font-medium">{b.name}</td>
                  <td className="px-6 py-4 text-zinc-400">/{b.slug}</td>
                  <td className="px-6 py-4 text-xs text-zinc-400">
                    {b._count.reservations} reservas | {b._count.products} produtos
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {b.active ? "Ativo" : "Bloqueado"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleBusiness(b.id)} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${b.active ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"}`}>
                      {b.active ? "Bloquear" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}