import { useState } from "react";
import { apiFetch, setAccessToken } from "../lib/api";
import SiteContentEditor from "./SiteContentEditor";

type Business = {
  id: string;
  name: string;
  slug: string;
  type: string;
  template: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  active: boolean;
  createdAt: string;
  theme?: any;
  _count: { users: number; products: number; reservations: number; };
};

type BusinessForm = {
  name: string;
  slug: string;
  adminEmail: string;
  adminPassword: string;
  type: string;
  template: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
    animationExperience: string;
  animationIntensity: string;
  animationEnabled: boolean;
  immersiveSpeed: number;
  immersiveZoom: number;
};

const initialForm: BusinessForm = {
  name: "",
  slug: "",
  adminEmail: "",
  adminPassword: "",
  type: "loja",
  template: "comercio",
  primaryColor: "#173B67",
  secondaryColor: "#F2A900",
  accentColor: "#F7F9FC",
    animationExperience: "classic",
  animationIntensity: "normal",
  animationEnabled: true,
  immersiveSpeed: 2,
  immersiveZoom: 1.2,
};

const businessTypes = [
  { label: "Alimentação", items: [["restaurante","Restaurante","restaurante"],["bar","Bar","restaurante"],["pastelaria","Pastelaria","restaurante"],["padaria","Padaria","restaurante"],["pizzaria","Pizzaria","restaurante"],["cafeteria","Cafetaria","restaurante"],["churrasqueira","Churrasqueira","restaurante"],["geladaria","Geladaria","restaurante"],["catering","Catering","restaurante"],["lanchonete","Lanchonete","restaurante"]] },
  { label: "Comércio", items: [["supermercado","Supermercado","comercio"],["minimercado","Minimercado","comercio"],["loja","Loja geral","comercio"],["loja-online","Loja online","comercio"],["boutique","Boutique","comercio"],["roupas","Loja de roupa","comercio"],["calcados","Loja de calçado","comercio"],["eletronica","Loja de electrónica","comercio"],["informatica","Loja de informática","comercio"],["moveis","Loja de móveis","comercio"],["decoracao","Decoração e artigos para casa","comercio"],["cosmeticos","Cosméticos e perfumaria","comercio"],["florista","Florista","comercio"],["papelaria","Papelaria","comercio"],["livraria","Livraria","comercio"],["acessorios","Acessórios","comercio"],["joalharia","Joalharia","comercio"],["pet-shop","Pet shop","comercio"],["materiais-construcao","Materiais de construção","comercio"],["farmacia","Farmácia","comercio"]] },
  { label: "Beleza e bem-estar", items: [["barbearia","Barbearia","beleza"],["salao","Salão de beleza","beleza"],["unhas","Estúdio de unhas","beleza"],["estetica","Estética","beleza"],["spa","Spa","beleza"],["maquilhagem","Maquilhagem","beleza"],["tatuagem","Estúdio de tatuagem","beleza"],["massagens","Massagens","beleza"]] },
  { label: "Turismo e alojamento", items: [["hotel","Hotel","hotel"],["hospedaria","Hospedaria","hotel"],["guesthouse","Guesthouse","hotel"],["alojamento","Alojamento local","hotel"],["agencia-viagens","Agência de viagens","servicos"],["turismo","Turismo","servicos"],["rent-a-car","Rent-a-car","automovel"]] },
  { label: "Saúde", items: [["clinica","Clínica","saude"],["consultorio","Consultório","saude"],["laboratorio","Laboratório","saude"],["optica","Óptica","saude"],["dentista","Clínica dentária","saude"],["fisioterapia","Fisioterapia","saude"],["veterinaria","Veterinária","saude"]] },
  { label: "Imobiliário e construção", items: [["imobiliaria","Agência imobiliária","imobiliario"],["construcao","Construção civil","imobiliario"],["arquitetura","Arquitectura","imobiliario"],["gestao-imoveis","Gestão de imóveis","imobiliario"],["canalizacao","Canalização","servicos"],["eletricidade","Electricidade","servicos"],["manutencao","Manutenção","servicos"]] },
  { label: "Automóvel", items: [["oficina","Oficina automóvel","automovel"],["mecanica","Mecânica","automovel"],["eletricista-auto","Electricista auto","automovel"],["lavagem-auto","Lavagem automóvel","automovel"],["pneus","Pneus","automovel"],["pecas-auto","Peças automóveis","automovel"]] },
  { label: "Educação", items: [["escola","Escola","educacao"],["colegio","Colégio","educacao"],["universidade","Universidade","educacao"],["centro-formacao","Centro de formação","educacao"],["explicacoes","Centro de explicações","educacao"],["cursos","Cursos profissionais","educacao"]] },
  { label: "Eventos e criatividade", items: [["fotografia","Fotografia","eventos"],["video","Produção de vídeo","eventos"],["decoracao-eventos","Decoração de eventos","eventos"],["salao-festas","Salão de festas","eventos"],["dj","DJ","eventos"],["organizacao-eventos","Organização de eventos","eventos"]] },
  { label: "Serviços profissionais", items: [["advocacia","Advocacia","servicos"],["contabilidade","Contabilidade","servicos"],["consultoria","Consultoria","servicos"],["informatica-servicos","Serviços de informática","servicos"],["marketing","Marketing e publicidade","servicos"],["limpeza","Limpeza","servicos"],["seguranca","Segurança","servicos"],["transporte","Transportes","servicos"]] },
];

