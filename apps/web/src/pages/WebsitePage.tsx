
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { normalizeUrl } from "../lib/theme";

type SiteData = {
  name: string;
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

  // A identidade visual publicada tem prioridade sobre as cores antigas.
  const visual = content.visualIdentity || {};

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

  const accent =
    visual.accentColor ||
    visual.accent ||
    business.accentColor ||
    "#F7F9FC";

  const background = visual.background || accent;
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

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: background,
        color: textColor,
      }}
    >
      <header
        className="sticky top-0 z-40 backdrop-blur border-b"
        style={{
          backgroundColor: `${surface}F2`,
          borderColor: border,
        }}
      >
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-5">
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

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <a href="#inicio">Início</a>
            <a href="#sobre">Sobre</a>
            <a href="#galeria">Galeria</a>
            <a href="#contactos">Contactos</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to={`/${slug}/loja`}
              className="hidden sm:inline-flex px-4 py-2 rounded-lg border font-semibold text-sm"
              style={{ borderColor: border }}
            >
              Loja
            </Link>

            <Link
              to={`/${slug}/reservas`}
              className="px-4 py-2 rounded-lg text-white font-semibold text-sm"
              style={{ backgroundColor: primary }}
            >
              Reservar
            </Link>
          </div>
        </div>
      </header>

      <section
        id="inicio"
        className="relative min-h-[570px] flex items-center overflow-hidden"
        style={{
          backgroundColor: primary,
          backgroundImage: heroImage
            ? `linear-gradient(90deg, rgba(0,0,0,.72), rgba(0,0,0,.15)), url("${heroImage}")`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto w-full px-6 py-24">
          <div className="max-w-2xl text-white">
            <span
              className="inline-block rounded-full px-4 py-2 text-sm font-semibold mb-6"
              style={{
                backgroundColor: secondary,
                color: "#18181B",
              }}
            >
              Bem-vindo à {business.name}
            </span>

            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              {title}
            </h1>

            <p className="text-lg md:text-xl mt-6 text-white/85 leading-relaxed">
              {subtitle}
            </p>

            <div className="flex flex-wrap gap-3 mt-9">
              <Link
                to={`/${slug}/loja`}
                className="px-7 py-4 rounded-xl font-bold"
                style={{
                  backgroundColor: secondary,
                  color: "#18181B",
                }}
              >
                {content.buttonText || "Conhecer a loja"}
              </Link>

              <Link
                to={`/${slug}/reservas`}
                className="px-7 py-4 rounded-xl font-bold border border-white/60 text-white"
              >
                Fazer reserva
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="sobre"
        className="py-20 px-6"
        style={{ backgroundColor: background }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <span
            className="font-bold uppercase tracking-widest text-sm"
            style={{ color: accent }}
          >
            Conheça-nos
          </span>

          <h2 className="text-3xl md:text-4xl font-black mt-4">
            {content.aboutTitle || `Sobre ${business.name}`}
          </h2>

          <p
            className="text-lg leading-relaxed mt-7 max-w-3xl mx-auto whitespace-pre-line"
            style={{ color: muted }}
          >
            {description}
          </p>
        </div>
      </section>

      <section
        className="py-16 px-6"
        style={{
          backgroundColor: surface,
          borderTop: `1px solid ${border}`,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span
              className="font-bold uppercase tracking-widest text-sm"
              style={{ color: accent }}
            >
              Os nossos serviços
            </span>

            <h2 className="text-3xl font-black mt-4">
              Tudo num só lugar
            </h2>

            <p
              className="mt-4 leading-relaxed"
              style={{ color: muted }}
            >
              Consulte os nossos produtos, conheça os nossos serviços
              e entre em contacto connosco.
            </p>

            <div className="flex flex-wrap gap-3 mt-7">
              <Link
                to={`/${slug}/loja`}
                className="px-6 py-3 rounded-xl text-white font-bold"
                style={{ backgroundColor: primary }}
              >
                Visitar loja
              </Link>

              <Link
                to={`/${slug}/reservas`}
                className="px-6 py-3 rounded-xl font-bold border"
                style={{
                  borderColor: primary,
                  color: primary,
                }}
              >
                Fazer reserva
              </Link>
            </div>
          </div>

          <div
            className="rounded-3xl min-h-[280px] flex items-center justify-center p-10 text-center"
            style={{
              backgroundColor: background,
              border: `1px solid ${border}`,
            }}
          >
            <div>
              <div
                className="text-5xl mb-4"
                style={{ color: accent }}
              >
                ✦
              </div>

              <h3 className="text-2xl font-bold">
                {business.name}
              </h3>

              <p className="mt-2" style={{ color: muted }}>
                Qualidade e atenção em cada detalhe.
              </p>
            </div>
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
            <h2 className="text-3xl font-black text-center mb-10">
              Galeria
            </h2>

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
          <h2 className="text-3xl md:text-4xl font-black">
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
            <p className="mt-7 text-white/80">
              {business.address}
            </p>
          )}

          {business.links && business.links.length > 0 && (
            <div className="flex flex-wrap justify-center gap-5 mt-7">
              {business.links.map((item, index) => (
                <a
                  key={index}
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
