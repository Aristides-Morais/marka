import { useEffect, useMemo, useState, useRef, type CSSProperties } from "react";
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
};

type Service = {
  id: string;
  name: string;
  durationMin?: number;
  price: number;
  imageUrl?: string | null;
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

function detectSector(
  type?: string | null,
  template?: string | null
): Sector {
  const value = `${type || ""} ${template || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (
    /beleza|beauty|salao|barbearia|estetica|spa|cabeleireiro|unhas/.test(
      value
    )
  )
    return "beauty";
  if (
    /restaurante|restaurant|cafe|cafeteria|bar|food|comida|hotel/.test(
      value
    )
  )
    return "food";
  if (
    /saude|health|clinica|medico|dentista|farmacia|hospital/.test(value)
  )
    return "health";
  if (
    /educacao|education|escola|colegio|universidade|formacao|curso/.test(
      value
    )
  )
    return "education";
  if (
    /imobiliaria|realestate|imoveis|construcao|arquitetura/.test(value)
  )
    return "realestate";
  if (
    /loja|retail|comercio|shopping|supermercado|fashion|moda/.test(value)
  )
    return "retail";
  if (
    /servicos|services|consultoria|agencia|tecnologia|oficina/.test(
      value
    )
  )
    return "services";
  return "general";
}

const sectorConfig: Record<
  Sector,
  {
    eyebrow: string;
    offer: string;
    about: string;
    action: string;
    galleryLabel: string;
    contactLabel: string;
    fonts: { serif: string; sans: string };
    defaults: {
      primary: string;
      secondary: string;
      bg: string;
      surface: string;
      ink: string;
      muted: string;
      border: string;
    };
    fallbackHero: string;
    fallbackGallery: string[];
  }
> = {
  beauty: {
    eyebrow: "BELEZA · CUIDADO · BEM-ESTAR",
    offer: "Tratamentos e serviços",
    about: "Um momento só seu",
    action: "Marcar horário",
    galleryLabel: "O nosso trabalho",
    contactLabel: "Reserve o seu momento",
    fonts: { serif: "Cormorant Garamond", sans: "Jost" },
    defaults: {
      primary: "#5C2A3A",
      secondary: "#C9A88A",
      bg: "#FAF7F5",
      surface: "#FFFFFF",
      ink: "#2A1F22",
      muted: "#7A6A6E",
      border: "#EDE4DF",
    },
    fallbackHero:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80",
    fallbackGallery: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595476108010-b4d1f595b318?auto=format&fit=crop&w=800&q=80",
    ],
  },
  food: {
    eyebrow: "SABOR · QUALIDADE · EXPERIÊNCIA",
    offer: "O nosso menu",
    about: "Feito com dedicação",
    action: "Ver menu",
    galleryLabel: "Ambiente e pratos",
    contactLabel: "Reserve a sua mesa",
    fonts: { serif: "Fraunces", sans: "DM Sans" },
    defaults: {
      primary: "#6B1020",
      secondary: "#9A7634",
      bg: "#F1E6D2",
      surface: "#FBF6EC",
      ink: "#221A18",
      muted: "#6B5C55",
      border: "#D3C3A4",
    },
    fallbackHero:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
    fallbackGallery: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
    ],
  },
  retail: {
    eyebrow: "SELECÇÃO · QUALIDADE · ESTILO",
    offer: "Destaques da loja",
    about: "Escolhas pensadas para si",
    action: "Ver loja",
    galleryLabel: "Colecção",
    contactLabel: "Visite-nos ou encomende",
    fonts: { serif: "Playfair Display", sans: "Inter" },
    defaults: {
      primary: "#1A1A1A",
      secondary: "#C9A227",
      bg: "#F7F5F2",
      surface: "#FFFFFF",
      ink: "#1A1A1A",
      muted: "#6B6560",
      border: "#E5E0D8",
    },
    fallbackHero:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    fallbackGallery: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558171813-4c0880cf059b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    ],
  },
  health: {
    eyebrow: "CUIDADO · CONFIANÇA · SAÚDE",
    offer: "Especialidades e cuidados",
    about: "A sua saúde em boas mãos",
    action: "Marcar atendimento",
    galleryLabel: "Instalações",
    contactLabel: "Agende a sua consulta",
    fonts: { serif: "Libre Baskerville", sans: "Source Sans 3" },
    defaults: {
      primary: "#0F4C5C",
      secondary: "#5B8A9A",
      bg: "#F4F8F9",
      surface: "#FFFFFF",
      ink: "#1A2E35",
      muted: "#5A727A",
      border: "#D6E4E8",
    },
    fallbackHero:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80",
    fallbackGallery: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581595220892-b2459bb5a4e9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    ],
  },
  education: {
    eyebrow: "APRENDER · EVOLUIR · CONQUISTAR",
    offer: "Cursos e formação",
    about: "Conhecimento para o futuro",
    action: "Saber mais",
    galleryLabel: "Campus e actividades",
    contactLabel: "Fale connosco",
    fonts: { serif: "Merriweather", sans: "Nunito" },
    defaults: {
      primary: "#1E3A5F",
      secondary: "#E8A838",
      bg: "#F7F5F0",
      surface: "#FFFFFF",
      ink: "#1A2332",
      muted: "#5C6B7A",
      border: "#E0DBD0",
    },
    fallbackHero:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80",
    fallbackGallery: [
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80",
    ],
  },
  realestate: {
    eyebrow: "ESPAÇOS · OPORTUNIDADES · VALOR",
    offer: "Imóveis em destaque",
    about: "Encontre o lugar certo",
    action: "Explorar",
    galleryLabel: "Propriedades",
    contactLabel: "Fale com um consultor",
    fonts: { serif: "Cormorant Garamond", sans: "Montserrat" },
    defaults: {
      primary: "#1C2B3A",
      secondary: "#B8956C",
      bg: "#F5F3EF",
      surface: "#FFFFFF",
      ink: "#1C2B3A",
      muted: "#6A7568",
      border: "#E2DDD4",
    },
    fallbackHero:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
    fallbackGallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f04d8b5a5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=800&q=80",
    ],
  },
  services: {
    eyebrow: "EXPERIÊNCIA · SOLUÇÕES · RESULTADOS",
    offer: "O que fazemos",
    about: "Compromisso em cada projecto",
    action: "Falar connosco",
    galleryLabel: "Portefólio",
    contactLabel: "Vamos conversar",
    fonts: { serif: "Playfair Display", sans: "Inter" },
    defaults: {
      primary: "#111827",
      secondary: "#6366F1",
      bg: "#F8FAFC",
      surface: "#FFFFFF",
      ink: "#0F172A",
      muted: "#64748B",
      border: "#E2E8F0",
    },
    fallbackHero:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    fallbackGallery: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    ],
  },
  general: {
    eyebrow: "BEM-VINDO",
    offer: "Conheça a nossa oferta",
    about: "Feito a pensar em si",
    action: "Conhecer",
    galleryLabel: "Galeria",
    contactLabel: "Contacte-nos",
    fonts: { serif: "Playfair Display", sans: "DM Sans" },
    defaults: {
      primary: "#512638",
      secondary: "#B99A75",
      bg: "#F8F4EF",
      surface: "#FFFFFF",
      ink: "#35232B",
      muted: "#817078",
      border: "#E7DDD5",
    },
    fallbackHero:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80",
    fallbackGallery: [
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80",
    ],
  },
};

const money = (value: number) =>
  `${Number(value || 0).toLocaleString("pt-AO")} Kz`;

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("mk-visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    el.querySelectorAll(".mk-reveal").forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  });
  return ref;
}

export default function WebsitePage() {
  const { slug = "" } = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [content, setContent] = useState<SiteContent>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const revealRef = useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      } catch (e) {
        console.error("Erro ao carregar website:", e);
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
    return (
      <div className="min-h-screen grid place-items-center bg-[#f8f5f0] text-[#51443d]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#512638] border-t-transparent" />
          <p className="text-sm tracking-wide">A carregar website...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen grid place-items-center text-[#35232B]">
        Não foi possível encontrar este negócio.
      </div>
    );
  }

  const cfg = sectorConfig[sector];
  const v = content.visualIdentity || {};

  const primary =
    v.primaryColor || v.primary || business.primaryColor || cfg.defaults.primary;
  const secondary =
    v.secondaryColor ||
    v.secondary ||
    business.secondaryColor ||
    cfg.defaults.secondary;
  const bg = v.background || cfg.defaults.bg;
  const surface = v.surface || cfg.defaults.surface;
  const ink = v.text || cfg.defaults.ink;
  const muted = v.muted || cfg.defaults.muted;
  const border = v.border || cfg.defaults.border;

  const title =
    content.heroTitle || business.heroTitle || business.name;
  const subtitle =
    content.heroSubtitle ||
    business.heroSubtitle ||
    "Descubra a nossa experiência, os nossos serviços e tudo o que preparámos para si.";

  const heroImage =
    content.heroImage ||
    business.storeHeroImage ||
    cfg.fallbackHero;

  const rawGallery = Array.isArray(content.gallery)
    ? content.gallery.filter(Boolean)
    : [];
  const gallery =
    rawGallery.length > 0 ? rawGallery : cfg.fallbackGallery;

  const showStore =
    !business.modules ||
    business.modules.some((x) => x.toLowerCase() === "store");
  const showBooking =
    !business.modules ||
    business.modules.some((x) => x.toLowerCase() === "booking");

  const isServiceList =
    sector === "beauty" || sector === "health" || sector === "services";
  const cards = isServiceList ? services : products;

  const actionHref =
    showBooking && isServiceList
      ? `/${slug}/reservas`
      : `/${slug}/loja`;

  const phoneClean = (business.phone || "").replace(/\D/g, "");
  const waLink = phoneClean ? `https://wa.me/${phoneClean}` : null;

  const serifFamily = cfg.fonts.serif;
  const sansFamily = cfg.fonts.sans;

  return (
    <main
      ref={revealRef}
      style={
        {
          background: bg,
          color: ink,
          fontFamily: `'${sansFamily}', system-ui, sans-serif`,
          "--mk-primary": primary,
          "--mk-secondary": secondary,
          "--mk-bg": bg,
          "--mk-surface": surface,
          "--mk-ink": ink,
          "--mk-muted": muted,
          "--mk-border": border,
        } as CSSProperties
      }
      className="min-h-screen overflow-x-hidden"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=Jost:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Source+Sans+3:wght@400;500;600;700&display=swap');

        .mk-serif {
          font-family: '${serifFamily}', Georgia, serif;
        }

        .mk-wrap {
          width: min(1180px, calc(100% - 2.5rem));
          margin-inline: auto;
        }

        .mk-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 15px 28px;
          border-radius: 2px;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 600;
          transition: transform 0.25s ease, filter 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          cursor: pointer;
          border: none;
          text-decoration: none;
        }
        .mk-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }
        .mk-btn:active {
          transform: translateY(0);
        }

        .mk-kicker {
          font-size: 10px;
          letter-spacing: 0.26em;
          font-weight: 600;
          text-transform: uppercase;
        }

        .mk-section {
          padding: 110px 0;
        }
        @media (max-width: 768px) {
          .mk-section { padding: 72px 0; }
        }

        .mk-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mk-reveal.mk-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .mk-reveal-d1 { transition-delay: 0.08s; }
        .mk-reveal-d2 { transition-delay: 0.16s; }
        .mk-reveal-d3 { transition-delay: 0.24s; }
        .mk-reveal-d4 { transition-delay: 0.32s; }

        .mk-card {
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.4s ease;
        }
        .mk-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px -12px rgba(0,0,0,0.12);
        }
        .mk-card img {
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mk-card:hover img {
          transform: scale(1.05);
        }

        .mk-gal-item {
          overflow: hidden;
          position: relative;
        }
        .mk-gal-item img {
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mk-gal-item:hover img {
          transform: scale(1.06);
        }

        .mk-header {
          transition: background 0.35s ease, box-shadow 0.35s ease, padding 0.35s ease;
        }
        .mk-header.scrolled {
          background: rgba(255,255,255,0.92) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 1px 0 var(--mk-border);
        }
        .mk-header.scrolled .mk-nav-link,
        .mk-header.scrolled .mk-logo-text {
          color: var(--mk-ink) !important;
        }

        .mk-nav-link {
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
          text-decoration: none;
          transition: opacity 0.2s;
          opacity: 0.85;
        }
        .mk-nav-link:hover { opacity: 1; }

        @keyframes mk-hero-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mk-hero-anim {
          animation: mk-hero-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .mk-hero-anim-d1 { animation-delay: 0.15s; }
        .mk-hero-anim-d2 { animation-delay: 0.3s; }
        .mk-hero-anim-d3 { animation-delay: 0.45s; }
        .mk-hero-anim-d4 { animation-delay: 0.6s; }

        .mk-mobile-menu {
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        html { scroll-behavior: smooth; scroll-padding-top: 80px; }
      `}</style>

      {/* HEADER */}
      <header
        className={`mk-header fixed inset-x-0 top-0 z-50 ${
          scrolled ? "scrolled py-3" : "py-5"
        }`}
        style={{
          background: scrolled ? undefined : "transparent",
        }}
      >
        <div className="mk-wrap flex items-center justify-between gap-4">
          <a
            href="#inicio"
            className="flex items-center gap-3 no-underline"
            onClick={() => setMenuOpen(false)}
          >
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                className="h-10 w-auto object-contain md:h-12"
              />
            ) : (
              <span
                className={`mk-logo-text mk-serif text-xl font-semibold tracking-tight md:text-2xl ${
                  scrolled ? "" : "text-white"
                }`}
              >
                {business.name}
              </span>
            )}
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#sobre"
              className={`mk-nav-link ${scrolled ? "" : "text-white"}`}
            >
              Sobre
            </a>
            <a
              href="#oferta"
              className={`mk-nav-link ${scrolled ? "" : "text-white"}`}
            >
              {isServiceList ? "Serviços" : "Destaques"}
            </a>
            {gallery.length > 0 && (
              <a
                href="#galeria"
                className={`mk-nav-link ${scrolled ? "" : "text-white"}`}
              >
                Galeria
              </a>
            )}
            <a
              href="#contactos"
              className={`mk-nav-link ${scrolled ? "" : "text-white"}`}
            >
              Contactos
            </a>
            {showStore && (
              <Link
                to={`/${slug}/loja`}
                className={`mk-nav-link ${scrolled ? "" : "text-white"}`}
              >
                Loja
              </Link>
            )}
            {showBooking && (
              <Link
                to={`/${slug}/reservas`}
                className="mk-btn text-white"
                style={{
                  background: primary,
                  padding: "12px 22px",
                  fontSize: "10px",
                }}
              >
                {cfg.action}
              </Link>
            )}
          </nav>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            <span
              className={`block h-0.5 w-6 transition ${
                scrolled ? "bg-current" : "bg-white"
              }`}
              style={{
                boxShadow: menuOpen
                  ? "none"
                  : `0 6px 0 ${scrolled ? "currentColor" : "white"}, 0 -6px 0 ${
                      scrolled ? "currentColor" : "white"
                    }`,
                transform: menuOpen ? "rotate(45deg)" : undefined,
              }}
            />
          </button>
        </div>

        {menuOpen && (
          <div
            className="mk-mobile-menu fixed inset-0 z-40 flex flex-col bg-white pt-24 md:hidden"
            style={{ color: ink }}
          >
            <nav className="flex flex-col items-center gap-6 text-lg">
              <a
                href="#sobre"
                className="no-underline"
                onClick={() => setMenuOpen(false)}
              >
                Sobre
              </a>
              <a
                href="#oferta"
                className="no-underline"
                onClick={() => setMenuOpen(false)}
              >
                {isServiceList ? "Serviços" : "Destaques"}
              </a>
              {gallery.length > 0 && (
                <a
                  href="#galeria"
                  className="no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  Galeria
                </a>
              )}
              <a
                href="#contactos"
                className="no-underline"
                onClick={() => setMenuOpen(false)}
              >
                Contactos
              </a>
              {showStore && (
                <Link
                  to={`/${slug}/loja`}
                  className="no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  Loja
                </Link>
              )}
              {showBooking && (
                <Link
                  to={`/${slug}/reservas`}
                  className="mk-btn mt-4 text-white"
                  style={{ background: primary }}
                  onClick={() => setMenuOpen(false)}
                >
                  {cfg.action}
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section
        id="inicio"
        className="relative flex min-h-[100svh] items-end overflow-hidden md:items-center"
      >
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{
            backgroundImage: `url("${heroImage}")`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(20,12,16,0.88) 0%, rgba(20,12,16,0.55) 45%, rgba(20,12,16,0.25) 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: `linear-gradient(to top, ${bg}, transparent)`,
          }}
        />

        <div className="mk-wrap relative z-10 pb-20 pt-32 md:pb-28 md:pt-24">
          <div className="max-w-[720px]">
            <p className="mk-kicker mk-hero-anim text-white/70">
              {cfg.eyebrow}
            </p>
            <h1 className="mk-serif mk-hero-anim mk-hero-anim-d1 mt-5 text-[2.75rem] leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mk-hero-anim mk-hero-anim-d2 mt-6 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
              {subtitle}
            </p>
            <div className="mk-hero-anim mk-hero-anim-d3 mt-10 flex flex-wrap gap-3">
              <Link
                to={actionHref}
                className="mk-btn"
                style={{ background: secondary, color: "#1a1412" }}
              >
                {content.buttonText || cfg.action}
              </Link>
              <a
                href="#sobre"
                className="mk-btn border border-white/50 text-white"
                style={{ background: "transparent" }}
              >
                Conhecer
              </a>
            </div>
            {business.address && (
              <p className="mk-hero-anim mk-hero-anim-d4 mt-10 text-sm text-white/55">
                {business.address}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="sobre" className="mk-section">
        <div className="mk-wrap grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="mk-reveal relative aspect-[4/5] overflow-hidden sm:aspect-[5/6]">
            <img
              src={gallery[0] || heroImage}
              alt={`${business.name} — apresentação`}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-1/3"
              style={{
                background: `linear-gradient(to top, ${primary}99, transparent)`,
              }}
            />
          </div>

          <div className="mk-reveal mk-reveal-d1 py-2">
            <p className="mk-kicker" style={{ color: primary }}>
              {cfg.about}
            </p>
            <h2 className="mk-serif mt-4 text-4xl leading-[1.12] md:text-5xl">
              {content.aboutTitle || `Bem-vindo à ${business.name}`}
            </h2>
            <p
              className="mt-6 whitespace-pre-line text-[15px] leading-8"
              style={{ color: muted }}
            >
              {content.description ||
                content.aboutText ||
                `Na ${business.name}, cada detalhe é pensado para proporcionar uma experiência de qualidade. Conheça os nossos serviços e entre em contacto connosco.`}
            </p>
            <a
              href="#contactos"
              className="mt-8 inline-flex items-center gap-2 border-b pb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] no-underline transition hover:opacity-70"
              style={{ borderColor: secondary, color: primary }}
            >
              Fale connosco
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* OFFER */}
      <section
        id="oferta"
        className="mk-section"
        style={{
          background: surface,
          borderTop: `1px solid ${border}`,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div className="mk-wrap">
          <div className="mk-reveal mx-auto mb-14 max-w-2xl text-center">
            <p className="mk-kicker" style={{ color: primary }}>
              {business.name}
            </p>
            <h2 className="mk-serif mt-4 text-4xl md:text-5xl">
              {content.servicesTitle || cfg.offer}
            </h2>
            <p className="mt-4 text-sm leading-7" style={{ color: muted }}>
              {isServiceList
                ? "Conheça os nossos serviços e marque o seu horário."
                : "Explore os destaques e descubra o que temos para si."}
            </p>
          </div>

          {cards.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cards.slice(0, 6).map((item: any, idx: number) => (
                <article
                  key={item.id}
                  className="mk-card mk-reveal overflow-hidden"
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    transitionDelay: `${0.06 * (idx % 3)}s`,
                  }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{ background: `${primary}10` }}
                      >
                        <span
                          className="mk-serif text-3xl opacity-30"
                          style={{ color: primary }}
                        >
                          {item.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="mk-serif text-xl leading-snug md:text-2xl">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p
                        className="mt-2 line-clamp-2 text-sm leading-6"
                        style={{ color: muted }}
                      >
                        {item.description}
                      </p>
                    )}
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <strong className="text-sm" style={{ color: primary }}>
                        {money(item.price)}
                      </strong>
                      {isServiceList && item.durationMin ? (
                        <span className="text-xs" style={{ color: muted }}>
                          {item.durationMin} min
                        </span>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div
              className="mk-reveal py-12 text-center text-sm"
              style={{ color: muted }}
            >
              Consulte as nossas opções através dos contactos disponíveis.
            </div>
          )}

          <div className="mk-reveal mt-12 flex flex-wrap justify-center gap-3">
            {showStore && (
              <Link
                to={`/${slug}/loja`}
                className="mk-btn text-white"
                style={{ background: primary }}
              >
                Explorar loja
              </Link>
            )}
            {showBooking && (
              <Link
                to={`/${slug}/reservas`}
                className="mk-btn"
                style={{
                  border: `1px solid ${primary}`,
                  color: primary,
                  background: "transparent",
                }}
              >
                {cfg.action}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      {gallery.length > 0 && (
        <section id="galeria" className="mk-section">
          <div className="mk-wrap">
            <div className="mk-reveal mb-12 text-center">
              <p className="mk-kicker" style={{ color: primary }}>
                {cfg.galleryLabel}
              </p>
              <h2 className="mk-serif mt-3 text-4xl md:text-5xl">
                {content.galleryTitle || "Galeria"}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {gallery.slice(0, 6).map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className={`mk-gal-item mk-reveal overflow-hidden ${
                    i === 0 || i === 3
                      ? "col-span-2 aspect-[16/9] md:col-span-1 md:aspect-[4/5]"
                      : "aspect-[4/5]"
                  }`}
                  style={{ transitionDelay: `${0.05 * i}s` }}
                >
                  <img
                    src={url}
                    alt={`${business.name} ${i + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section
        id="contactos"
        className="mk-section relative overflow-hidden text-white"
        style={{ background: primary }}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-10"
          style={{ background: secondary }}
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full opacity-10"
          style={{ background: secondary }}
        />

        <div className="mk-wrap relative grid gap-12 md:grid-cols-2 md:items-center">
          <div className="mk-reveal">
            <p className="mk-kicker text-white/60">{cfg.contactLabel}</p>
            <h2 className="mk-serif mt-4 text-4xl leading-tight md:text-5xl">
              {content.contactTitle || "Vamos conversar?"}
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-white/70">
              Entre em contacto para esclarecer dúvidas, conhecer os nossos
              serviços ou marcar a sua visita.
            </p>
          </div>

          <div className="mk-reveal mk-reveal-d1 flex flex-col items-start gap-5 md:items-end">
            {waLink && (
              <a
                className="mk-btn"
                style={{ background: secondary, color: "#1a1412" }}
                href={waLink}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
                <span aria-hidden>↗</span>
              </a>
            )}
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="text-sm text-white/90 no-underline hover:underline"
              >
                {business.phone}
              </a>
            )}
            {business.address && (
              <p className="max-w-xs text-right text-sm leading-6 text-white/75 md:text-right">
                {business.address}
              </p>
            )}
            {business.mapsUrl && (
              <a
                className="text-sm text-white underline underline-offset-4"
                href={normalizeUrl(business.mapsUrl)}
                target="_blank"
                rel="noreferrer"
              >
                Ver no mapa
              </a>
            )}
            {business.links?.map((link, i) => (
              <a
                key={`${link.url}-${i}`}
                className="text-sm text-white/80 underline underline-offset-4"
                href={normalizeUrl(link.url)}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="px-5 py-10"
        style={{ background: "#141010", color: "#a89f98" }}
      >
        <div className="mk-wrap flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt=""
                className="h-8 w-auto opacity-80"
              />
            ) : (
              <span className="mk-serif text-lg text-white/80">
                {business.name}
              </span>
            )}
          </div>
          <p className="text-center text-xs leading-5">
            © {new Date().getFullYear()} {business.name}. Todos os direitos
            reservados.
          </p>
          <div className="flex gap-4 text-xs">
            <a href="#inicio" className="no-underline opacity-70 hover:opacity-100">
              Início
            </a>
            <a
              href="#contactos"
              className="no-underline opacity-70 hover:opacity-100"
            >
              Contactos
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}