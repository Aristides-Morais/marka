import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

type Dish = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  category?: string | null;
};

export default function MenuPage() {
  const { slug = "" } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Todos");
  const [selected, setSelected] = useState<Dish | null>(null);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      apiFetch<any>("/api/v1/business/info", { skipAuth: true, tenant: slug }).catch(() => ({})),
      apiFetch<any>("/api/v1/products", { skipAuth: true, tenant: slug }).catch(() => []),
    ])
      .then(([b, p]) => {
        setBusiness(b || {});
        const list = Array.isArray(p) ? p : p?.products || p?.data || [];
        setDishes(Array.isArray(list) ? list : []);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // CORES QUE ESTAVAM EM BAIXO
  const primary = business?.primaryColor || "#C67C2E"; // Reservar Mesa
  const businessName = business?.name || "Restaurante";
  const waNumber = String(business?.phone || business?.whatsapp || "244923000000").replace(/\D/g, "");

  const categories = useMemo(() => {
    const list = Array.from(new Set(dishes.map((d) => d.category || "Pratos").filter(Boolean)));
    return ["Todos", ...list];
  }, [dishes]);

  const filtered = dishes.filter((d) => {
    const okCat = cat === "Todos" || (d.category || "Pratos") === cat;
    const q = search.trim().toLowerCase();
    const okSearch = !q || d.name.toLowerCase().includes(q) || (d.description || "").toLowerCase().includes(q);
    return okCat && okSearch;
  });

  if (loading) {
    return <main className="min-h-screen grid place-items-center bg-black text-white">A carregar cardápio...</main>;
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white font-sans pb-32">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap'); .font-serif{font-family:'Playfair Display',serif} .font-sans{font-family:'DM Sans',sans-serif}`}</style>

      {/* TOPO */}
      <section className="pt-28 px-5 pb-4 max-w-md mx-auto md:max-w-5xl">
        <div className="flex items-center justify-between">
          <Link to={`/${slug}`} className="text-white/80 text-xl">‹</Link>
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold tracking-widest" style={{ color: primary }}>{businessName.split(" ")[0]?.toUpperCase() || "MENU"}</h1>
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/50 -mt-1">{businessName}</p>
          </div>
          <Link to={`/${slug}/takeaway`} className="w-9 h-9 rounded-full bg-white/10 grid place-items-center text-sm">🛍️</Link>
        </div>

        {/* PESQUISA */}
        <div className="mt-5 flex items-center gap-2 bg-[#1A1A1A] rounded-full px-4 py-3">
          <span className="text-white/50">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${businessName} - Pesquisar prato...`}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/40"
          />
          {search && <button onClick={() => setSearch("")} className="text-white/50 text-sm">✕</button>}
        </div>

        <h2 className="mt-6 font-serif text-xl font-bold">Online Menu:</h2>

        {/* CATEGORIAS - SELECIONADA FICA COM A COR DO NEGÓCIO */}
        <div className="flex gap-2 overflow-x-auto pb-1 mt-3" style={{ scrollbarWidth: "none" }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold"
              style={{ background: cat === c ? primary : "#1A1A1A", color: cat === c ? "#fff" : "#fff" }}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* GRELHA */}
      <section className="px-5 max-w-md mx-auto md:max-w-5xl">
        {filtered.length === 0 ? (
          <div className="bg-[#141414] rounded-3xl p-10 text-center text-white/50">
            <p className="text-4xl mb-3">🍽️</p>
            <p>Nenhum prato encontrado.</p>
            <p className="text-xs mt-2">O admin adiciona pratos em <b>/:slug/admin → Cardápio Digital</b></p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((d, i) => (
              <button
                key={d.id}
                onClick={() => setSelected(d)}
                className="text-left bg-[#141414] rounded-[22px] overflow-hidden group"
                style={{ marginTop: i % 2 === 1 ? 14 : 0 }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {d.imageUrl ? (
                    <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover group-active:scale-105 transition" />
                  ) : (
                    <div className="w-full h-full bg-[#1F1F1F] grid place-items-center font-serif text-4xl" style={{ color: primary }}>{d.name.charAt(0)}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {/* PREÇO COM A COR DO NEGÓCIO */}
                  <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/70 backdrop-blur" style={{ color: primary }}>
                    {Number(d.price).toLocaleString()} Kz
                  </span>
                </div>
                <div className="p-3.5">
                  <h3 className="font-serif font-bold text-[15px] leading-tight">{d.name}</h3>
                  <p className="text-[12px] text-white/50 mt-0.5 line-clamp-2">{d.description || "Especial da casa"}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* BOTÕES EM BAIXO DO CARDÁPIO - COM AS CORES QUE ESTAVAM EM BAIXO */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <Link to={`/${slug}/reservas`} className="py-4 rounded-full text-center font-bold text-sm text-white shadow-xl" style={{ background: primary }}>
            Reservar Mesa
          </Link>
          <Link to={`/${slug}/takeaway`} className="py-4 rounded-full text-center font-bold text-sm text-white border border-white/20" style={{ background: "#1A1412" }}>
            Takeaway
          </Link>
        </div>

        <Link to={`/${slug}`} className="block mt-3 py-4 rounded-full text-center font-bold text-sm bg-white text-black">
          Cardápio Digital
        </Link>
      </section>

      {/* MODAL DO PRATO */}
      {selected && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md bg-[#141414] rounded-t-[28px] md:rounded-[28px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              {selected.imageUrl ? (
                <img src={selected.imageUrl} alt={selected.name} className="w-full h-72 object-cover" />
              ) : (
                <div className="w-full h-72 bg-[#1F1F1F] grid place-items-center font-serif text-6xl">{selected.name.charAt(0)}</div>
              )}
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white grid place-items-center">✕</button>
              <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#141414] to-transparent" />
            </div>
            <div className="p-6 -mt-6 relative">
              <div className="flex justify-between items-start gap-3">
                <h3 className="font-serif text-2xl font-bold leading-tight">{selected.name}</h3>
                <span className="text-lg font-bold whitespace-nowrap" style={{ color: primary }}>{Number(selected.price).toLocaleString()} Kz</span>
              </div>
              <p className="text-white/60 text-sm mt-2 leading-relaxed">{selected.description || "Especial da casa, preparado na hora com ingredientes frescos."}</p>

              {/* NO MODAL TAMBÉM COM AS CORES QUE ESTAVAM EM BAIXO */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Olá ${businessName}! Quero pedir: ${selected.name} - ${Number(selected.price).toLocaleString()} Kz`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-4 rounded-full text-center font-bold text-sm text-white"
                  style={{ background: "#25D366" }}
                >
                  Pedir no WhatsApp
                </a>
                <Link to={`/${slug}/takeaway`} className="py-4 rounded-full text-center font-bold text-sm text-white border border-white/20" style={{ background: "#1A1412" }}>
                  Takeaway
                </Link>
              </div>
              <Link to={`/${slug}/reservas`} className="block mt-3 py-4 rounded-full text-center font-bold text-sm text-white" style={{ background: primary }}>
                Reservar Mesa
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}