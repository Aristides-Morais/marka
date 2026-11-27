import { Outlet, useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import SiteAnimationRuntime from "./motion/SiteAnimationRuntime";
import { BUSINESS_TYPES, resolveType } from "../../lib/businessTypes";

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

  const animFromContent = content?.animations || content?.animation || {};
  const animFromTheme = theme?.animation || theme?.animations || {};
  const experience = animFromContent.experience || "classic";
  const intensity = animFromContent.intensity || animFromTheme.intensity || "normal";
  const enabled = animFromContent.enabled ?? animFromTheme.enabled ?? true;
  const duration = animFromContent.duration || animFromTheme.duration || 800;
  const stagger = animFromContent.stagger || animFromTheme.stagger || 90;
  const parallax = animFromContent.parallax ?? animFromTheme.parallax ?? true;
  const hover = animFromContent.hover ?? animFromTheme.hover ?? true;

  const settings = useMemo(() => ({
    experience, intensity, enabled, duration, stagger, parallax, hover,
  }), [experience, intensity, enabled, duration, stagger, parallax, hover]);

  // ---------- MENU POR TIPO DE NEGÓCIO - SÓ UMA VEZ ----------
  const type = resolveType(business);
  const cfg = BUSINESS_TYPES[type];
  const menu = cfg.menu; // <-- SÓ ESTA, APAGA A OUTRA
  const primary = theme?.primaryColor || theme?.primary || "#6B1020";
  const businessName = business?.name || theme?.name || "Alive";
  const waNumber = business?.phone || business?.whatsapp || "244923000000";

  const hrefOf = (h: string) => (h ? `/${slug}/${h}` : `/${slug}`);

  return (
    <div className="site-animation-root">
      <SiteAnimationRuntime settings={settings} />

      <header className="fixed top-0 left-0 right-0 z-[90]">
        <div className="mx-3 md:mx-6 mt-3">
          <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl px-4 py-3 flex items-center justify-between border border-black/5">
            <Link to={`/${slug}`} className="font-serif font-bold text-xl" style={{ color: primary }}>{businessName}</Link>

            <nav className="hidden md:flex items-center gap-1 bg-[#F8F4EF] rounded-full p-1">
              {menu.map((m) => (
                <Link key={m.href} to={hrefOf(m.href)} className="px-3 py-2 rounded-full text-[13px] font-bold hover:bg-white hover:shadow transition">{m.label}</Link>
              ))}
              <Link to={`/${slug}/reservas`} className="ml-1 px-4 py-2 rounded-full text-white text-[13px] font-bold" style={{ background: primary }}>
                {type === "salao" ? "Marcar" : type === "tatuador" ? "Orçamento" : type === "clinica" || type === "ortodontia" ? "Marcar Consulta" : type === "boutique" ? "Encomendar" : "Reservar"}
              </Link>
            </nav>

            <button onClick={() => setOpen(!open)} className="md:hidden w-11 h-11 rounded-full bg-black text-white text-xl leading-none" aria-label="Menu">⋯</button>
          </div>

          {open && (
            <div className="md:hidden mt-2 bg-white rounded-2xl shadow-2xl p-3">
              {menu.map((m) => (
                <Link key={m.href} to={hrefOf(m.href)} onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl font-bold text-[15px] hover:bg-[#F8F4EF]">{m.label}</Link>
              ))}
              <Link to={`/${slug}/reservas`} onClick={() => setOpen(false)} className="block mt-2 text-center px-4 py-3 rounded-xl text-white font-bold" style={{ background: primary }}>Reservar</Link>
            </div>
          )}
        </div>
      </header>

      {/* BOTÃO FIXO WHATSAPP - TODAS AS PÁGINAS, TODOS OS TIPOS */}
      <a href={`https://wa.me/${String(waNumber).replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-[95] w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white shadow-2xl" style={{ background: "#25D366" }}>💬</a>

      <Outlet />
    </div>
  );
}