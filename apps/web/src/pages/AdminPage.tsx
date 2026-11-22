import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch, setAccessToken } from "../lib/api";
import AppearanceTab from "../components/AppearanceTab";

type Service = { id: string; name: string; durationMin: number; price: number };
type Reservation = { id: string; clientName: string; clientPhone: string; startTime: string; status: string; notes?: string | null; service: { name: string; durationMin?: number } };
type Product = { id: string; name: string; description: string | null; price: number; stock: number; imageUrl: string | null };
type Tab = "reservations" | "services" | "store" | "settings" | "appearance" | "profile" | "security";
type ResFilter = "upcoming" | "today" | "all" | "cancelled";

const CORES = ["#16a34a", "#1A4D2E", "#1877F2", "#000000", "#DC2626", "#EA580C", "#DB2777", "#7C3AED", "#EAB308"];
const EMPTY_PRODUCT = { name: "", description: "", price: "", stock: "10", imageUrl: "" };
const TAB_LABELS: Record<Tab, string> = {
  reservations: "Reservas",
  services: "Serviços",
  store: "Loja",
  settings: "Horário",
  appearance: "Aparência",
  profile: "Perfil",
  security: "Segurança",
};

// A hora é guardada como o cliente a escolheu (em UTC), por isso mostramos em UTC
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-AO", { timeZone: "UTC", weekday: "short", day: "2-digit", month: "short", year: "numeric" });
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("pt-AO", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" });
const dayNum = (iso: string) => new Date(iso).toLocaleDateString("pt-AO", { timeZone: "UTC", day: "2-digit" });
const monthShort = (iso: string) => new Date(iso).toLocaleDateString("pt-AO", { timeZone: "UTC", month: "short" });

function waLink(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.length === 9) d = "244" + d;
  return `https://wa.me/${d}`;
}

function todayKey() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

