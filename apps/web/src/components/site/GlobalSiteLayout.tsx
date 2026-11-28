import { Outlet, useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import SiteAnimationRuntime from "./motion/SiteAnimationRuntime";
import { BUSINESS_TYPES, resolveType } from "../../lib/businessTypes";
import FloatingActions from "./FloatingActions";

export default function GlobalSiteLayout() {
  const { slug } = useParams();
  const [theme, setTheme] = useState<any>({});
  const [business, setBusiness] = useState<any>({});
  const [content, setContent] = useState<any>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    apiFetch<any>("/api/v1/business/info", { skipAuth: true, tenant: slug })
      .then((b) => {
        setBusiness(b || {});
        setTheme(b?.theme || b || {});
      })
      .catch(() => {});
    apiFetch<any>("/api/v1/site-content", { skipAuth: true, tenant: slug })
      .then((r) => {
        const c =
          r?.content?.animations ? r.content :
          r?.published?.content ? r.published.content :
          r?.data?.content ? r.data.content :
          r?.data ? r.data :
          r?.published ? r.published :
          r?.content ? r.content :
          r || {};
        setContent(c);
      })
      .catch(() => {});
  }, [slug]);

  const animFromContent: any = content?.animations || content?.animation || {};
  const animFromTheme: any = theme?.animation || theme?.animations || {};

  // FIX BRANCO NO TELEFONE: no mobile força classic e desliga animação
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const experience = isMobile ? "classic" : (animFromContent.experience || "classic");
  const intensity = animFromContent.intensity || animFromTheme.intensity || "normal";
  const enabled = isMobile ? false : (animFromContent.enabled ?? animFromTheme.enabled ?? true);
  const duration = animFromContent.duration || animFromTheme.duration || 800;
  const stagger = animFromContent.stagger || animFromTheme.stagger || 90;
  const parallax = isMobile ? false : (animFromContent.parallax ?? animFromTheme.parallax ?? true);
  const hover = animFromContent.hover ?? animFromTheme.hover ?? true;

  const settings = useMemo(
    () => ({ experience, intensity, enabled, duration, stagger, parallax, hover }),
    [experience, intensity, enabled, duration, stagger, parallax, hover]
  );

  const type: any = resolveType(business as any);
  const cfg: any = (BUSINESS_TYPES as any)[type] || (BUSINESS_TYPES as any).restaurante || {};
  const rawMenu: any[] = Array.isArray(cfg.menu) ? cfg.menu : [];

  // Menu de cima: SÓ navegação. Sem cardapio / reservas / takeaway / servicos
  // Esses 4 vão para os botões empilhados em baixo
  const menu = rawMenu.filter(
    (m: any) => !["cardapio", "reservas", "takeaway", "servicos"].includes(String(m.href || "").toLowerCase())
  );

  const primary = theme?.primaryColor || theme?.primary || business?.primaryColor || "#6B1020";
  const businessName = business?.name || theme?.name || "Alive";
  const phone = business?.phone || business?.whatsapp || "244923000000";

  const hrefOf = (h: string) => (h ? `/${slug}/${h}` : `/${slug}`);

  return (
    <div className="site-animation-root">
      <SiteAnimationRuntime settings={settings} />

      <header className="fixed top-0 left-0 right-0 z-[90]">
  <div className="mx-3 md:mx-6 mt-3">
    <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl px-3 py-2.5 flex items-center justify-between border border-black/5 gap-2">
      <Link to={`/${slug}`} className="font-serif font-bold text-lg whitespace-nowrap shrink-0" style={{ color: primary }}>
        {businessName}
      </Link>

      {/* DESKTOP - Os 3 botões em cima, pintados igual */}
      <nav className="hidden md:flex items-center gap-2">
        <Link to={`/${slug}/cardapio`} className="px-4 py-2.5 rounded-full text-[13px] font-bold text-white shadow" style={{ background: primary }}>Cardápio Digital</Link>
        <Link to={`/${slug}/reservas`} className="px-4 py-2.5 rounded-full text-[13px] font-bold text-white shadow" style={{ background: "#1a1412" }}>Reservar Mesa</Link>
        <Link to={`/${slug}/takeaway`} className="px-4 py-2.5 rounded-full text-[13px] font-bold text-black shadow" style={{ background: "#E8C87A" }}>Takeaway</Link>
        <Link to={`/${slug}/contactos`} className="px-4 py-2.5 rounded-full text-[13px] font-bold border">Contactar</Link>
      </nav>

      {/* MOBILE - Os 3 botões em cima, por baixo do nome, com scroll */}
      <button onClick={() => setOpen(!open)} className="md:hidden w-10 h-10 rounded-full bg-black text-white text-lg leading-none shrink-0" aria-label="Menu">⋯</button>
    </div>

    {/* BARRA MOBILE - Sempre visível, com os 3 botões */}
    <div className="md:hidden mt-2 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      <Link to={`/${slug}/cardapio`} className="whitespace-nowrap px-4 py-2.5 rounded-full text-[12px] font-bold text-white shadow" style={{ background: primary }}>Cardápio Digital</Link>
      <Link to={`/${slug}/reservas`} className="whitespace-nowrap px-4 py-2.5 rounded-full text-[12px] font-bold text-white shadow" style={{ background: "#1a1412" }}>Reservar Mesa</Link>
      <Link to={`/${slug}/takeaway`} className="whitespace-nowrap px-4 py-2.5 rounded-full text-[12px] font-bold text-black shadow" style={{ background: "#E8C87A" }}>Takeaway</Link>
    </div>

    {open && (
      <div className="md:hidden mt-2 bg-white rounded-2xl shadow-2xl p-3">
        {menu.map((m: any) => (
          <Link key={String(m.href) + String(m.label)} to={hrefOf(m.href)} onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl font-bold text-[15px] hover:bg-[#F8F4EF]">{m.label}</Link>
        ))}
      </div>
    )}
  </div>
</header>

      <FloatingActions phone={phone} primary={primary} />

      <Outlet />
    </div>
  );
}