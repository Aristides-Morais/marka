import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import type { Business } from "./usePublicSite";
import type { SiteContent } from "../../lib/siteContent";
import { normalizeUrl } from "../../lib/theme";

type Props = {
  business: Business;
  content: SiteContent;
  primary: string;
  secondary: string;
  children: ReactNode;
  title?: string;
};

export default function SiteLayout({
  business,
  content,
  primary,
  secondary,
  children,
  title,
}: Props) {
  const { slug = "" } = useParams();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  const menu =
    content.menu?.length
      ? content.menu
      : [
          { label: "Início", href: "" },
          { label: "Sobre", href: "sobre" },
          { label: "Serviços", href: "servicos" },
          { label: "Contactos", href: "contactos" },
        ];

  const hrefOf = (h: string) => (h ? `/${slug}/${h}` : `/${slug}`);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF8F6",
        color: "#1a1412",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');
        .sl-serif { font-family: 'Playfair Display', Georgia, serif; }
        .sl-wrap { width: min(1100px, calc(100% - 2rem)); margin-inline: auto; }
        .sl-btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 12px 22px; font-size: 11px; letter-spacing: 0.12em;
          text-transform: uppercase; font-weight: 600; text-decoration: none;
          border: none; cursor: pointer; transition: transform .2s, filter .2s;
        }
        .sl-btn:hover { transform: translateY(-2px); filter: brightness(1.05); }
        .sl-nav a { text-decoration: none; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; font-weight: 500; opacity: .85; }
        .sl-nav a:hover { opacity: 1; }
        .sl-card { transition: transform .3s, box-shadow .3s; }
        .sl-card:hover { transform: translateY(-4px); box-shadow: 0 16px 32px -12px rgba(0,0,0,.12); }
        @media (min-width: 900px) {
          .sl-nav { display: flex !important; }
          .sl-burger { display: none !important; }
        }
      `}</style>

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: scrolled ? "rgba(255,255,255,.94)" : "#fff",
          backdropFilter: scrolled ? "blur(12px)" : undefined,
          borderBottom: "1px solid #EDE6DF",
          boxShadow: scrolled ? "0 1px 0 #EDE6DF" : undefined,
        }}
      >
        <div
          className="sl-wrap"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "14px 0",
          }}
        >
          <Link
            to={`/${slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                style={{ height: 40, objectFit: "contain" }}
              />
            ) : (
              <span className="sl-serif" style={{ fontSize: 20, fontWeight: 600 }}>
                {business.name}
              </span>
            )}
          </Link>

          <nav
            className="sl-nav"
            style={{ display: "none", alignItems: "center", gap: 22 }}
          >
            {menu.map((m) => (
              <Link key={m.href + m.label} to={hrefOf(m.href)} style={{ color: "#1a1412" }}>
                {m.label}
              </Link>
            ))}
            <Link
              to={`/${slug}/contactos`}
              className="sl-btn"
              style={{ background: primary, color: "#fff", padding: "10px 18px" }}
            >
              Contactar
            </Link>
          </nav>

          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="sl-burger"
            style={{
              border: "none",
              background: "transparent",
              fontSize: 22,
              cursor: "pointer",
              display: "block",
            }}
          >
            {open ? "×" : "☰"}
          </button>
        </div>

        {open && (
          <div style={{ borderTop: "1px solid #EDE6DF", padding: "16px 0 24px", background: "#fff" }}>
            <div className="sl-wrap" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {menu.map((m) => (
                <Link
                  key={m.href + m.label}
                  to={hrefOf(m.href)}
                  onClick={() => setOpen(false)}
                  style={{ textDecoration: "none", color: "#1a1412", fontSize: 15, fontWeight: 500 }}
                >
                  {m.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer style={{ background: "#141010", color: "#a89f98", padding: "48px 0 28px", marginTop: 40 }}>
        <div
          className="sl-wrap"
          style={{
            display: "grid",
            gap: 28,
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <div>
            <div className="sl-serif" style={{ color: "#fff", fontSize: 18, marginBottom: 10 }}>
              {business.name}
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              {content.contactIntro || "Estamos disponíveis para si."}
            </p>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>
              Navegação
            </div>
            {menu.slice(0, 6).map((m) => (
              <div key={m.href + m.label} style={{ marginBottom: 8 }}>
                <Link to={hrefOf(m.href)} style={{ color: "#a89f98", textDecoration: "none", fontSize: 13 }}>
                  {m.label}
                </Link>
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>
              Contactos
            </div>
            {business.phone && <p style={{ margin: "0 0 6px", fontSize: 13 }}>{business.phone}</p>}
            {business.address && <p style={{ margin: "0 0 6px", fontSize: 13 }}>{business.address}</p>}
            {business.mapsUrl && (
              <a href={normalizeUrl(business.mapsUrl)} target="_blank" rel="noreferrer" style={{ color: secondary, fontSize: 13 }}>
                Ver no mapa
              </a>
            )}
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>
              Legal
            </div>
            <div style={{ marginBottom: 8 }}>
              <Link to={`/${slug}/privacidade`} style={{ color: "#a89f98", textDecoration: "none", fontSize: 13 }}>
                Privacidade
              </Link>
            </div>
            <div>
              <Link to={`/${slug}/termos`} style={{ color: "#a89f98", textDecoration: "none", fontSize: 13 }}>
                Termos de uso
              </Link>
            </div>
          </div>
        </div>
        <div className="sl-wrap" style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #2a2422", fontSize: 12, textAlign: "center" }}>
          © {new Date().getFullYear()} {business.name}. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

export function PageHero({
  kicker,
  title,
  subtitle,
  primary,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  primary: string;
}) {
  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${primary} 0%, #1a1214 100%)`,
        color: "#fff",
        padding: "72px 0 64px",
      }}
    >
      <div className="sl-wrap" style={{ maxWidth: 720 }}>
        {kicker && (
          <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.7, fontWeight: 600, margin: "0 0 12px" }}>
            {kicker}
          </p>
        )}
        <h1 className="sl-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 1.1, margin: 0 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: "16px 0 0", opacity: 0.8, lineHeight: 1.65, fontSize: 16 }}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}