export default function AdminPage() {
  const { slug } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("reservations");
  const [services, setServices] = useState<Service[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [hours, setHours] = useState({ openTime: "08:00", closeTime: "18:00" });
  const [businessData, setBusinessData] = useState({
    name: "", logoUrl: "", primaryColor: "#1A4D2E", phone: "", iban: "", expressNumber: "", bankName: "", feedbackPhone: "", address: "",
  });
  const [formData, setFormData] = useState({ name: "", durationMin: "30", price: "" });
  const [productData, setProductData] = useState(EMPTY_PRODUCT);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ type: "product" | "service" | "reservation"; id: string } | null>(null);
  const [securityData, setSecurityData] = useState({ currentPassword: "", newEmail: "", newPassword: "" });
  const [resFilter, setResFilter] = useState<ResFilter>("upcoming");
  const [resSearch, setResSearch] = useState("");

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function uploadImage(file: File) {
    const fd = new FormData();
    fd.append("image", file);
    const res = await apiFetch<{ url: string }>("/api/v1/upload", { method: "POST", body: fd, tenant: slug });
    return res.url;
  }

  async function loadData() {
    if (!slug) return;
    try {
      const [resSvc, resRes, resHours, resProducts, resBusiness] = await Promise.all([
        apiFetch<Service[]>("/api/v1/reservations/services", { skipAuth: true, tenant: slug }),
        apiFetch<Reservation[]>("/api/v1/reservations", { tenant: slug }),
        apiFetch<{ openTime: string; closeTime: string }>("/api/v1/reservations/hours", { skipAuth: true, tenant: slug }),
        apiFetch<Product[]>("/api/v1/products", { skipAuth: true, tenant: slug }),
        apiFetch<any>("/api/v1/business/info", { skipAuth: true, tenant: slug }),
      ]);
      setServices(resSvc);
      setReservations(resRes);
      setHours(resHours);
      setProducts(resProducts);
      setBusinessData({
        name: resBusiness.name,
        logoUrl: resBusiness.logoUrl || "",
        primaryColor: resBusiness.primaryColor,
        phone: resBusiness.phone || "",
        iban: resBusiness.iban || "",
        expressNumber: resBusiness.expressNumber || "",
        bankName: resBusiness.bankName || "",
        feedbackPhone: resBusiness.feedbackPhone || "",
        address: resBusiness.address || "",
      });
      setLogoPreview(resBusiness.logoUrl || null);
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [slug]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
        skipAuth: true,
        tenant: slug,
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

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let finalLogo = businessData.logoUrl;
      if (logoFile) {
        setUploading(true);
        finalLogo = await uploadImage(logoFile);
        setUploading(false);
      }
      await apiFetch("/api/v1/business/info", {
        method: "PATCH",
        body: JSON.stringify({ ...businessData, logoUrl: finalLogo }),
        tenant: slug,
      });
      setLogoFile(null);
      showToast("Perfil atualizado!", "success");
      await loadData();
    } catch (err: any) {
      showToast(err.message, "error");
      setUploading(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateSecurity(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/v1/auth/update-credentials", {
        method: "PATCH",
        body: JSON.stringify(securityData),
        tenant: slug,
      });
      showToast("Credenciais atualizadas com sucesso!", "success");
      setSecurityData({ currentPassword: "", newEmail: "", newPassword: "" });
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function handleRemoveLogo() {
    setBusinessData({ ...businessData, logoUrl: "" });
    setLogoFile(null);
    setLogoPreview(null);
  }

  async function handleCreateService(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/v1/reservations/services", {
        method: "POST",
        body: JSON.stringify({ name: formData.name, durationMin: Number(formData.durationMin), price: Number(formData.price) }),
        tenant: slug,
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

  async function handleUpdateHours(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/v1/reservations/hours", { method: "PATCH", body: JSON.stringify(hours), tenant: slug });
      showToast("Horário atualizado!", "success");
    } catch {
      showToast("Erro ao atualizar", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  }

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setLogoFile(e.target.files[0]);
      setLogoPreview(URL.createObjectURL(e.target.files[0]));
    }
  }

  function startEditProduct(p: Product) {
    setEditingProductId(p.id);
    setProductData({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      stock: String(p.stock),
      imageUrl: p.imageUrl || "",
    });
    setImageFile(null);
    setImagePreview(p.imageUrl || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditProduct() {
    setEditingProductId(null);
    setProductData(EMPTY_PRODUCT);
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleSaveProduct(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImageUrl = productData.imageUrl;
      if (imageFile) {
        setUploading(true);
        finalImageUrl = await uploadImage(imageFile);
        setUploading(false);
      }
      const payload = {
        name: productData.name,
        description: productData.description.trim() || null,
        price: Number(productData.price),
        stock: Number(productData.stock),
        imageUrl: finalImageUrl || null,
      };
      if (editingProductId) {
        await apiFetch(`/api/v1/products/${editingProductId}`, { method: "PATCH", body: JSON.stringify(payload), tenant: slug });
        showToast("Produto atualizado!", "success");
      } else {
        await apiFetch("/api/v1/products", { method: "POST", body: JSON.stringify(payload), tenant: slug });
        showToast("Produto adicionado!", "success");
      }
      cancelEditProduct();
      await loadData();
    } catch (err: any) {
      showToast(err.message, "error");
      setUploading(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteModal) return;
    setLoading(true);
    try {
      if (deleteModal.type === "product") await apiFetch(`/api/v1/products/${deleteModal.id}`, { method: "DELETE", tenant: slug });
      else if (deleteModal.type === "service") await apiFetch(`/api/v1/reservations/services/${deleteModal.id}`, { method: "DELETE", tenant: slug });
      else if (deleteModal.type === "reservation") await apiFetch(`/api/v1/reservations/${deleteModal.id}/cancel`, { method: "PATCH", tenant: slug });
      showToast("Feito com sucesso.", "success");
      await loadData();
    } catch {
      showToast("Erro ao executar a ação.", "error");
    } finally {
      setLoading(false);
      setDeleteModal(null);
    }
  }

  // ---- Reservas: contadores e filtros ----
  const today = todayKey();
  const active = reservations.filter((r) => r.status !== "CANCELLED");
  const countToday = active.filter((r) => r.startTime.slice(0, 10) === today).length;
  const countUpcoming = active.filter((r) => r.startTime.slice(0, 10) >= today).length;
  const countCancelled = reservations.length - active.length;

  const visibleReservations = reservations
    .filter((r) => {
      const day = r.startTime.slice(0, 10);
      if (resFilter === "cancelled") return r.status === "CANCELLED";
      if (r.status === "CANCELLED") return resFilter === "all";
      if (resFilter === "today") return day === today;
      if (resFilter === "upcoming") return day >= today;
      return true;
    })
    .filter((r) => {
      const q = resSearch.trim().toLowerCase();
      if (!q) return true;
      return r.clientName.toLowerCase().includes(q) || r.clientPhone.includes(q) || r.service.name.toLowerCase().includes(q);
    })
    .sort((a, b) => (resFilter === "all" || resFilter === "cancelled" ? b.startTime.localeCompare(a.startTime) : a.startTime.localeCompare(b.startTime)));

  const FILTERS: { id: ResFilter; label: string; count: number }[] = [
    { id: "upcoming", label: "Próximas", count: countUpcoming },
    { id: "today", label: "Hoje", count: countToday },
    { id: "all", label: "Todas", count: reservations.length },
    { id: "cancelled", label: "Canceladas", count: countCancelled },
  ];

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        {toast && <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>{toast.message}</div>}
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-zinc-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-zinc-900">Área Restrita</h2>
            <p className="text-xs text-zinc-500 mt-1 capitalize">Gestão: {slug}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border border-zinc-300 rounded-lg px-4 py-2 text-sm outline-none" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full border border-zinc-300 rounded-lg px-4 py-2 text-sm outline-none" />
            <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-2.5 rounded-lg font-semibold">Entrar no Painel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8 relative">
      {toast && <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl text-white font-medium ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>{toast.message}</div>}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Tem a certeza?</h3>
            <p className="text-center text-gray-500 text-sm mb-6">
              {deleteModal.type === "reservation" ? "A reserva será cancelada." : "Esta ação não pode ser desfeita."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold">Voltar</button>
              <button onClick={handleConfirmDelete} disabled={loading} className="flex-1 text-white py-2.5 rounded-xl font-semibold" style={{ backgroundColor: businessData.primaryColor }}>
                {loading ? "A executar..." : deleteModal.type === "reservation" ? "Sim, Cancelar" : "Sim, Apagar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 max-w-5xl mx-auto gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {logoPreview ? (
            <img src={logoPreview} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: businessData.primaryColor }}>
              {businessData.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-zinc-900 truncate">{businessData.name}</h1>
            <p className="text-zinc-500 text-sm">Gestão de Reservas e Loja.</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link to={`/${slug}/loja`} target="_blank" className="flex-1 md:flex-none text-center text-sm font-semibold border-2 border-zinc-200 text-zinc-700 px-5 py-2.5 rounded-xl bg-white">Ver Loja</Link>
          <button onClick={() => { setAccessToken(null); setIsAuthenticated(false); }} className="flex-1 md:flex-none text-sm font-semibold bg-white border-2 border-red-100 text-red-600 px-5 py-2.5 rounded-xl">Sair</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto flex flex-wrap gap-2 mb-8 bg-zinc-100 p-2 rounded-2xl overflow-x-auto">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap ${activeTab === t ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto">
        {activeTab === "reservations" && (
          <div className="space-y-5">
            {/* Contadores */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl border p-4 shadow-sm">
                <p className="text-xs text-zinc-500 font-medium">Hoje</p>
                <p className="text-3xl font-extrabold" style={{ color: businessData.primaryColor }}>{countToday}</p>
              </div>
              <div className="bg-white rounded-2xl border p-4 shadow-sm">
                <p className="text-xs text-zinc-500 font-medium">Próximas</p>
                <p className="text-3xl font-extrabold text-zinc-900">{countUpcoming}</p>
              </div>
              <div className="bg-white rounded-2xl border p-4 shadow-sm">
                <p className="text-xs text-zinc-500 font-medium">Canceladas</p>
                <p className="text-3xl font-extrabold text-zinc-400">{countCancelled}</p>
              </div>
            </div>

            {/* Filtros e pesquisa */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setResFilter(f.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border ${resFilter === f.id ? "text-white border-transparent" : "bg-white text-zinc-600 border-zinc-200"}`}
                    style={resFilter === f.id ? { backgroundColor: businessData.primaryColor } : undefined}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>
              <input
                value={resSearch}
                onChange={(e) => setResSearch(e.target.value)}
                placeholder="Pesquisar cliente, telefone ou serviço..."
                className="w-full md:w-72 border rounded-full px-4 py-2 text-sm bg-white"
              />
            </div>

            {/* Lista */}
            {visibleReservations.length === 0 ? (
              <div className="bg-white rounded-2xl border p-10 text-center text-zinc-500">Nenhuma reserva encontrada.</div>
            ) : (
              <div className="space-y-3">
                {visibleReservations.map((r) => {
                  const cancelled = r.status === "CANCELLED";
                  return (
                    <div key={r.id} className={`bg-white rounded-2xl border shadow-sm p-4 flex gap-4 items-center ${cancelled ? "opacity-60" : ""}`}>
                      <div className="w-16 shrink-0 rounded-xl text-center py-2 text-white" style={{ backgroundColor: cancelled ? "#A1A1AA" : businessData.primaryColor }}>
                        <p className="text-2xl font-extrabold leading-none">{dayNum(r.startTime)}</p>
                        <p className="text-xs uppercase mt-1">{monthShort(r.startTime)}</p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-zinc-900 truncate">{r.clientName}</p>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cancelled ? "bg-zinc-100 text-zinc-500" : "bg-emerald-50 text-emerald-700"}`}>
                            {cancelled ? "Cancelada" : "Confirmada"}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-600 truncate">
                          {r.service.name} · <span className="font-semibold">{fmtTime(r.startTime)}</span>
                        </p>
                        <p className="text-xs text-zinc-400">{fmtDate(r.startTime)} · {r.clientPhone}</p>
                        {r.notes && <p className="text-xs text-zinc-500 mt-1 truncate">📝 {r.notes}</p>}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        <a href={waLink(r.clientPhone)} target="_blank" rel="noreferrer" className="text-xs font-semibold text-white px-3 py-2 rounded-full text-center" style={{ backgroundColor: "#25D366" }}>
                          WhatsApp
                        </a>
                        {!cancelled && (
                          <button onClick={() => setDeleteModal({ type: "reservation", id: r.id })} className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-full">
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "services" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border h-fit shadow-sm">
              <h2 className="font-bold text-lg mb-4">Novo Serviço</h2>
              <form onSubmit={handleCreateService} className="space-y-4">
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome" className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input type="number" required value={formData.durationMin} onChange={(e) => setFormData({ ...formData, durationMin: e.target.value })} placeholder="Duração (min)" className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="Preço (Kz)" className="w-full border rounded-lg px-3 py-2 text-sm" />
                <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-2.5 rounded-lg font-semibold">Adicionar</button>
              </form>
            </div>
            <div className="md:col-span-2 bg-white rounded-2xl border p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-4">Serviços Ativos</h2>
              <ul className="space-y-3">
                {services.map((s) => (
                  <li key={s.id} className="flex justify-between items-center p-3 border rounded-xl bg-zinc-50">
                    <span>{s.name} ({s.durationMin}m) - {Number(s.price).toLocaleString("pt-AO")} Kz</span>
                    <button onClick={() => setDeleteModal({ type: "service", id: s.id })} className="text-red-500 p-2">🗑️</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "store" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border h-fit shadow-sm">
              <h2 className="font-bold text-lg mb-4">{editingProductId ? "Editar Produto" : "Novo Produto"}</h2>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <input required value={productData.name} onChange={(e) => setProductData({ ...productData, name: e.target.value })} placeholder="Nome" className="w-full border rounded-lg px-3 py-2 text-sm" />
                <textarea rows={3} value={productData.description} onChange={(e) => setProductData({ ...productData, description: e.target.value })} placeholder="Descrição (opcional)" className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
                <input type="number" required value={productData.price} onChange={(e) => setProductData({ ...productData, price: e.target.value })} placeholder="Preço (Kz)" className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input type="number" required min={0} value={productData.stock} onChange={(e) => setProductData({ ...productData, stock: e.target.value })} placeholder="Stock" className="w-full border rounded-lg px-3 py-2 text-sm" />
                <div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm" />
                  {imagePreview && <img src={imagePreview} className="mt-3 w-full h-32 object-cover rounded-lg" />}
                  {editingProductId && <p className="text-xs text-zinc-500 mt-1">Se não escolheres foto nova, fica a atual.</p>}
                </div>
                <button type="submit" disabled={loading || uploading} className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold">
                  {uploading ? "A enviar..." : editingProductId ? "Guardar alterações" : "Adicionar"}
                </button>
                {editingProductId && (
                  <button type="button" onClick={cancelEditProduct} className="w-full bg-zinc-100 text-zinc-700 py-2.5 rounded-lg font-semibold">Cancelar edição</button>
                )}
              </form>
            </div>
            <div className="md:col-span-2 bg-white rounded-2xl border p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-4">Produtos na Loja</h2>
              <ul className="space-y-3">
                {products.length === 0 ? (
                  <li className="text-zinc-500 text-sm">Nenhum produto ainda.</li>
                ) : (
                  products.map((p) => (
                    <li key={p.id} className="flex justify-between items-center p-3 border rounded-xl bg-zinc-50 gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {p.imageUrl ? <img src={p.imageUrl} className="w-12 h-12 rounded-md object-cover shrink-0" /> : <div className="w-12 h-12 bg-zinc-200 rounded-md shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-zinc-500">{Number(p.price).toLocaleString("pt-AO")} Kz · Stock: {p.stock}</p>
                          {p.description && <p className="text-xs text-zinc-400 truncate">{p.description}</p>}
                        </div>
                      </div>
                      <div className="flex shrink-0">
                        <button onClick={() => startEditProduct(p)} className="text-blue-600 p-2" title="Editar">✏️</button>
                        <button onClick={() => setDeleteModal({ type: "product", id: p.id })} className="text-red-500 p-2" title="Apagar">🗑️</button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white p-6 rounded-2xl border max-w-sm shadow-sm">
            <h2 className="font-bold text-lg mb-4">Horário</h2>
            <form onSubmit={handleUpdateHours} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Abertura</label>
                <input type="time" required value={hours.openTime} onChange={(e) => setHours({ ...hours, openTime: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecho</label>
                <input type="time" required value={hours.closeTime} onChange={(e) => setHours({ ...hours, closeTime: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-2.5 rounded-lg font-semibold">Guardar</button>
            </form>
          </div>
        )}

        {activeTab === "appearance" && <AppearanceTab slug={slug} onToast={showToast} />}

        {activeTab === "profile" && (
          <div className="bg-white p-6 rounded-2xl border max-w-lg shadow-sm">
            <h2 className="font-bold text-lg mb-4">Perfil do Negócio</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input type="text" required value={businessData.name} onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Morada</label>
                <input type="text" value={businessData.address} onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })} placeholder="Ex: Talatona, Luanda" className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logo do Negócio</label>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm" />
                {logoPreview && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={logoPreview} className="w-24 h-24 object-cover rounded-full border" />
                    <button type="button" onClick={handleRemoveLogo} className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full font-semibold">Remover logo</button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cor Principal</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {CORES.map((c) => (
                    <button type="button" key={c} onClick={() => setBusinessData({ ...businessData, primaryColor: c })} className="w-10 h-10 rounded-full border-2" style={{ backgroundColor: c, borderColor: businessData.primaryColor === c ? "#000" : "#e4e4e7" }} />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input type="color" value={businessData.primaryColor} onChange={(e) => setBusinessData({ ...businessData, primaryColor: e.target.value })} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                  <span className="text-sm font-mono uppercase">{businessData.primaryColor}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">Também podes mudar a cor na aba Aparência, com pré-visualização.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp de Suporte</label>
                <input type="text" value={businessData.phone} onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })} placeholder="Ex: 244923000000" className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Banco</label>
                <input type="text" value={businessData.bankName} onChange={(e) => setBusinessData({ ...businessData, bankName: e.target.value })} placeholder="Ex: BFA, Atlântico" className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">IBAN</label>
                <input type="text" value={businessData.iban} onChange={(e) => setBusinessData({ ...businessData, iban: e.target.value })} placeholder="Ex: AO06 0000..." className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Número Express</label>
                <input type="text" value={businessData.expressNumber} onChange={(e) => setBusinessData({ ...businessData, expressNumber: e.target.value })} placeholder="Ex: 923 111 222" className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp de Reclamações/Feedback</label>
                <input type="text" value={businessData.feedbackPhone} onChange={(e) => setBusinessData({ ...businessData, feedbackPhone: e.target.value })} placeholder="Ex: 244923000000" className="w-full border rounded-lg px-3 py-2" />
              </div>
              <button type="submit" disabled={loading || uploading} className="w-full text-white py-2.5 rounded-lg font-semibold" style={{ backgroundColor: businessData.primaryColor }}>
                {uploading ? "A enviar..." : "Guardar Alterações"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-white p-6 rounded-2xl border max-w-lg shadow-sm">
            <h2 className="font-bold text-lg mb-4">Segurança da Conta</h2>
            <form onSubmit={handleUpdateSecurity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Password Atual (Obrigatória para alterar)</label>
                <input type="password" required value={securityData.currentPassword} onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <hr className="my-2" />
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Novo Email (Opcional)</label>
                <input type="email" value={securityData.newEmail} onChange={(e) => setSecurityData({ ...securityData, newEmail: e.target.value })} placeholder="Deixe em branco para não alterar" className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Nova Password (Opcional)</label>
                <input type="password" value={securityData.newPassword} onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })} placeholder="Deixe em branco para não alterar" className="w-full border rounded-lg px-3 py-2" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-2.5 rounded-lg font-semibold">Atualizar Credenciais</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}