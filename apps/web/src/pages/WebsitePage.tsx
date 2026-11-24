
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { normalizeUrl } from "../lib/theme";

type SiteData = {
  name: string;
  type?: string | null;
  template?: string | null;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  address?: string | null;
  phone?: string | null;
  mapsUrl?: string | null;
  links?: { label: string; url: string }[];
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  storeHeroImage?: string | null;
};

type VisualIdentity = {
  primary?: string;
  secondary?: string;
  accent?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  background?: string;
  surface?: string;
  text?: string;
  muted?: string;
  border?: string;
};

type Content = {
  heroTitle?: string;
  heroSubtitle?: string;
  buttonText?: string;
  heroImage?: string;
  description?: string;
  aboutTitle?: string;
  aboutText?: string;
  gallery?: string[];
  visualIdentity?: VisualIdentity;
};

type Sector =
  | "restaurant"
  | "beauty"
  | "health"
  | "education"
  | "realestate"
  | "retail"
  | "services"
  | "general";

function detectSector(type?: string | null, template?: string | null): Sector {
  const value = `${type || ""} ${template || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/restaurante|restaurant|cafe|cafeteria|bar|food|comida|hotel/.test(value))
    return "restaurant";

  if (/beleza|beauty|salao|barbearia|estetica|spa|cabeleireiro/.test(value))
    return "beauty";

  if (/saude|health|clinica|medico|dentista|farmacia|hospital/.test(value))
    return "health";

  if (/educacao|education|escola|colegio|universidade|formacao|curso/.test(value))
    return "education";

  if (/imobiliaria|realestate|imoveis|construcao|arquitetura/.test(value))
    return "realestate";

  if (/loja|retail|comercio|shopping|supermercado|fashion|moda/.test(value))
    return "retail";

  if (/servicos|services|consultoria|agencia|tecnologia|oficina/.test(value))
    return "services";

  return "general";
}

const sectorContent: Record<
  Sector,
  { eyebrow: string; about: string; offer: string; action: string }
> = {
  restaurant: {
    eyebrow: "Uma experiência de sabor",
    about: "Sabor, qualidade e hospitalidade",
    offer: "Descubra o nosso menu",
    action: "Ver menu",
  },
  beauty: {
    eyebrow: "Beleza e bem-estar",
    about: "Cuide de si. Merece o melhor.",
    offer: "Conheça os nossos tratamentos",
    action: "Conhecer serviços",
  },
  health: {
    eyebrow: "Cuidado e confiança",
    about: "A sua saúde merece atenção",
    offer: "Conheça os nossos serviços",
    action: "Marcar atendimento",
  },
  education: {
    eyebrow: "Conhecimento para o futuro",
    about: "Aprender é crescer",
    offer: "Conheça a nossa oferta formativa",
    action: "Explorar cursos",
  },
  realestate: {
    eyebrow: "O lugar certo para si",
    about: "Encontre o espaço ideal",
    offer: "Descubra as nossas oportunidades",
    action: "Ver oportunidades",
  },
  retail: {
    eyebrow: "Qualidade em cada escolha",
    about: "Produtos seleccionados para si",
    offer: "Explore os nossos produtos",
    action: "Explorar loja",
  },
  services: {
    eyebrow: "Soluções para si",
    about: "Profissionalismo em cada projecto",
    offer: "Descubra o que podemos fazer",
    action: "Conhecer soluções",
  },
  general: {
    eyebrow: "Bem-vindo",
    about: "Conheça o nosso negócio",
    offer: "Descubra o que temos para oferecer",
    action: "Explorar",
  },
};

export default function WebsitePage() {
  const { slug } = useParams();

  const [business, setBusiness] = useState<SiteData | null>(null);
  const [content, setContent] = useState<Content>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    let active = true;

    async function loadWebsite() {
      try {
        const [info, site] = await Promise.all([
          apiFetch<SiteData>("/api/v1/business/info", {
            skipAuth: true,
            tenant: slug,
          }),
          apiFetch<{
            isPublished: boolean;
            content: Content | null;
          }>("/api/v1/site-content", {
            skipAuth: true,
            tenant: slug,
          }),
        ]);

        if (!active) return;

        setBusiness(info);
        setContent(
          site?.isPublished && site.content ? site.content : {}
        );
      } catch (error) {
        console.error("Erro ao carregar website:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadWebsite();

    return () => {
      active = false;
    };
  }, [slug]);

  const sector = useMemo(
    () => detectSector(business?.type, business?.template),
    [business?.type, business?.template]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        A carregar website...
      </div>
    );
  }

  if (!business || !slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Não foi possível encontrar este negócio.
      </div>
    );
  }

  const visual = content.visualIdentity || {};
  const profile = sectorContent[sector];

  const primary =
    visual.primaryColor ||
    visual.primary ||
    business.primaryColor ||
    "#173B67";

  const secondary =
    visual.secondaryColor ||
    visual.secondary ||
    business.secondaryColor ||
    "#F2A900";

  const background = visual.background || "#F7F8FA";
  const surface = visual.surface || "#FFFFFF";
  const textColor = visual.text || "#18181B";
  const muted = visual.muted || "#71717A";
  const border = visual.border || "#E4E4E7";

  const title =
    content.heroTitle || business.heroTitle || business.name;

  const subtitle =
    content.heroSubtitle ||
    business.heroSubtitle ||
    "Descubra os nossos produtos e serviços.";

  const heroImage =
    content.heroImage || business.storeHeroImage || "";

  const description =
    content.description ||
    content.aboutText ||
    `Conheça a ${business.name} e descubra tudo o que temos para oferecer.`;

  const gallery = Array.isArray(content.gallery)
    ? content.gallery.filter(Boolean)
    : [];

  const isRestaurant = sector === "restaurant";
  const isBeauty = sector === "beauty";
  const isHealth = sector === "health";
  const isEducation = sector === "education";
  const isRealEstate = sector === "realestate";
  const isRetail = sector === "retail";

  const heroHeight =
    isRestaurant || isRealEstate ? "min-h-[680px]" : "min-h-[570px]";

  const heroOverlay =
    isBeauty
      ? "linear-gradient(90deg, rgba(30,15,25,.78), rgba(30,15,25,.12))"
      : isHealth
      ? "linear-gradient(90deg, rgba(5,25,45,.82), rgba(5,25,45,.18))"
      : isEducation
      ? "linear-gradient(90deg, rgba(10,25,55,.84), rgba(10,25,55,.15))"
      : "linear-gradient(90deg, rgba(0,0,0,.76), rgba(0,0,0,.16))";

  const mainAction = isRestaurant
    ? "Ver menu"
    : profile.action;

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: background, color: textColor }}
    >
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{
          backgroundColor: `${surface}F2`,
          borderColor: border,
        }}
      >
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <Link to={`/${slug}`} className="flex items-center gap-3 min-w-0">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: primary }}
              >
                {business.name.charAt(0)}
              </div>
            )}

            <span className="font-bold text-lg truncate">
              {business.name}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold">
            <a href="#inicio">Início</a>
            <a href="#sobre">Sobre</a>
            <a href="#oferta">Serviços</a>
            {gallery.length > 0 && <a href="#galeria">Galeria</a>}
            <a href="#contactos">Contactos</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to={`/${slug}/loja`}
              className="hidden sm:inline-flex px-4 py-2 rounded-xl border font-semibold text-sm"
              style={{ borderColor: border }}
            >
              Loja
            </Link>

            <Link
              to={`/${slug}/reservas`}
              className="px-4 py-2 rounded-xl text-white font-semibold text-sm"
              style={{ backgroundColor: primary }}
            >
              Reservar
            </Link>
          </div>
        </div>
      </header>

      <section
        id="inicio"
        className={`relative ${heroHeight} flex items-center overflow-hidden`}
        style={{
          backgroundColor: primary,
          backgroundImage: heroImage
            ? `${heroOverlay}, url("${heroImage}")`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto w-full px-6 py-24">
          <div
            className={`max-w-3xl text-white ${
              isBeauty ? "text-center mx-auto" : ""
            }`}
          >
            <span
              className="inline-flex rounded-full px-4 py-2 text-sm font-bold mb-7"
              style={{
                backgroundColor: secondary,
                color: "#18181B",
              }}
            >
              {profile.eyebrow}
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight">
              {title}
            </h1>

            <p className="text-lg md:text-xl mt-6 text-white/85 leading-relaxed max-w-2xl">
              {subtitle}
            </p>

            <div
              className={`flex flex-wrap gap-3 mt-9 ${
                isBeauty ? "justify-center" : ""
              }`}
            >
              <Link
                to={`/${slug}/loja`}
                className="px-7 py-4 rounded-xl font-bold shadow-lg"
                style={{
                  backgroundColor: secondary,
                  color: "#18181B",
                }}
              >
                {content.buttonText || mainAction}
              </Link>

              <Link
                to={`/${slug}/reservas`}
                className="px-7 py-4 rounded-xl font-bold border border-white/60 text-white"
              >
                {isHealth ? "Marcar consulta" : "Fazer reserva"}
              </Link>
            </div>
          </div>
        </div>

        {isRestaurant && (
          <div className="absolute bottom-0 left-0 right-0 h-2"
            style={{ backgroundColor: secondary }}
          />
        )}
      </section>

      <section
        id="sobre"
        className="py-20 md:py-28 px-6"
        style={{ backgroundColor: background }}
      >
        <div
          className={`max-w-6xl mx-auto ${
            isBeauty || isEducation ? "text-center" : "grid md:grid-cols-2 gap-12 items-center"
          }`}
        >
          <div>
            <span
              className="font-bold uppercase tracking-widest text-sm"
              style={{ color: primary }}
            >
              {profile.about}
            </span>

            <h2 className="text-3xl md:text-5xl font-black mt-5 leading-tight">
              {content.aboutTitle || `Sobre ${business.name}`}
            </h2>

            <p
              className="text-lg leading-relaxed mt-7 whitespace-pre-line"
              style={{ color: muted }}
            >
              {description}
            </p>
          </div>

          {!isBeauty && !isEducation && (
            <div
              className="rounded-3xl min-h-[260px] p-10 flex items-center justify-center text-center"
              style={{
                backgroundColor: surface,
                border: `1px solid ${border}`,
              }}
            >
              <div>
                <div
                  className="text-5xl mb-5"
                  style={{ color: primary }}
                >
                  {isRestaurant ? "✦" : isHealth ? "✚" : isRealEstate ? "⌂" : "◆"}
                </div>
                <h3 className="text-2xl font-bold">{business.name}</h3>
                <p className="mt-3" style={{ color: muted }}>
                  {profile.eyebrow}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section
        id="oferta"
        className="py-20 px-6"
        style={{
          backgroundColor: surface,
          borderTop: `1px solid ${border}`,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span
              className="font-bold uppercase tracking-widest text-sm"
              style={{ color: primary }}
            >
              {profile.eyebrow}
            </span>

            <h2 className="text-3xl md:text-4xl font-black mt-4">
              {profile.offer}
            </h2>

            <p className="mt-4 leading-relaxed" style={{ color: muted }}>
              Consulte as nossas opções e entre em contacto connosco.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: isRestaurant ? "♨" : isBeauty ? "✧" : isHealth ? "✚" : isEducation ? "▤" : isRealEstate ? "⌂" : isRetail ? "◇" : "✦",
                title: isRestaurant ? "Menu" : isBeauty ? "Tratamentos" : isHealth ? "Atendimento" : isEducation ? "Formação" : isRealEstate ? "Imóveis" : isRetail ? "Produtos" : "Soluções",
                description: isRestaurant ? "Descubra as nossas opções e especialidades." : "Conheça as opções disponíveis para si.",
              },
              {
                icon: "◈",
                title: "Qualidade",
                description: "Trabalhamos com atenção ao detalhe e compromisso.",
              },
              {
                icon: "◎",
                title: "Acompanhamento",
                description: "Estamos disponíveis para ajudar e esclarecer dúvidas.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-3xl p-8 transition-transform hover:-translate-y-1"
                style={{
                  backgroundColor: background,
                  border: `1px solid ${border}`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6"
                  style={{
                    backgroundColor: `${primary}15`,
                    color: primary,
                  }}
                >
                  {item.icon}
                </div>

                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-3 leading-relaxed" style={{ color: muted }}>
                  {item.description}
                </p>
              </article>
            ))}
          </div>

          <div className="text-center mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to={`/${slug}/loja`}
              className="px-7 py-4 rounded-xl font-bold text-white"
              style={{ backgroundColor: primary }}
            >
              {mainAction}
            </Link>

            <Link
              to={`/${slug}/reservas`}
              className="px-7 py-4 rounded-xl font-bold border"
              style={{ borderColor: primary, color: primary }}
            >
              Contactar / Reservar
            </Link>
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section
          id="galeria"
          className="py-20 px-6"
          style={{ backgroundColor: background }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <span
                className="font-bold uppercase tracking-widest text-sm"
                style={{ color: primary }}
              >
                {business.name}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-3">
                Galeria
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gallery.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${business.name} ${index + 1}`}
                  className="w-full h-72 object-cover rounded-2xl"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        id="contactos"
        className="py-20 px-6 text-white"
        style={{ backgroundColor: primary }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <span className="uppercase tracking-widest text-sm font-bold text-white/70">
            Estamos disponíveis
          </span>

          <h2 className="text-3xl md:text-5xl font-black mt-4">
            Entre em contacto connosco
          </h2>

          <p className="text-white/80 mt-4">
            Estamos disponíveis para ajudar.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {business.phone && (
              <a
                href={`https://wa.me/${business.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl font-bold"
                style={{
                  backgroundColor: secondary,
                  color: "#18181B",
                }}
              >
                WhatsApp
              </a>
            )}

            {business.mapsUrl && (
              <a
                href={normalizeUrl(business.mapsUrl)}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl border border-white/50 font-bold"
              >
                Como chegar
              </a>
            )}
          </div>

          {business.address && (
            <p className="mt-7 text-white/80">{business.address}</p>
          )}

          {business.links && business.links.length > 0 && (
            <div className="flex flex-wrap justify-center gap-5 mt-7">
              {business.links.map((item, index) => (
                <a
                  key={`${item.url}-${index}`}
                  href={normalizeUrl(item.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="bg-zinc-950 text-white/60 text-center py-7 px-5 text-sm">
        © {new Date().getFullYear()} {business.name}. Todos os direitos reservados.
      </footer>
    </main>
  );
}