const templates = [
  ["restaurante","Restauração"],["comercio","Comércio"],["beleza","Beleza e bem-estar"],["hotel","Hotelaria e turismo"],["saude","Saúde"],["imobiliario","Imobiliário"],["automovel","Automóvel"],["educacao","Educação"],["eventos","Eventos"],["servicos","Serviços profissionais"],["institucional","Institucional"],
];

const colorPresets = [
  { name: "Comércio", primary: "#173B67", secondary: "#F2A900", accent: "#F7F9FC" },
  { name: "Restauração", primary: "#183D32", secondary: "#E8B04A", accent: "#FFF8E9" },
  { name: "Beleza", primary: "#633B55", secondary: "#D8A6B8", accent: "#FFF7F9" },
  { name: "Hotelaria", primary: "#172B4D", secondary: "#B99A5B", accent: "#F5F1E8" },
  { name: "Saúde", primary: "#087F8C", secondary: "#75C9B7", accent: "#F4FBFA" },
  { name: "Imobiliário", primary: "#263746", secondary: "#B77B45", accent: "#F5F2EC" },
  { name: "Automóvel", primary: "#20252B", secondary: "#D94343", accent: "#F2F3F5" },
  { name: "Educação", primary: "#243B73", secondary: "#E6B84A", accent: "#F8FAFF" },
  { name: "Eventos", primary: "#42204E", secondary: "#D6A84F", accent: "#FFF9F0" },
  { name: "Serviços", primary: "#244C5A", secondary: "#70A6A0", accent: "#F4F8F7" },
];

const animationOptions = [
  ["classic","Classic - Sem animação forte"],
  ["store-3d","Loja 3D (Blockbuster)"],
  ["immersive","Scroll Imersivo (SOLCO)"],
  ["beauty","Beauty / Suave (brune)"],
  ["real-estate","Real Estate - Zoom suave"],
  ["corporate","Corporate - Troca de Cor"],
  ["color-theme","A1 - Troca de Cor (Vernizes)"],
  ["drag-3d","A4 - Arrastar 3D (brune)"],
  ["fade-up","Fade Up - Sobe suave"],
  ["zoom-hero","Zoom Hero - Zoom gigante"],
  ["slide-cards","Slide Cards - Entra de lado"],
  ["parallax-forte","Parallax Forte"],
];

function getRecommendedTemplate(type: string) {
  for (const group of businessTypes) { const item = group.items.find((e) => e[0] === type); if (item) return item[2]; }
  return "comercio";
}
function getBusinessLabel(type: string) {
  for (const group of businessTypes) { const item = group.items.find((e) => e[0] === type); if (item) return item[1]; }
  return type;
}
function getAnimationLabel(exp: string) {
  return animationOptions.find((o) => o[0] === exp)?.[1] || exp;
}

