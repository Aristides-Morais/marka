import { useEffect, useMemo, useState } from "react";
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
  accentColor?: string | null;
  phone?: string | null;
  address?: string | null;
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
  stock?: number;
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
  visualIdentity?: {
    primary?: string;
    secondary?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    background?: string;
    surface?: string;
    text?: string;
    muted?: string;
    border?: string;
  };
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

const sectorText: Record<
  Sector,
  {
    eyebrow: string;
    about: string;
    offer: string;
    action: string;
    offerDescription: string;
  }
> = {
  restaurant: {
    eyebrow: "Uma experiência de sabor",
    about: "Sabor, qualidade e hospitalidade",
    offer: "O nosso menu",
    action: "Ver menu",
    offerDescription: "Descubra as nossas especialidades e opções.",
  },
  beauty: {
    eyebrow: "Beleza e bem-estar",
    about: "Cuide de si. Merece o melhor.",
    offer: "Os nossos serviços",
    action: "Conhecer serviços",
    offerDescription: "Conheça os cuidados e tratamentos disponíveis.",
  },
  health: {
    eyebrow: "Cuidado e confiança",
    about: "A sua saúde merece atenção",
    offer: "Os nossos serviços",
    action: "Marcar atendimento",
    offerDescription: "Conheça os nossos serviços e formas de atendimento.",
  },
  education: {
    eyebrow: "Conhecimento para o futuro",
    about: "Aprender é crescer",
    offer: "A nossa oferta",
    action: "Conhecer oferta",
    offerDescription: "Descubra as oportunidades de aprendizagem.",
  },
  realestate: {
    eyebrow: "O lugar certo para si",
    about: "Encontre o espaço ideal",
    offer: "As nossas oportunidades",
    action: "Ver oportunidades",
    offerDescription: "Conheça as opções disponíveis.",
  },
  retail: {
    eyebrow: "Qualidade em cada escolha",
    about: "Produtos seleccionados para si",
    offer: "A nossa selecção",
    action: "Explorar loja",
    offerDescription: "Descubra os produtos disponíveis.",
  },
  services: {
    eyebrow: "Soluções para si",
    about: "Profissionalismo em cada projecto",
    offer: "O que fazemos",
    action: "Conhecer soluções",
    offerDescription: "Conheça as soluções que temos para si.",
  },
  general: {
    eyebrow: "Bem-vindo",
    about: "Conheça o nosso negócio",
    offer: "O que temos para oferecer",
    action: "Descobrir",
    offerDescription: "Conheça os nossos produtos e serviços.",
  },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function WebsitePage() {
  const { slug = "" } = useParams();

  const [business, setBusiness] = useState<Business | null>(null);
  const [content, setContent] = useState<SiteContent>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    let active = true;

    async function loadWebsite() {
      setLoading(true);

      try {
        const [info, site, productList, serviceList] = await Promise.all([
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
          }),
          apiFetch<Service[]>("/api/v1/reservations/services", {
            skipAuth: true,
            tenant: slug,
          }),
        ]);

        if (!active) return;

        setBusiness(info);
        setContent(
          site?.isPublished && site.content ? site.content : {}
        );
        setProducts(Array.isArray(productList) ? productList : []);
        setServices(Array.isArray(serviceList) ? serviceList : []);
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
      <div className="min-h-screen flex items-center justify-center bg-[#F8F4F0] text-[#6B263F]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#D6B58C] border-t-[#6B263F] rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium">A preparar o website...</p>
        </div>
      </div>
    );
  }

  if (!business || !slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F4F0] p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#34252C]">
            Website indisponível
          </h1>
          <p className="text-gray-500 mt-2">
            Não foi possível encontrar este negócio.
          </p>
        </div>
      </div>
    );
  }

  const visual = content.visualIdentity || {};
  const profile = sectorText[sector];

  const primary =
    visual.primaryColor ||
    visual.primary ||
    business.primaryColor ||
    "#6B263F";

  const secondary =
    visual.secondaryColor ||
    visual.secondary ||
    business.secondaryColor ||
    "#D6B58C";

  const accent = visual.accentColor || business.accentColor || secondary;
  const background = visual.background || "#F8F4F0";
  const surface = visual.surface || "#FFFFFF";
  const textColor = visual.text || "#30252A";
  const muted = visual.muted || "#81747A";
  const border = visual.border || "#E8DFDA";

  const title =
    content.heroTitle || business.heroTitle || business.name;

  const subtitle =
    content.heroSubtitle ||
    business.heroSubtitle ||
    "Descubra tudo o que temos para oferecer.";

  const heroImage =
    content.heroImage || business.storeHeroImage || "";

  const description =
    content.description ||
    content.aboutText ||
    `${business.name} — trabalhamos todos os dias para oferecer qualidade, confiança e um serviço de excelência.`;

  const gallery = Array.isArray(content.gallery)
    ? content.gallery.filter((image) => Boolean(image && image.trim()))
    : [];

  const modules = Array.isArray(business.modules)
    ? business.modules.map((module) => module.toLowerCase())
    : ["website", "store", "booking"];

  const hasStore = modules.includes("store");
  const hasBooking = modules.includes("booking");

  const hasProducts = products.length > 0;
  const hasServices = services.length > 0;

  const showOffer = hasProducts || hasServices;

  const mainAction = content.buttonText || profile.action;

  const heroOverlay =
    sector === "beauty"
      ? "linear-gradient(90deg, rgba(35,15,26,.72), rgba(35,15,26,.12))"
      : sector === "health"
      ? "linear-gradient(90deg, rgba(8,30,43,.78), rgba(8,30,43,.12))"
      : "linear-gradient(90deg, rgba(25,15,20,.72), rgba(25,15,20,.10))";

  return (
    <main
      className="min-h-screen overflow-hidden"
      style={{
        backgroundColor: background,
        color: textColor,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{
          backgroundColor: `${surface}F2`,
          borderColor: border,
        }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between gap-4">
          <Link
            to={`/${slug}`}
            className="flex items-center gap-3 min-w-0"
          >
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
                {business.name.charAt(0).toUpperCase()}
              </div>
            )}

            <span className="font-bold text-lg md:text-xl truncate">
              {business.name}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <a href="#inicio" className="hover:opacity-60 transition">
              Início
            </a>
            <a href="#sobre" className="hover:opacity-60 transition">
              Sobre
            </a>
            {showOffer && (
              <a href="#oferta" className="hover:opacity-60 transition">
                Oferta
              </a>
            )}
            {gallery.length > 0 && (
              <a href="#galeria" className="hover:opacity-60 transition">
                Galeria
              </a>
            )}
            <a href="#contactos" className="hover:opacity-60 transition">
              Contactos
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {hasStore && (
              <Link
                to={`/${slug}/loja`}
                className="hidden sm:inline-flex px-4 py-2.5 rounded-full border text-sm font-semibold transition hover:opacity-70"
                style={{ borderColor: border }}
              >
                Loja
              </Link>
            )}

            {hasBooking && (
              <Link
                to={`/${slug}/reservas`}
                className="px-5 py-2.5 rounded-full text-white text-sm font-semibold transition hover:opacity-90"
                style={{ backgroundColor: primary }}
              >
                Reservar
              </Link>
            )}
          </div>
        </div>
      </header>

      <section
        id="inicio"
        className="relative min-h-[590px] md:min-h-[720px] flex items-center overflow-hidden"
        style={{
          backgroundColor: primary,
          backgroundImage: heroImage
            ? `${heroOverlay}, url("${heroImage}")`
            : `linear-gradient(135deg, ${primary}, #2D1722)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/5" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-10 py-24">
          <div
            className={`max-w-3xl text-white ${
              sector === "beauty" ? "text-center mx-auto" : ""
            }`}
          >
            <div
              className="inline-flex items-center gap-3 mb-8 text-xs md:text-sm uppercase tracking-[.28em] font-semibold"
              style={{ color: accent }}
            >
              <span className="w-10 h-px bg-current" />
              {profile.eyebrow}
              <span className="w-10 h-px bg-current" />
            </div>

            <h1
              className="font-normal leading-[1.05] tracking-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              {title}
            </h1>

            <p className="text-lg md:text-xl mt-7 text-white/85 leading-relaxed max-w-2xl">
              {subtitle}
            </p>

            <div
              className={`flex flex-wrap gap-3 mt-10 ${
                sector === "beauty" ? "justify-center" : ""
              }`}
            >
              {hasStore && (
                <Link
                  to={`/${slug}/loja`}
                  className="inline-flex items-center gap-3 px-7 py-4 rounded-full font-semibold transition hover:opacity-90"
                  style={{
                    backgroundColor: secondary,
                    color: "#30252A",
                  }}
                >
                  {mainAction}
                  <span aria-hidden="true">↗</span>
                </Link>
              )}

              {hasBooking && (
                <Link
                  to={`/${slug}/reservas`}
                  className="inline-flex items-center gap-3 px-7 py-4 rounded-full border border-white/70 text-white font-semibold transition hover:bg-white/10"
                >
                  Marcar atendimento
                  <span aria-hidden="true">↗</span>
                </Link>
              )}

              {!hasStore && !hasBooking && (
                <a
                  href="#contactos"
                  className="inline-flex items-center gap-3 px-7 py-4 rounded-full font-semibold"
                  style={{
                    backgroundColor: secondary,
                    color: "#30252A",
                  }}
                >
                  {mainAction}
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ backgroundColor: secondary }} />
      </section>

      <section
        id="sobre"
        className="py-24 md:py-32 px-6"
        style={{ backgroundColor: background }}
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 md:gap-20 items-center">
          <div>
            <div
              className="flex items-center gap-3 uppercase tracking-[.22em] text-xs font-bold"
              style={{ color: primary }}
            >
              <span className="w-9 h-px" style={{ backgroundColor: primary }} />
              {profile.about}
            </div>

            <h2
              className="text-4xl md:text-6xl leading-tight font-normal mt-7"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              {content.aboutTitle || `Bem-vindo à ${business.name}`}
            </h2>

            <p
              className="text-base md:text-lg leading-8 mt-7 whitespace-pre-line"
              style={{ color: muted }}
            >
              {description}
            </p>

            {hasBooking && (
              <Link
                to={`/${slug}/reservas`}
                className="inline-flex items-center gap-3 mt-9 font-bold border-b pb-2"
                style={{ color: primary, borderColor: secondary }}
              >
                Marcar atendimento <span>↗</span>
              </Link>
            )}
          </div>

          <div className="relative">
            {gallery[0] ? (
              <img
                src={gallery[0]}
                alt={business.name}
                className="w-full h-[380px] md:h-[520px] object-cover rounded-[2px]"
                loading="lazy"
              />
            ) : heroImage ? (
              <img
                src={heroImage}
                alt={business.name}
                className="w-full h-[380px] md:h-[520px] object-cover rounded-[2px]"
                loading="lazy"
              />
            ) : (
              <div
                className="w-full h-[380px] md:h-[520px] flex items-center justify-center"
                style={{ backgroundColor: `${primary}12` }}
              >
                <span
                  className="text-7xl"
                  style={{
                    color: primary,
                    fontFamily: '"Playfair Display", Georgia, serif',
                  }}
                >
                  {business.name.charAt(0)}
                </span>
              </div>
            )}

            <div
              className="absolute -bottom-5 -left-5 md:-left-8 px-7 py-5 max-w-[220px]"
              style={{ backgroundColor: secondary, color: "#30252A" }}
            >
              <p className="text-xs uppercase tracking-[.2em] font-bold">
                {business.name}
              </p>
              <p
                className="text-xl mt-2"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Qualidade em cada detalhe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {showOffer && (
        <section
          id="oferta"
          className="py-24 md:py-28 px-6"
          style={{
            backgroundColor: surface,
            borderTop: `1px solid ${border}`,
            borderBottom: `1px solid ${border}`,
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-14">
              <div
                className="flex items-center gap-3 uppercase tracking-[.22em] text-xs font-bold"
                style={{ color: primary }}
              >
                <span className="w-9 h-px" style={{ backgroundColor: primary }} />
                {profile.eyebrow}
              </div>

              <h2
                className="text-4xl md:text-6xl font-normal mt-6"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                {profile.offer}
              </h2>

              <p className="mt-5 leading-7" style={{ color: muted }}>
                {profile.offerDescription}
              </p>
            </div>

            {hasServices && (
              <div className="mb-16">
                <div className="flex items-center justify-between gap-4 mb-7">
                  <h3
                    className="text-2xl md:text-3xl"
                    style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                  >
                    Serviços
                  </h3>

                  {hasBooking && (
                    <Link
                      to={`/${slug}/reservas`}
                      className="text-sm font-bold"
                      style={{ color: primary }}
                    >
                      Marcar agora ↗
                    </Link>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-x-12">
                  {services.map((service) => (
                    <article
                      key={service.id}
                      className="flex items-center justify-between gap-5 py-6 border-b"
                      style={{ borderColor: border }}
                    >
                      <div>
                        <h4 className="font-semibold text-lg">
                          {service.name}
                        </h4>
                        {service.durationMin ? (
                          <p className="text-sm mt-1" style={{ color: muted }}>
                            {service.durationMin} minutos
                          </p>
                        ) : null}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold" style={{ color: primary }}>
                          {formatPrice(service.price)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {hasProducts && (
              <div>
                <div className="flex items-center justify-between gap-4 mb-7">
                  <h3
                    className="text-2xl md:text-3xl"
                    style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                  >
                    Produtos em destaque
                  </h3>

                  {hasStore && (
                    <Link
                      to={`/${slug}/loja`}
                      className="text-sm font-bold"
                      style={{ color: primary }}
                    >
                      Ver toda a loja ↗
                    </Link>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
                  {products.slice(0, 6).map((product) => (
                    <article key={product.id} className="group">
                      <div
                        className="relative overflow-hidden aspect-[4/4.5]"
                        style={{ backgroundColor: background }}
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span
                              className="text-5xl"
                              style={{ color: primary }}
                            >
                              ◇
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-5">
                        <h4 className="text-lg font-semibold">
                          {product.name}
                        </h4>

                        {product.description && (
                          <p
                            className="text-sm leading-6 mt-2"
                            style={{ color: muted }}
                          >
                            {product.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-3 mt-4">
                          <span
                            className="font-bold"
                            style={{ color: primary }}
                          >
                            {formatPrice(product.price)}
                          </span>

                          {hasStore && (
                            <Link
                              to={`/${slug}/loja`}
                              className="text-sm font-bold"
                              style={{ color: primary }}
                            >
                              Ver produto ↗
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section
          id="galeria"
          className="py-24 px-6"
          style={{ backgroundColor: background }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div
                className="uppercase tracking-[.22em] text-xs font-bold"
                style={{ color: primary }}
              >
                {business.name}
              </div>

              <h2
                className="text-4xl md:text-6xl mt-5 font-normal"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Galeria
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {gallery.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className={`overflow-hidden ${
                    index === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <img
                    src={image}
                    alt={`${business.name} - fotografia ${index + 1}`}
                    className={`w-full object-cover transition duration-700 hover:scale-105 ${
                      index === 0
                        ? "h-full min-h-[300px] md:min-h-[500px]"
                        : "h-48 md:h-64"
                    }`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        id="contactos"
        className="py-24 md:py-32 px-6 text-white"
        style={{ backgroundColor: primary }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="uppercase tracking-[.25em] text-xs font-bold text-white/65">
            Estamos disponíveis
          </div>

          <h2
            className="text-4xl md:text-7xl font-normal mt-7 leading-tight"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Vamos conversar?
          </h2>

          <p className="text-white/75 text-lg mt-6 max-w-2xl mx-auto leading-8">
            Entre em contacto connosco. Teremos todo o gosto em ajudar.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {business.phone && (
              <a
                href={`https://wa.me/${business.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="px-7 py-4 rounded-full font-bold"
                style={{ backgroundColor: secondary, color: "#30252A" }}
              >
                Falar pelo WhatsApp ↗
              </a>
            )}

            {hasBooking && (
              <Link
                to={`/${slug}/reservas`}
                className="px-7 py-4 rounded-full border border-white/60 font-bold"
              >
                Fazer uma marcação
              </Link>
            )}

            {business.mapsUrl && (
              <a
                href={normalizeUrl(business.mapsUrl)}
                target="_blank"
                rel="noreferrer"
                className="px-7 py-4 rounded-full border border-white/60 font-bold"
              >
                Como chegar ↗
              </a>
            )}
          </div>

          <div className="mt-12 space-y-2 text-white/75">
            {business.address && <p>{business.address}</p>}
            {business.phone && <p>{business.phone}</p>}
          </div>

          {business.links && business.links.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {business.links.map((item, index) => (
                <a
                  key={`${item.url}-${index}`}
                  href={normalizeUrl(item.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer
        className="py-7 px-5 text-center text-sm"
        style={{ backgroundColor: "#21151B", color: "#C9BFC3" }}
      >
        © {new Date().getFullYear()} {business.name}. Todos os direitos reservados.
        <span className="block mt-2 text-xs opacity-60">
          Desenvolvido com MARKA-KANDA
        </span>
      </footer>
    </main>
  );
}