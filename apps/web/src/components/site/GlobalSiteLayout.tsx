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

  // Menu de cima: só navegação, sem duplicar os 3 botões
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
          <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl px-4 py-3 flex items-center justify-between gap-3 border border-black/5">

            {/* LOGO */}
            <Link to={`/${slug}`} className="font-serif font-bold text-xl shrink-0" style={{ color: primary }}>
              {businessName}
            </Link>

            {/* MENU CENTRO - Igual à tua foto: Início, Sobre, Galeria, Eventos, Blog, Contactos */}
            <nav className="hidden lg:flex items-center gap-1 bg-[#F8F4EF] rounded-full p-1">
              {menu.map((m: any) => (
                <Link
                  key={String(m.href) + String(m.label)}
                  to={hrefOf(m.href)}
                  className="px-3 py-2 rounded-full text-[13px] font-bold hover:bg-white hover:shadow transition whitespace-nowrap"
                >
                  {m.label}
                </Link>
              ))}
            </nav>

            {/* 3 BOTÕES SEMPRE VISÍVEIS AÍ EM CIMA - NÃO PRECISA CLICAR NO CONTACTAR */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <Link
                to={`/${slug}/cardapio`}
                className="px-4 py-2.5 rounded-full text-[13px] font-bold bg-white text-[#1a1412] border border-[#EDE6DF] shadow-sm hover:-translate-y-0.5 transition whitespace-nowrap"
              >
                Cardápio Digital
              </Link>
              <Link
                to={`/${slug}/reservas`}
                className="px-4 py-2.5 rounded-full text-[13px] font-bold text-white shadow-sm hover:-translate-y-0.5 transition whitespace-nowrap"
                style={{ background: primary }}
              >
                Reservar Mesa
              </Link>
              <Link
                to={`/${slug}/takeaway`}
                className="px-4 py-2.5 rounded-full text-[13px] font-bold text-white shadow-sm hover:-translate-y-0.5 transition whitespace-nowrap"
                style={{ background: "#1A1412" }}
              >
                Takeaway
              </Link>
            </div>

            {/* BOTÃO MOBILE - abre os 3 botões também */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden w-11 h-11 rounded-full bg-black text-white text-xl leading-none shrink-0"
              aria-label="Menu"
            >
              ⋯
            </button>
          </div>

          {/* MENU MOBILE - com os 3 botões em cima */}
          {open && (
            <div className="md:hidden mt-2 bg-white rounded-2xl shadow-2xl p-3">
              {/* 3 BOTÕES PRIMEIRO NO MOBILE */}
              <div className="grid grid-cols-1 gap-2 mb-3">
                <Link to={`/${slug}/cardapio`} onClick={() => setOpen(false)} className="block text-center px-4 py-3 rounded-xl font-bold bg-white text-black border border-[#EDE6DF]">
                  Cardápio Digital
                </Link>
                <Link to={`/${slug}/reservas`} onClick={() => setOpen(false)} className="block text-center px-4 py-3 rounded-xl font-bold text-white" style={{ background: primary }}>
                  Reservar Mesa
                </Link>
                <Link to={`/${slug}/takeaway`} onClick={() => setOpen(false)} className="block text-center px-4 py-3 rounded-xl font-bold text-white" style={{ background: "#1A1412" }}>
                  Takeaway
                </Link>
              </div>
              {menu.map((m: any) => (
                <Link
                  key={String(m.href) + String(m.label)}
                  to={hrefOf(m.href)}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-xl font-bold text-[15px] hover:bg-[#F8F4EF]"
                >
                  {m.label}
                </Link>
              ))}
              <Link
                to={`/${slug}/contactos`}
                onClick={() => setOpen(false)}
                className="block mt-2 text-center px-4 py-3 rounded-xl text-white font-bold"
                style={{ background: primary }}
              >
                Contactar
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* EM BAIXO FICA SÓ O WHATSAPP */}
      <FloatingActions phone={phone} primary={primary} />

      <Outlet />
    </div>
  );
}