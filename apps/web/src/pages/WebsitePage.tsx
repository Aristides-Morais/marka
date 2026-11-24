import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { normalizeUrl } from "../lib/theme";

type Business = {
  name: string;
  type?: string | null;
  template?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  address?: string | null;
  phone?: string | null;
  mapsUrl?: string | null;
  links?: { label: string; url: string }[];
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  storeHeroImage?: string | null;
  modules?: string[];
};

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  stock?: number | null;
};

type Service = {
  id: string;
  name: string;
  durationMin?: number;
  price: number;
};

type SiteContent = {
  heroTitle?: string;
  heroSubtitle?: string;
  buttonText?: string;
  heroImage?: string;
  description?: string;
  aboutTitle?: string;
  aboutText?: string;
  gallery?: string[];
  visualIdentity?: Record<string, string>;
  servicesTitle?: string;
  galleryTitle?: string;
  contactTitle?: string;
  serviceImages?: string[];
};

type Sector =
  | "beauty"
  | "food"
  | "retail"
  | "health"
  | "education"
  | "realestate"
  | "services"
  | "general";

function detectSector(type?: string | null, template?: string | null): Sector {
  const value = `${type || ""} ${template || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/beleza|beauty|salao|barbearia|estetica|spa|cabeleireiro|unhas/.test(value)) return "beauty";
  if (/restaurante|restaurant|cafe|cafeteria|bar|food|comida|hotel|pastelaria/.test(value)) return "food";
  if (/saude|health|clinica|medico|dentista|farmacia|hospital/.test(value)) return "health";
  if (/educacao|education|escola|colegio|universidade|formacao|curso/.test(value)) return "education";
  if (/imobiliaria|realestate|imoveis|construcao|arquitetura/.test(value)) return "realestate";
  if (/loja|retail|comercio|shopping|supermercado|fashion|moda/.test(value)) return "retail";
  if (/servicos|services|consultoria|agencia|tecnologia|oficina/.test(value)) return "services";

  return "general";
}

const sectorCopy: Record<
  Sector,
  {
    eyebrow: string;
    offer: string;
    about: string;
    action: string;
    intro: string;
    navOffer: string;
  }
> = {
  beauty: {
    eyebrow: "BELEZA · CUIDADO · BEM-ESTAR",
    offer: "Escolha o seu ritual",
    about: "Cuidado pensado em cada detalhe",
    action: "Agendar horário",
    intro: "Um espaço dedicado ao seu bem-estar, com serviços pensados para realçar a sua melhor versão.",
    navOffer: "Serviços",
  },
  food: {
    eyebrow: "SABOR · MOMENTOS · EXPERIÊNCIA",
    offer: "Descubra o nosso menu",
    about: "Sabor preparado com dedicação",
    action: "Ver menu",
    intro: "Descubra sabores, especialidades e momentos preparados para partilhar.",
    navOffer: "Menu",
  },
  retail: {
    eyebrow: "SELECÇÃO · QUALIDADE · ESTILO",
    offer: "Peças em destaque",
    about: "Escolhas feitas para si",
    action: "Explorar loja",
    intro: "Uma selecção de produtos escolhidos para combinar qualidade, utilidade e estilo.",
    navOffer: "Colecção",
  },
  health: {
    eyebrow: "SAÚDE · CONFIANÇA · CUIDADO",
    offer: "Cuidados e especialidades",
    about: "A sua saúde merece atenção",
    action: "Marcar consulta",
    intro: "Conheça os cuidados e serviços disponíveis e encontre o acompanhamento de que precisa.",
    navOffer: "Especialidades",
  },
  education: {
    eyebrow: "APRENDER · EVOLUIR · CONQUISTAR",
    offer: "Conheça a nossa oferta",
    about: "Conhecimento que abre caminhos",
    action: "Saber mais",
    intro: "Formação e aprendizagem orientadas para desenvolver competências e criar oportunidades.",
    navOffer: "Formação",
  },
  realestate: {
    eyebrow: "ESPAÇOS · OPORTUNIDADES · VALOR",
    offer: "Oportunidades em destaque",
    about: "O espaço certo para o seu próximo capítulo",
    action: "Ver oportunidades",
    intro: "Explore oportunidades e encontre espaços que correspondem aos seus planos.",
    navOffer: "Imóveis",
  },
  services: {
    eyebrow: "EXPERIÊNCIA · SOLUÇÕES · RESULTADOS",
    offer: "Como podemos ajudar",
    about: "Compromisso em cada projecto",
    action: "Pedir informações",
    intro: "Soluções profissionais, acompanhamento próximo e atenção a cada detalhe.",
    navOffer: "Serviços",
  },
  general: {
    eyebrow: "BEM-VINDO · QUALIDADE · CONFIANÇA",
    offer: "Conheça a nossa oferta",
    about: "Uma experiência feita a pensar em si",
    action: "Fale connosco",
    intro: "Conheça melhor o nosso negócio, o que fazemos e como podemos ajudar.",
    navOffer: "Oferta",
  },
};

const money = (value: number) =>
  `${Number(value || 0).toLocaleString("pt-AO")} Kz`;

export default function WebsitePage() {
  const { slug = "" } = useParams();

  const [business, setBusiness] = useState<Business | null>(null);
  const [content, setContent] = useState<SiteContent>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;

    async function load() {
      setLoading(true);

      try {
        const [b, site, p, s] = await Promise.all([
          apiFetch<Business>("/api/v1/business/info", {
            skipAuth: true,
            tenant: slug,
          }),
          apiFetch<{
            isPublished: boolean;
            content: SiteContent | null;
          }>("/api/v1/site-content", {
            skipAuth: true,
            tenant: slug,
          }),
          apiFetch<Product[]>("/api/v1/products", {
            skipAuth: true,
            tenant: slug,
          }).catch(() => []),
          apiFetch<Service[]>("/api/v1/reservations/services", {
            skipAuth: true,
            tenant: slug,
          }).catch(() => []),
        ]);

        if (!live) return;

        setBusiness(b);
        setContent(site?.isPublished && site.content ? site.content : {});
        setProducts(Array.isArray(p) ? p : []);
        setServices(Array.isArray(s) ? s : []);
      } catch (error) {
        console.error("Erro ao carregar website:", error);
      } finally {
        if (live) setLoading(false);
      }
    }

    if (slug) load();

    return () => {
      live = false;
    };
  }, [slug]);

  const sector = useMemo(
    () => detectSector(business?.type, business?.template),
    [business?.type, business?.template]
  );

  if (loading) {
    return <div className="mk-loading">A preparar o seu espaço...</div>;
  }

  if (!business) {
    return <div className="mk-loading">Não foi possível encontrar este negócio.</div>;
  }

  const identity = content.visualIdentity || {};

  const primary =
    identity.primaryColor ||
    identity.primary ||
    business.primaryColor ||
    "#633d49";

  const secondary =
    identity.secondaryColor ||
    identity.secondary ||
    business.secondaryColor ||
    "#c49a62";

  const background = identity.background || "#f5f0eb";
  const surface = identity.surface || "#fffdfb";
  const ink = identity.text || "#30272a";
  const muted = identity.muted || "#82777a";
  const line = identity.border || "#e5dcd6";

  const copy = sectorCopy[sector];

  const title =
    content.heroTitle ||
    business.heroTitle ||
    business.name;

  const subtitle =
    content.heroSubtitle ||
    business.heroSubtitle ||
    copy.intro;

  const heroImage =
    content.heroImage ||
    business.storeHeroImage ||
    "";

  const gallery = Array.isArray(content.gallery)
    ? content.gallery.filter(Boolean)
    : [];

  const serviceImages = Array.isArray(content.serviceImages)
    ? content.serviceImages
    : [];

  const showStore =
    !business.modules ||
    business.modules.some((module) => module.toLowerCase() === "store");

  const showBooking =
    !business.modules ||
    business.modules.some((module) => module.toLowerCase() === "booking");

  const serviceSector = [
    "beauty",
    "health",
    "services",
    "education",
  ].includes(sector);

  const items = serviceSector ? services : products;

  const primaryAction =
    serviceSector && showBooking
      ? `/${slug}/reservas`
      : showStore
        ? `/${slug}/loja`
        : `/#contactos`;

  const whatsapp = business.phone
    ? `https://wa.me/${business.phone.replace(/\D/g, "")}`
    : "";

  return (
    <main
      className="mk-site"
      style={
        {
          "--mk-primary": primary,
          "--mk-accent": secondary,
          "--mk-bg": background,
          "--mk-surface": surface,
          "--mk-ink": ink,
          "--mk-muted": muted,
          "--mk-line": line,
        } as CSSProperties
      }
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap');

        .mk-site {
          background: var(--mk-bg);
          color: var(--mk-ink);
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        .mk-site * { box-sizing: border-box; }

        .mk-container {
          width: min(1240px, calc(100% - 64px));
          margin: 0 auto;
        }

        .mk-serif {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 500;
        }

        .mk-overline {
          font-size: 9px;
          letter-spacing: .28em;
          font-weight: 700;
          text-transform: uppercase;
        }

        .mk-loading {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #f5f0eb;
          color: #51443d;
          font-family: 'DM Sans', sans-serif;
        }

        .mk-header {
          height: 76px;
          position: absolute;
          z-index: 20;
          top: 0;
          left: 0;
          width: 100%;
          color: #fff;
          border-bottom: 1px solid rgba(255,255,255,.22);
        }

        .mk-header-inner {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
        }

        .mk-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          color: inherit;
          text-decoration: none;
          min-width: 0;
        }

        .mk-brand img {
          width: 38px;
          height: 38px;
          object-fit: cover;
          border-radius: 50%;
        }

        .mk-brand-name {
          font-size: 11px;
          letter-spacing: .18em;
          text-transform: uppercase;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mk-nav {
          display: flex;
          align-items: center;
          gap: clamp(14px, 2.5vw, 34px);
        }

        .mk-nav a {
          font-size: 9px;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: inherit;
          text-decoration: none;
          opacity: .88;
        }

        .mk-nav a:hover {
          opacity: 1;
          color: var(--mk-accent);
        }

        .mk-header-cta,
        .mk-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 43px;
          padding: 0 20px;
          border: 1px solid var(--mk-accent);
          background: var(--mk-accent);
          color: #241d1d;
          text-decoration: none;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .15em;
          text-transform: uppercase;
          transition: all .2s;
        }

        .mk-header-cta:hover,
        .mk-button:hover {
          transform: translateY(-2px);
          filter: brightness(1.06);
        }

        .mk-hero {
          position: relative;
          min-height: min(790px, 100svh);
          display: flex;
          align-items: center;
          background: var(--mk-primary);
          color: #fff;
        }

        .mk-hero-image {
          position: absolute;
          inset: 0;
          background-position: center;
          background-size: cover;
        }

        .mk-hero-shade {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(26,17,20,.76) 0%, rgba(26,17,20,.42) 48%, rgba(26,17,20,.12) 100%),
            linear-gradient(0deg, rgba(20,14,16,.32), transparent 42%);
        }

        .mk-hero-content {
          position: relative;
          z-index: 2;
          padding-top: 120px;
          padding-bottom: 100px;
          max-width: 740px;
        }

        .mk-hero h1 {
          font-size: clamp(48px, 7.4vw, 96px);
          line-height: 1.02;
          letter-spacing: -.045em;
          margin: 24px 0 22px;
          max-width: 800px;
        }

        .mk-hero-copy {
          max-width: 520px;
          color: rgba(255,255,255,.82);
          font-size: 14px;
          line-height: 1.9;
        }

        .mk-hero-actions {
          display: flex;
          align-items: center;
          gap: 22px;
          flex-wrap: wrap;
          margin-top: 32px;
        }

        .mk-text-link {
          color: #fff;
          text-decoration: none;
          font-size: 9px;
          letter-spacing: .17em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,.55);
          padding: 0 0 7px;
        }

        .mk-scroll {
          position: absolute;
          z-index: 2;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          letter-spacing: .28em;
          text-transform: uppercase;
          color: rgba(255,255,255,.72);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .mk-scroll:after {
          content: '';
          height: 34px;
          width: 1px;
          background: var(--mk-accent);
        }

        .mk-section {
          padding: clamp(70px, 9vw, 125px) 0;
        }

        .mk-section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 28px;
          margin-bottom: 42px;
        }

        .mk-section-heading h2 {
          font-size: clamp(36px, 5vw, 58px);
          line-height: 1.08;
          margin: 13px 0 0;
          letter-spacing: -.03em;
        }

        .mk-section-note {
          max-width: 330px;
          font-size: 12px;
          line-height: 1.8;
          color: var(--mk-muted);
        }

        .mk-services {
          background: var(--mk-primary);
          color: #fff;
        }

        .mk-services .mk-section-note {
          color: rgba(255,255,255,.65);
        }

        .mk-service-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .mk-service-card {
          background: rgba(255,255,255,.075);
          border: 1px solid rgba(255,255,255,.15);
          min-width: 0;
        }

        .mk-service-image {
          height: clamp(170px, 22vw, 270px);
          width: 100%;
          object-fit: cover;
          display: block;
          background: rgba(255,255,255,.08);
        }

        .mk-service-placeholder {
          height: clamp(170px, 22vw, 270px);
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, rgba(255,255,255,.13), rgba(0,0,0,.08));
          color: var(--mk-accent);
          font-family: 'Playfair Display', serif;
          font-size: 42px;
        }

        .mk-service-body {
          padding: 23px 22px 20px;
        }

        .mk-service-index {
          font-size: 8px;
          letter-spacing: .2em;
          color: var(--mk-accent);
        }

        .mk-service-body h3 {
          font-family: 'Playfair Display', serif;
          font-weight: 500;
          font-size: 25px;
          line-height: 1.2;
          margin: 10px 0;
        }

        .mk-service-body p {
          font-size: 11px;
          line-height: 1.8;
          color: rgba(255,255,255,.65);
          min-height: 40px;
          margin: 0;
        }

        .mk-service-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-top: 1px solid rgba(255,255,255,.16);
          margin-top: 20px;
          padding-top: 15px;
        }

        .mk-price {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          color: #fff;
        }

        .mk-card-link {
          font-size: 8px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--mk-accent);
          text-decoration: none;
        }

        .mk-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(35px, 7vw, 100px);
          align-items: center;
        }

        .mk-about-photo {
          min-height: 440px;
          position: relative;
          background: var(--mk-primary);
          overflow: hidden;
        }

        .mk-about-photo img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mk-about-copy h2 {
          font-size: clamp(38px, 5vw, 62px);
          line-height: 1.08;
          letter-spacing: -.035em;
          margin: 17px 0 22px;
        }

        .mk-about-copy p {
          font-size: 13px;
          line-height: 2;
          color: var(--mk-muted);
          white-space: pre-line;
          max-width: 540px;
        }

        .mk-about-copy .mk-button {
          margin-top: 24px;
        }

        .mk-gallery {
          background: var(--mk-surface);
        }

        .mk-gallery-grid {
          display: grid;
          grid-template-columns: 1.15fr .85fr .85fr;
          grid-template-rows: 230px 230px;
          gap: 12px;
        }

        .mk-gallery-grid img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .mk-gallery-grid img:first-child {
          grid-row: span 2;
        }

        .mk-contact {
          background: #241d20;
          color: #fff;
        }

        .mk-contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          align-items: center;
        }

        .mk-contact h2 {
          font-size: clamp(42px, 6vw, 70px);
          line-height: 1.05;
          margin: 18px 0;
        }

        .mk-contact-copy {
          font-size: 12px;
          line-height: 1.9;
          color: rgba(255,255,255,.65);
          max-width: 450px;
        }

        .mk-contact-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }

        .mk-contact-details a,
        .mk-contact-details p {
          color: rgba(255,255,255,.85);
          font-size: 12px;
          text-decoration: none;
          margin: 0;
        }

        .mk-footer {
          padding: 25px 0;
          background: #171315;
          color: rgba(255,255,255,.55);
          font-size: 9px;
          letter-spacing: .12em;
        }

        .mk-footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .mk-footer a {
          color: inherit;
          text-decoration: none;
        }

        .mk-empty {
          font-size: 12px;
          color: rgba(255,255,255,.65);
          padding: 24px 0;
        }

        @media(max-width:760px) {
          .mk-container {
            width: calc(100% - 36px);
          }

          .mk-header {
            height: 66px;
          }

          .mk-nav {
            display: none;
          }

          .mk-brand-name {
            max-width: 150px;
          }

          .mk-header-cta {
            min-height: 38px;
            padding: 0 12px;
            font-size: 8px;
          }

          .mk-hero {
            min-height: 720px;
            min-height: 88svh;
          }

          .mk-hero-shade {
            background:
              linear-gradient(90deg, rgba(26,17,20,.72), rgba(26,17,20,.24)),
              linear-gradient(0deg, rgba(20,14,16,.45), transparent 70%);
          }

          .mk-hero-content {
            padding-top: 100px;
            padding-bottom: 95px;
          }

          .mk-hero h1 {
            font-size: clamp(48px, 13vw, 76px);
          }

          .mk-hero-copy {
            font-size: 13px;
          }

          .mk-section-heading {
            display: block;
            margin-bottom: 28px;
          }

          .mk-section-note {
            margin-top: 15px;
          }

          .mk-service-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .mk-service-card {
            display: grid;
            grid-template-columns: 38% 1fr;
          }

          .mk-service-image,
          .mk-service-placeholder {
            height: 100%;
            min-height: 190px;
          }

          .mk-service-body {
            padding: 16px 14px;
          }

          .mk-service-body h3 {
            font-size: 21px;
          }

          .mk-service-body p {
            min-height: 0;
          }

          .mk-service-bottom {
            margin-top: 13px;
            padding-top: 11px;
            align-items: flex-start;
            flex-direction: column;
          }

          .mk-price {
            font-size: 18px;
          }

          .mk-about-grid,
          .mk-contact-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .mk-about-photo {
            min-height: 320px;
          }

          .mk-gallery-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 190px 150px;
          }

          .mk-gallery-grid img:first-child {
            grid-row: span 2;
          }

          .mk-footer-inner {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media(max-width:420px) {
          .mk-service-card {
            grid-template-columns: 1fr;
          }

          .mk-service-image,
          .mk-service-placeholder {
            height: 190px;
            min-height: 190px;
          }

          .mk-service-bottom {
            flex-direction: row;
            align-items: center;
          }

          .mk-gallery-grid {
            grid-template-rows: 150px 120px;
          }
        }
      `}</style>

      <header className="mk-header">
        <div className="mk-container mk-header-inner">
          <Link to={`/${slug}`} className="mk-brand">
            {business.logoUrl ? (
              <img src={business.logoUrl} alt={business.name} />
            ) : (
              <span
                style={{
                  width: 34,
                  height: 34,
                  border: `1px solid ${secondary}`,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  color: secondary,
                  fontFamily: "'Playfair Display',serif",
                }}
              >
                {business.name.charAt(0)}
              </span>
            )}

            <span className="mk-brand-name">{business.name}</span>
          </Link>

          <nav className="mk-nav" aria-label="Navegação principal">
            <a href="#inicio">Início</a>
            <a href="#oferta">{copy.navOffer}</a>
            <a href="#sobre">Sobre</a>
            {gallery.length > 0 && <a href="#galeria">Galeria</a>}
            <a href="#contactos">Contactos</a>
          </nav>

          {(showBooking || showStore) && (
            <Link className="mk-header-cta" to={primaryAction}>
              {content.buttonText || copy.action}
            </Link>
          )}
        </div>
      </header>

      <section id="inicio" className="mk-hero">
        {heroImage && (
          <div
            className="mk-hero-image"
            style={{ backgroundImage: `url("${heroImage}")` }}
          />
        )}

        <div className="mk-hero-shade" />

        <div className="mk-container">
          <div className="mk-hero-content">
            <p className="mk-overline" style={{ color: secondary }}>
              {copy.eyebrow}
            </p>

            <h1 className="mk-serif">{title}</h1>

            <p className="mk-hero-copy">{subtitle}</p>

            <div className="mk-hero-actions">
              {(showBooking || showStore) && (
                <Link className="mk-button" to={primaryAction}>
                  {content.buttonText || copy.action}
                  <span style={{ marginLeft: 12 }}>↗</span>
                </Link>
              )}

              <a className="mk-text-link" href="#oferta">
                Descobrir mais ↓
              </a>
            </div>
          </div>
        </div>

        <div className="mk-scroll">Deslize para descobrir</div>
      </section>

      <section id="oferta" className="mk-section mk-services">
        <div className="mk-container">
          <div className="mk-section-heading">
            <div>
              <p className="mk-overline" style={{ color: secondary }}>
                {business.name}
              </p>

              <h2 className="mk-serif">
                {content.servicesTitle || copy.offer}
              </h2>
            </div>

            <p className="mk-section-note">{copy.intro}</p>
          </div>

          {items.length > 0 ? (
            <div className="mk-service-grid">
              {items.slice(0, 9).map((item, index) => {
                const image = serviceSector
                  ? serviceImages[index] || gallery[index]
                  : (item as Product).imageUrl || gallery[index];

                return (
                  <article className="mk-service-card" key={item.id}>
                    {image ? (
                      <img
                        className="mk-service-image"
                        src={image}
                        alt={item.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="mk-service-placeholder">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    )}

                    <div className="mk-service-body">
                      <span className="mk-service-index">
                        {String(index + 1).padStart(2, "0")} /{" "}
                        {serviceSector ? "SERVIÇO" : "DESTAQUE"}
                      </span>

                      <h3>{item.name}</h3>

                      {!serviceSector && (item as Product).description && (
                        <p>{(item as Product).description}</p>
                      )}

                      {serviceSector && (item as Service).durationMin ? (
                        <p>
                          Duração aproximada:{" "}
                          {(item as Service).durationMin} minutos
                        </p>
                      ) : null}

                      <div className="mk-service-bottom">
                        <strong className="mk-price">
                          {money(item.price)}
                        </strong>

                        <Link
                          className="mk-card-link"
                          to={
                            serviceSector && showBooking
                              ? `/${slug}/reservas`
                              : showStore
                                ? `/${slug}/loja`
                                : `/${slug}`
                          }
                        >
                          {serviceSector
                            ? "Agendar serviço ↗"
                            : "Ver produto ↗"}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mk-empty">
              Entre em contacto para conhecer a nossa oferta.
            </p>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 36,
            }}
          >
            {showStore && (
              <Link className="mk-button" to={`/${slug}/loja`}>
                Explorar loja ↗
              </Link>
            )}

            {showBooking && (
              <Link
                className="mk-button"
                to={`/${slug}/reservas`}
                style={{
                  background: "transparent",
                  color: "#fff",
                  borderColor: "rgba(255,255,255,.55)",
                }}
              >
                Marcar / Reservar ↗
              </Link>
            )}
          </div>
        </div>
      </section>

      <section id="sobre" className="mk-section">
        <div className="mk-container mk-about-grid">
          <div className="mk-about-photo">
            {(gallery[0] || heroImage) && (
              <img
                src={gallery[0] || heroImage}
                alt={business.name}
                loading="lazy"
              />
            )}
          </div>

          <div className="mk-about-copy">
            <p className="mk-overline" style={{ color: primary }}>
              {copy.about}
            </p>

            <h2 className="mk-serif">
              {content.aboutTitle || `Conheça ${business.name}`}
            </h2>

            <p>
              {content.description ||
                content.aboutText ||
                copy.intro}
            </p>

            <a className="mk-button" href="#contactos">
              Fale connosco ↗
            </a>
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section id="galeria" className="mk-section mk-gallery">
          <div className="mk-container">
            <div className="mk-section-heading">
              <div>
                <p className="mk-overline" style={{ color: primary }}>
                  Imagens do nosso espaço
                </p>

                <h2 className="mk-serif">
                  {content.galleryTitle ||
                    "Detalhes que fazem a diferença"}
                </h2>
              </div>

              <p className="mk-section-note">
                Conheça um pouco mais do ambiente, dos nossos trabalhos e da
                experiência que preparámos para si.
              </p>
            </div>

            <div className="mk-gallery-grid">
              {gallery.slice(0, 5).map((url, index) => (
                <img
                  key={`${url}-${index}`}
                  src={url}
                  alt={`${business.name} - imagem ${index + 1}`}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contactos" className="mk-section mk-contact">
        <div className="mk-container mk-contact-grid">
          <div>
            <p className="mk-overline" style={{ color: secondary }}>
              Estamos disponíveis para si
            </p>

            <h2 className="mk-serif">
              {content.contactTitle || "Vamos conversar?"}
            </h2>

            <p className="mk-contact-copy">
              Entre em contacto para esclarecer dúvidas, pedir informações,
              marcar um serviço ou conhecer melhor a nossa oferta.
            </p>
          </div>

          <div className="mk-contact-details">
            {business.phone && (
              <a
                className="mk-button"
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
              >
                Falar pelo WhatsApp ↗
              </a>
            )}

            {business.phone && (
              <a href={`tel:${business.phone}`}>{business.phone}</a>
            )}

            {business.address && <p>{business.address}</p>}

            {business.mapsUrl && (
              <a
                href={normalizeUrl(business.mapsUrl)}
                target="_blank"
                rel="noreferrer"
              >
                Ver localização ↗
              </a>
            )}

            {business.links?.map((link, index) => (
              <a
                key={`${link.url}-${index}`}
                href={normalizeUrl(link.url)}
                target="_blank"
                rel="noreferrer"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="mk-footer">
        <div className="mk-container mk-footer-inner">
          <span>{business.name}</span>
          <span>
            © {new Date().getFullYear()} · Todos os direitos reservados
          </span>
          <a href="#inicio">Voltar ao topo ↑</a>
        </div>
      </footer>
    </main>
  );
}