export default function SuperAdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [form, setForm] = useState<BusinessForm>(initialForm);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contentBusiness, setContentBusiness] = useState<Business | null>(null);

  async function loadBusinesses() {
    try { const data = await apiFetch<Business[]>("/api/v1/super-admin/businesses"); setBusinesses(data); }
    catch { setAccessToken(null); setIsLoggedIn(false); setError("Sessão expirada. Faça login novamente."); }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(""); setAccessToken(null);
    try {
      const data = await apiFetch<{ token: string }>("/api/v1/super-admin/login", { method: "POST", body: JSON.stringify({ email, password }), skipAuth: true });
      setAccessToken(data.token); setIsLoggedIn(true); await loadBusinesses();
    } catch { setError("Email ou password incorrectos. Verifique as variáveis no Render."); }
    finally { setLoading(false); }
  }

  async function toggleBusiness(id: string) {
    try { await apiFetch(`/api/v1/super-admin/businesses/${id}/toggle`, { method: "PATCH" }); await loadBusinesses(); }
    catch { alert("Erro ao alterar estado do negócio."); }
  }

  function startCreate() { setEditingId(null); setForm(initialForm); setError(""); setShowCreate(true); }

  function startEdit(business: Business) {
    setEditingId(business.id);
    setForm({
      name: business.name, slug: business.slug, adminEmail: "", adminPassword: "",
      type: business.type || "loja", template: business.template || "comercio",
      primaryColor: business.primaryColor || "#173B67", secondaryColor: business.secondaryColor || "#F2A900", accentColor: business.accentColor || "#F7F9FC",
            animationExperience: business.theme?.animation?.experience || "classic",
      animationIntensity: business.theme?.animation?.intensity || "normal",
      animationEnabled: business.theme?.animation?.enabled ?? true,
      immersiveSpeed: business.theme?.animation?.immersiveSpeed || 2,
      immersiveZoom: business.theme?.animation?.immersiveZoom || 1.2,
    });
    setError(""); setShowCreate(true);
  }

  function changeType(type: string) { setForm((c) => ({ ...c, type, template: getRecommendedTemplate(type) })); }
  function applyPreset(index: string) {
    const preset = colorPresets[Number(index)]; if (!preset) return;
    setForm((c) => ({ ...c, primaryColor: preset.primary, secondaryColor: preset.secondary, accentColor: preset.accent }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
        const animationPayload = { enabled: form.animationEnabled, experience: form.animationExperience, intensity: form.animationIntensity, duration: 800, stagger: 90, parallax: form.animationExperience !== "classic" && form.animationExperience !== "imersivo", hover: true, immersiveSpeed: form.immersiveSpeed, immersiveZoom: form.immersiveZoom };
    try {
      if (editingId) {
        await apiFetch(`/api/v1/super-admin/businesses/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify({ name: form.name, type: form.type, template: form.template, primaryColor: form.primaryColor, secondaryColor: form.secondaryColor, accentColor: form.accentColor, theme: { animation: animationPayload } }),
        });
        alert("Configurações do negócio actualizadas com sucesso!");
      } else {
        await apiFetch("/api/v1/super-admin/businesses", {
          method: "POST",
          body: JSON.stringify({ ...form, theme: { animation: animationPayload } }),
        });
        alert("Negócio criado com sucesso!");
      }
      setShowCreate(false); setEditingId(null); setForm(initialForm); await loadBusinesses();
    } catch (err: any) { setError(err?.message || "Não foi possível guardar as alterações."); }
    finally { setLoading(false); }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="bg-zinc-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-zinc-700">
          <div className="text-center mb-8"><h1 className="text-3xl font-black text-white tracking-tighter">MARKA<span className="text-emerald-500">.</span></h1><p className="text-zinc-400 text-sm mt-1">Painel do Fundador</p></div>
          {error && <div className="bg-red-500/10 text-red-400 text-xs p-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" required placeholder="Email de Super Admin" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500" />
            <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500" />
            <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors">{loading ? "A verificar..." : "Entrar no Sistema"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 text-white font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div><h1 className="text-2xl font-black tracking-tighter">MARKA<span className="text-emerald-500">.</span> ADMIN</h1><p className="text-zinc-400 text-sm">Gestão de Clientes, Templates e Identidade Visual</p></div>
        <button onClick={() => { setAccessToken(null); setIsLoggedIn(false); }} className="text-sm bg-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors">Sair</button>
      </header>
      <main className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold">Negócios registados ({businesses.length})</h2><button onClick={startCreate} className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-600 text-sm transition-colors">+ Novo Negócio</button></div>

        {showCreate && (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8">
            <div className="flex justify-between items-center mb-5"><h3 className="font-bold text-lg">{editingId ? "Editar Negócio" : "Criar Novo Negócio"}</h3><button type="button" onClick={() => { setShowCreate(false); setEditingId(null); setError(""); }} className="text-zinc-400 hover:text-white text-sm">Fechar</button></div>
            {error && <div className="bg-red-500/10 text-red-400 text-xs p-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs text-zinc-400 mb-2">Nome do negócio</label><input required placeholder="Nome do Negócio" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none" /></div>
              <div><label className="block text-xs text-zinc-400 mb-2">Slug / Link</label><input required disabled={Boolean(editingId)} placeholder="Ex: minha-loja" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().trim().replace(/\s+/g, "-") })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none disabled:opacity-50" /></div>
              <div><label className="block text-xs text-zinc-400 mb-2">Actividade do negócio</label><select value={form.type} onChange={(e) => changeType(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm">{businessTypes.map((g) => (<optgroup key={g.label} label={g.label}>{g.items.map((item) => (<option key={item[0]} value={item[0]}>{item[1]}</option>))}</optgroup>))}</select></div>
              <div><label className="block text-xs text-zinc-400 mb-2">Template visual</label><select value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm">{templates.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}</select></div>

              {!editingId && (<>
                <div><label className="block text-xs text-zinc-400 mb-2">Email do administrador</label><input required type="email" placeholder="Email do Admin" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm" /></div>
                <div><label className="block text-xs text-zinc-400 mb-2">Password do administrador</label><input required type="password" minLength={8} placeholder="Mínimo 8 caracteres" value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm" /></div>
              </>)}

              <div className="md:col-span-2 border-t border-zinc-800 pt-5 mt-2">
                <h4 className="font-bold mb-1">Identidade visual</h4><p className="text-xs text-zinc-400 mb-4">Escolha uma combinação ou personalize as três cores.</p>
                <label className="block text-xs text-zinc-400 mb-2">Combinações recomendadas</label>
                <select defaultValue="" onChange={(e) => applyPreset(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm mb-5"><option value="">Escolher combinação de cores...</option>{colorPresets.map((p, i) => (<option key={p.name} value={i}>{p.name}</option>))}</select>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {([["Cor principal","primaryColor"],["Cor secundária","secondaryColor"],["Cor de destaque","accentColor"]] as const).map(([label, key]) => (
                    <div key={key} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4"><label className="block text-xs text-zinc-300 mb-3">{label}</label><div className="flex items-center gap-3 mb-3"><input type="color" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value.toUpperCase() })} className="w-12 h-10 bg-transparent border-0 cursor-pointer" /><input value={form[key]} maxLength={7} pattern="^#[0-9A-Fa-f]{6}$" onChange={(e) => setForm({ ...form, [key]: e.target.value.toUpperCase() })} className="min-w-0 w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" /></div></div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl overflow-hidden border border-zinc-700"><div className="p-5" style={{ backgroundColor: form.accentColor, color: form.primaryColor }}><div className="text-lg font-black">{form.name || "Nome do negócio"}</div><div className="text-sm mt-1">Pré-visualização das cores do site</div><button type="button" className="mt-4 px-4 py-2 rounded-lg text-sm font-bold" style={{ backgroundColor: form.primaryColor, color: form.accentColor, border: `2px solid ${form.secondaryColor}` }}>Exemplo de botão</button><div className="mt-3 h-2 rounded-full" style={{ backgroundColor: form.secondaryColor }} /></div></div>
              </div>

              <div className="md:col-span-2 border-t border-zinc-800 pt-5 mt-2">
                <h4 className="font-bold mb-1">Animação do site</h4><p className="text-xs text-zinc-400 mb-4">Só o Super Admin controla isto. Escolhe 1 animação por negócio.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-xs text-zinc-400 mb-2">Animação</label><select value={form.animationExperience} onChange={(e) => setForm({ ...form, animationExperience: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm">{animationOptions.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}</select></div>
                  <div><label className="block text-xs text-zinc-400 mb-2">Intensidade</label><select value={form.animationIntensity} onChange={(e) => setForm({ ...form, animationIntensity: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm"><option value="subtle">Suave</option><option value="normal">Normal</option><option value="bold">Forte</option></select></div>
                                    {form.animationExperience === "imersivo" && (
                    <div className="md:col-span-3 grid grid-cols-2 gap-4 bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                      <div><label className="block text-xs text-zinc-400 mb-2">Velocidade Imersivo - quanto mais alto, mais preso ({form.immersiveSpeed})</label><input type="range" min="1" max="3" step="0.5" value={form.immersiveSpeed} onChange={(e) => setForm({ ...form, immersiveSpeed: Number(e.target.value) })} className="w-full" /></div>
                      <div><label className="block text-xs text-zinc-400 mb-2">Zoom do Hero ({form.immersiveZoom})</label><input type="range" min="1" max="1.5" step="0.1" value={form.immersiveZoom} onChange={(e) => setForm({ ...form, immersiveZoom: Number(e.target.value) })} className="w-full" /></div>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="md:col-span-2 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50">{loading ? "A guardar..." : editingId ? "Guardar alterações" : "Criar Negócio"}</button>
            </form>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[850px]">
            <thead className="bg-zinc-950 text-zinc-400 uppercase text-xs"><tr><th className="px-6 py-4">Negócio</th><th className="px-6 py-4">Actividade</th><th className="px-6 py-4">Template</th><th className="px-6 py-4">Animação</th><th className="px-6 py-4">Cores</th><th className="px-6 py-4">Estatísticas</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Acções</th></tr></thead>
            <tbody className="divide-y divide-zinc-800">
              {businesses.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-800/50">
                  <td className="px-6 py-4"><div className="font-medium">{b.name}</div><div className="text-xs text-zinc-500">/{b.slug}</div></td>
                  <td className="px-6 py-4 text-zinc-300">{getBusinessLabel(b.type || "loja")}</td>
                  <td className="px-6 py-4 text-zinc-400">{b.template || "comercio"}</td>
                  <td className="px-6 py-4 text-zinc-300 text-xs">{getAnimationLabel(b.theme?.animation?.experience || "classic")}</td>
                  <td className="px-6 py-4"><div className="flex gap-1">{[b.primaryColor, b.secondaryColor, b.accentColor].map((c, i) => (<span key={i} title={c} className="w-6 h-6 rounded-md border border-white/20" style={{ backgroundColor: c || "#777777" }} />))}</div></td>
                  <td className="px-6 py-4 text-xs text-zinc-400">{b._count.reservations} reservas | {b._count.products} produtos</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${b.active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{b.active ? "Activo" : "Bloqueado"}</span></td>
                  <td className="px-6 py-4"><div className="flex gap-2">
                    <button type="button" onClick={() => setContentBusiness(b)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">Editar site</button>
                    <button type="button" onClick={() => startEdit(b)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">Editar</button>
                    <button type="button" onClick={() => toggleBusiness(b.id)} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${b.active ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"}`}>{b.active ? "Bloquear" : "Activar"}</button>
                  </div></td>
                </tr>
              ))}
              {businesses.length === 0 && (<tr><td colSpan={8} className="px-6 py-10 text-center text-zinc-500">Ainda não existem negócios registados.</td></tr>)}
            </tbody>
          </table>
        </div>
      </main>
      {contentBusiness && (<SiteContentEditor business={contentBusiness} onClose={() => setContentBusiness(null)} />)}
    </div>
  );
}