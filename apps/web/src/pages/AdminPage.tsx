import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch, setAccessToken } from "../lib/api";

type Service = { id: string; name: string; durationMin: number; price: number };
type Reservation = { id: string; clientName: string; clientPhone: string; startTime: string; status: string; service: { name: string } };
type Product = { id: string; name: string; price: number; stock: number; imageUrl: string | null };

export default function AdminPage() {
  const { slug } = useParams();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"reservations" | "services" | "store" | "settings" | "profile">("reservations");
  
  const [services, setServices] = useState<Service[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [hours, setHours] = useState({ openTime: "08:00", closeTime: "18:00" });
  
  // Estado atualizado com os novos campos
  const [businessData, setBusinessData] = useState({ name: "", logoUrl: "", primaryColor: "#1A4D2E", phone: "", iban: "", expressNumber: "" });

  const [formData, setFormData] = useState({ name: "", durationMin: "30", price: "" });
  const [productData, setProductData] = useState({ name: "", price: "", stock: "10", imageUrl: "" });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function loadData() {
    if (!slug) return;
    try {
      const [resSvc, resRes, resHours, resProducts, resBusiness] = await Promise.all([
        apiFetch<Service[]>("/api/v1/reservations/services", { skipAuth: true, tenant: slug }),
        apiFetch<Reservation[]>("/api/v1/reservations", { tenant: slug }),
        apiFetch<{ openTime: string, closeTime: string }>("/api/v1/reservations/hours", { skipAuth: true, tenant: slug }),
        apiFetch<Product[]>("/api/v1/products", { skipAuth: true, tenant: slug }),
        apiFetch<any>("/api/v1/business/info", { skipAuth: true, tenant: slug })
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
        expressNumber: resBusiness.expressNumber || ""
      });
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
    }
  }

  useEffect(() => { loadData(); }, [slug]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const data = await apiFetch<{ token: string }>("/api/v1/auth/login", {
        method: "POST", body: JSON.stringify({ email: email.trim(), password }), skipAuth: true, tenant: slug,
      });
      setAccessToken(data.token);
      showToast("Login efetuado!", "success");
      await loadData();
    } catch (err: any) { showToast(err.message, "error"); } finally { setLoading(false); }
  }

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      await apiFetch("/api/v1/business/info", { method: "PATCH", body: JSON.stringify(businessData), tenant: slug });
      showToast("Perfil atualizado!", "success");
    } catch (err: any) { showToast(err.message, "error"); } finally { setLoading(false); }
  }

  async function handleCreateService(e: FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      await apiFetch("/api/v1/reservations/services", { method: "POST", body: JSON.stringify({ name: formData.name, durationMin: Number(formData.durationMin), price: Number(formData.price) }), tenant: slug });
      setFormData({ name: "", durationMin: "30", price: "" });
      await loadData(); showToast("Serviço criado!", "success");
    } catch (err: any) { showToast(err.message, "error"); } finally { setLoading(false); }
  }

  async function handleUpdateHours(e: FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      await apiFetch("/api/v1/reservations/hours", { method: "PATCH", body: JSON.stringify(hours), tenant: slug });
      showToast("Horário atualizado!", "success");
    } catch (err) { showToast("Erro ao atualizar", "error"); } finally { setLoading(false); }
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  }

  async function handleCreateProduct(e: FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      let finalImageUrl = productData.imageUrl;
      if (imageFile) {
        setUploading(true);
        const formDataObj = new FormData();
        formDataObj.append("image", imageFile);
        const uploadRes = await apiFetch<{ url: string }>("/api/v1/upload", { method: "POST", body: formDataObj, tenant: slug });
        finalImageUrl = uploadRes.url;
        setUploading(false);
      }
      await apiFetch("/api/v1/products", {
        method: "POST",
        body: JSON.stringify({ name: productData.name, price: Number(productData.price), stock: Number(productData.stock), imageUrl: finalImageUrl || undefined }),
        tenant: slug,
      });
      setProductData({ name: "", price: "", stock: "10", imageUrl: "" });
      setImageFile(null); setImagePreview(null);
      await loadData(); showToast("Produto adicionado!", "success");
    } catch (err: any) { showToast(err.message, "error"); setUploading(false); } finally { setLoading(false); }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Apagar este produto da loja?")) return;
    setLoading(true);
    try {
      await apiFetch(`/api/v1/products/${id}`, { method: "DELETE", tenant: slug });
      await loadData(); showToast("Produto apagado.", "success");
    } catch (err) { showToast("Erro ao apagar produto.", "error"); } finally { setLoading(false); }
  }

  async function handleDeleteService(id: string) {
    if (!confirm("Apagar este serviço?")) return;
    setLoading(true);
    try { await apiFetch(`/api/v1/reservations/services/${id}`, { method: "DELETE", tenant: slug }); await loadData(); showToast("Serviço apagado.", "success"); } 
    catch (err) { showToast("Erro ao apagar", "error"); } finally { setLoading(false); }
  }

  async function handleCancelReservation(id: string) {
    if (!confirm("Cancelar esta reserva?")) return;
    setLoading(true);
    try { await apiFetch(`/api/v1/reservations/${id}/cancel`, { method: "PATCH", tenant: slug }); await loadData(); showToast("Reserva cancelada.", "success"); } 
    catch (err) { showToast("Erro ao cancelar", "error"); } finally { setLoading(false); }
  }

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        {toast && <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>{toast.message}</div>}
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-zinc-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
            <h2 className="text-2xl font-bold text-zinc-900">Área Restrita</h2>
            <p className="text-xs text-zinc-500 mt-1 capitalize">Gestão: {slug}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border border-zinc-300 rounded-lg px-4 py-2 text-sm outline-none" />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full border border-zinc-300 rounded-lg px-4 py-2 text-sm outline-none" />
            <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-2.5 rounded-lg font-semibold hover:bg-zinc-800 transition-all mt-2">Entrar no Painel</button>
          </form>
          <Link to={`/${slug}/planos`} className="block text-center mt-6 text-xs text-blue-600 font-bold hover:underline">Pagar Subscrição</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8 relative">
      {toast && <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl text-white font-medium ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>{toast.message}</div>}
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 max-w-5xl mx-auto gap-4">
        <div className="flex items-center gap-4">
          {businessData.logoUrl ? <img src={businessData.logoUrl} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: businessData.primaryColor }}>{businessData.name.charAt(0)}</div>}
          <div><h1 className="text-2xl font-bold text-zinc-900">{businessData.name}</h1><p className="text-zinc-500 text-sm">Gestão de Reservas e Loja.</p></div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link to={`/${slug}/loja`} target="_blank" className="flex-1 md:flex-none text-center text-sm font-semibold border-2 border-zinc-200 text-zinc-700 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-50">Ver Loja</Link>
          <button onClick={() => { setAccessToken(null); setIsAuthenticated(false); }} className="flex-1 md:flex-none text-sm font-semibold bg-white border-2 border-red-100 text-red-600 px-5 py-2.5 rounded-xl hover:bg-red-50">Sair</button>
        </div>
      </header>
      
      <div className="max-w-5xl mx-auto flex flex-wrap gap-2 mb-8 bg-zinc-100 p-2 rounded-2xl overflow-x-auto">
        <button onClick={() => setActiveTab("reservations")} className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === "reservations" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}>Reservas</button>
        <button onClick={() => setActiveTab("services")} className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === "services" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}>Serviços</button>
        <button onClick={() => setActiveTab("store")} className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === "store" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}>Loja</button>
        <button onClick={() => setActiveTab("settings")} className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === "settings" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}>Horário</button>
        <button onClick={() => setActiveTab("profile")} className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === "profile" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}>Perfil</button>
      </div>

      <div className="max-w-5xl mx-auto">
        {activeTab === "reservations" && (
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase border-b border-zinc-200">
                <tr><th className="px-6 py-4">Data</th><th className="px-6 py-4">Cliente</th><th className="px-6 py-4">Serviço</th><th className="px-6 py-4">Ação</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {reservations.length === 0 ? <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Nenhuma reserva agendada.</td></tr> : reservations.map(r => (
                  <tr key={r.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4 font-medium text-zinc-900">{new Date(r.startTime).toLocaleString("pt-AO")}</td>
                    <td className="px-6 py-4">{r.clientName}</td>
                    <td className="px-6 py-4 text-zinc-600">{r.service.name}</td>
                    <td className="px-6 py-4">
                      {r.status !== "CANCELLED" ? (
                        <button onClick={() => handleCancelReservation(r.id)} disabled={loading} className="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors disabled:opacity-50">Cancelar</button>
                      ) : (
                        <span className="text-zinc-500 text-xs font-medium bg-zinc-100 px-4 py-1.5 rounded-full">Cancelada</span>
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
             <div className="bg-white p-6 rounded-2xl border border-zinc-200 h-fit shadow-sm">
               <h2 className="font-bold text-lg mb-4 text-zinc-900">Novo Serviço</h2>
               <form onSubmit={handleCreateService} className="space-y-4">
                 <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none" />
                 <input type="number" required value={formData.durationMin} onChange={e => setFormData({...formData, durationMin: e.target.value})} placeholder="Duração (min)" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none" />
                 <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Preço (Kz)" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none" />
                 <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-2.5 rounded-lg font-semibold hover:bg-zinc-800">Adicionar</button>
               </form>
             </div>
             <div className="md:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
               <h2 className="font-bold text-lg mb-4 text-zinc-900">Serviços Ativos</h2>
               <ul className="space-y-3">
                 {services.map(s => (
                   <li key={s.id} className="flex justify-between items-center p-3 border border-zinc-100 rounded-xl bg-zinc-50">
                     <span className="font-medium text-zinc-800">{s.name} ({s.durationMin}m) - {Number(s.price).toLocaleString("pt-AO")} Kz</span>
                     <button onClick={() => handleDeleteService(s.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                   </li>
                 ))}
               </ul>
             </div>
           </div>
        )}

        {activeTab === "store" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 h-fit shadow-sm">
              <h2 className="font-bold text-lg mb-4 text-zinc-900">Novo Produto</h2>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <input required value={productData.name} onChange={e => setProductData({...productData, name: e.target.value})} placeholder="Nome" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none" />
                <input type="number" required value={productData.price} onChange={e => setProductData({...productData, price: e.target.value})} placeholder="Preço (Kz)" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none" />
                <input type="number" required value={productData.stock} onChange={e => setProductData({...productData, stock: e.target.value})} placeholder="Stock" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none" />
                <div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200" />
                  {imagePreview && <img src={imagePreview} className="mt-3 w-full h-32 object-cover rounded-lg" />}
                </div>
                <button type="submit" disabled={loading || uploading} className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700">{uploading ? "A enviar..." : "Adicionar"}</button>
              </form>
            </div>
            <div className="md:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-4 text-zinc-900">Produtos na Loja</h2>
              <ul className="space-y-3">
                {products.map(p => (
                  <li key={p.id} className="flex justify-between items-center p-3 border border-zinc-100 rounded-xl bg-zinc-50">
                    <div className="flex items-center gap-3">
                       {p.imageUrl ? <img src={p.imageUrl} className="w-12 h-12 rounded-md object-cover" /> : <div className="w-12 h-12 bg-zinc-200 rounded-md"></div>}
                       <span className="font-medium text-zinc-800">{p.name} - {Number(p.price).toLocaleString("pt-AO")} Kz (Stock: {p.stock})</span>
                    </div>
                    <button onClick={() => handleDeleteProduct(p.id)} disabled={loading} className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 max-w-sm shadow-sm">
            <h2 className="font-bold text-lg mb-4 text-zinc-900">Horário</h2>
            <form onSubmit={handleUpdateHours} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Abertura</label>
                <input type="time" required value={hours.openTime} onChange={e => setHours({...hours, openTime: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Fecho</label>
                <input type="time" required value={hours.closeTime} onChange={e => setHours({...hours, closeTime: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-2.5 rounded-lg font-semibold">Guardar</button>
            </form>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 max-w-lg shadow-sm">
            <h2 className="font-bold text-lg mb-4 text-zinc-900">Perfil do Negócio</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Nome</label>
                <input type="text" required value={businessData.name} onChange={e => setBusinessData({...businessData, name: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Link da Logo (URL)</label>
                <input type="url" value={businessData.logoUrl} onChange={e => setBusinessData({...businessData, logoUrl: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Cor Principal</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={businessData.primaryColor} onChange={e => setBusinessData({...businessData, primaryColor: e.target.value})} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={businessData.primaryColor} onChange={e => setBusinessData({...businessData, primaryColor: e.target.value})} className="w-32 border rounded-lg px-3 py-2 uppercase font-mono" />
                </div>
              </div>
              
              {/* NOVOS CAMPOS DE PAGAMENTO E CONTACTO */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">WhatsApp de Suporte</label>
                <input type="text" value={businessData.phone} onChange={e => setBusinessData({...businessData, phone: e.target.value})} placeholder="Ex: 244923000000" className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">IBAN para Pagamentos</label>
                <input type="text" value={businessData.iban} onChange={e => setBusinessData({...businessData, iban: e.target.value})} placeholder="Ex: AO06 0000..." className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Número Express</label>
                <input type="text" value={businessData.expressNumber} onChange={e => setBusinessData({...businessData, expressNumber: e.target.value})} placeholder="Ex: 923 111 222" className="w-full border rounded-lg px-3 py-2" />
              </div>

              <button type="submit" disabled={loading} className="w-full text-white py-2.5 rounded-lg font-semibold shadow-sm" style={{ backgroundColor: businessData.primaryColor }}>Guardar Alterações</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}