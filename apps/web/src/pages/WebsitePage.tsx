import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import HeroScene from "../components/site/three/HeroScene";
import Gallery3D from "../components/site/motion/Gallery3D";
import SiteHeader from "../components/site/SiteHeader";
import FloatingActions from "../components/site/FloatingActions";
import { detectSector, mergeWithDefaults, type SiteContent } from "../lib/siteContent";

type Business = any;
type Product = any;
type Service = any;

export default function WebsitePage() {
  const { slug = "" } = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [content, setContent] = useState<SiteContent>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [experience, setExperience] = useState<string>("classic");

  useEffect(() => {
    let live = true;
    async function load() {
      setLoading(true);
      try {
        const [b, site, p, s] = await Promise.all([
          apiFetch<Business>("/api/v1/business/info", { skipAuth: true, tenant: slug }).catch(() => ({
            name: "Alive Restaurante & Lounge", type: "restaurante", template: "food", phone: "244923000000", primaryColor: "#6B1020", secondaryColor: "#9A7634",
          })),
          apiFetch<{ isPublished: boolean; content: SiteContent | null }>("/api/v1/site-content", { skipAuth: true, tenant: slug }).catch(() => null),
          apiFetch<Product[]>("/api/v1/products", { skipAuth: true, tenant: slug }).catch(() => []),
          apiFetch<Service[]>("/api/v1/reservations/services", { skipAuth: true, tenant: slug }).catch(() => []),
        ]);
        if (!live) return;
        setBusiness(b);
        const sector = detectSector(b?.type, b?.template);
        const publishedContent = site?.isPublished && site.content ? site.content : null;
        setExperience((b as any)?.theme?.animation?.experience || (site?.content as any)?.animations?.experience || "classic");
        setContent(mergeWithDefaults(publishedContent, sector, b.name));
        setProducts(Array.isArray(p) ? p : []);
        setServices(Array.isArray(s) ? s : []);
      } catch (error) {
        console.error("Erro ao carregar website:", error);
      } finally {
        if (live) setLoading(false);
      }
    }
    if (slug) load();
    return () => { live = false; };
  }, [slug]);

  const sector = useMemo(() => detectSector(business?.type, business?.template), [business?.type, business?.template]);

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-[#f8f5f0]">A carregar...</div>;
  }
  if (!business) {
    return <div className="min-h-screen grid place-items-center">Negócio não encontrado.</div>;
  }

  const visualSector = String(business.name || "").toLowerCase().includes("alive") ? "food" : sector;
  const primary = content.visualIdentity?.primaryColor || business.primaryColor || (visualSector === "food" ? "#6B1020" : "#512638");
  const secondary = content.visualIdentity?.secondaryColor || business.secondaryColor || (visualSector === "food" ? "#9A7634" : "#B99A75");

  // FIX BRANCO NO TELEFONE: força classic no mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const safeExperience = isMobile ? "classic" : experience;

  const isServiceList = visualSector === "beauty" || visualSector === "health" || visualSector === "services";
  const cards = isServiceList ? (services.length > 0 ? services : content.services) : (products.length > 0 ? products : content.services);
  const phoneClean = String(business.phone || "").replace(/\D/g, "");
  const waLink = phoneClean ? `https://wa.me/${phoneClean}` : null;
  const gallery: string[] = Array.isArray((content as any).gallery) ? (content as any).gallery : [];

  return (
    <main className="site-animation-root min-h-screen bg-[#F8F4EF] text-[#35232B] font-sans overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <SiteHeader businessName={business.name} primary={primary} secondary={secondary} waLink={waLink} businessType={business.type} business={business} />

      {/* HERO */}
      <section id="inicio" className={safeExperience === "imersivo" ? "relative h-[250vh] overflow-hidden" : "relative h-[100svh] overflow-hidden pt-20"}>
        <div className={safeExperience === "imersivo" ? "sticky top-0 h-[100svh] flex items-center justify-center overflow-hidden pt-20" : "relative h-full flex items-center justify-center overflow-hidden"}>
          <HeroScene sector={visualSector} primaryColor={primary} secondaryColor={secondary} heroImage={gallery?.[0]} experience={safeExperience} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center justify-center h-full pb-10">
            <p className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-white/80 mb-4 md:mb-6 mt-10">Bem-vindo ao {business.name}</p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6 drop-shadow-xl">{content.heroTitle}</h1>
            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-10 drop-shadow-md">{content.heroSubtitle}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <a href={waLink || "#"} target="_blank" rel="noreferrer" className="px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition hover:-translate-y-1 shadow-xl w-full sm:w-auto" style={{ background: secondary, color: "#1a1412" }}>{content.buttonText || "Contactar"}</a>
              <a href="#sobre" className="px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm border-2 border-white text-white hover:bg-white hover:text-black transition w-full sm:w-auto">Descobrir Mais</a>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="py-24 md:py-32 px-6">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-t-full overflow-hidden shadow-2xl">
            {gallery?.[1] ? <img src={gallery[1]} alt="Sobre" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#EDE6DF]" />}
          </div>
          <div>
            <h2 className="font-serif text-4xl md:text-5xl mb-6 text-[#221A18]">{content.aboutTitle}</h2>
            <p className="text-gray-600 leading-relaxed mb-8 text-lg">{content.aboutText}</p>
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              {content.stats?.map((stat: any, index: number) => (
                <div key={index}>
                  <div className="font-serif text-3xl font-bold" style={{ color: primary }}>{stat.value}</div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            <Link to={`/${slug}/sobre`} className="inline-block mt-8 text-sm font-bold uppercase tracking-widest" style={{ color: primary }}>Ler a Nossa História Completa →</Link>
          </div>
        </div>
      </section>

      {/* CARDÁPIO DIGITAL / SERVIÇOS - SÓ UM */}
      <section id="menu" className="py-24 bg-white text-black">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl mb-4 text-[#221A18]">{content.servicesTitle || "Cardápio Digital"}</h2>
            <div className="w-24 h-1 mx-auto" style={{ background: secondary }} />
          </div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            {Array.isArray(cards) && cards.slice(0, 4).map((item: any, index: number) => (
              <div key={index} className="group border-b border-gray-100 pb-4">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-serif text-xl font-bold group-hover:text-[#6B1020] transition-colors">{item.name}</h3>
                  <span className="text-sm font-bold" style={{ color: primary }}>{typeof item.price === "number" ? `${item.price.toLocaleString()} Kz` : item.price}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc || item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link to={`/${slug}/cardapio`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm text-white transition hover:-translate-y-1 shadow-xl" style={{ background: primary }}>
              Ver Cardápio Digital <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* TAKEAWAY */}
      {String(business.type || "").includes("restaurante") && (
        <section className="py-16 px-6 bg-white">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-[#1a1412] rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <img src="https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1200&q=80" alt="Delivery" className="w-full h-full object-cover" />
              </div>
              <div className="relative z-10 md:w-2/3">
                <h2 className="font-serif text-3xl md:text-5xl text-white mb-4">Comer em casa?</h2>
                <p className="text-white/80 text-lg">Peça os seus pratos favoritos e receba em casa em Luanda. Rápido e saboroso.</p>
              </div>
              <div className="relative z-10 w-full md:w-auto">
                <Link to={`/${slug}/takeaway`} className="block text-center px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition hover:-translate-y-1 shadow-xl w-full" style={{ background: secondary, color: "#1a1412" }}>Fazer Pedido Takeaway</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* GALERIA 3D - no mobile vira grelha simples, sem 3D */}
      <section id="galeria" className="bg-[#1a1412] py-16">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl text-white">Momentos</h2>
            <p className="text-gray-400 mt-2">Deslize para ver mais</p>
          </div>
        </div>
        {isMobile ? (
          <div className="container mx-auto px-6 grid grid-cols-2 gap-3 pb-8">
            {gallery.slice(0, 4).map((img: string, i: number) => (
              <img key={i} src={img} alt={`Galeria ${i}`} className="w-full h-44 object-cover rounded-2xl" />
            ))}
          </div>
        ) : (
          <Gallery3D images={gallery || []} primary={primary} secondary={secondary} experience={safeExperience} />
        )}
      </section>

      {/* FOOTER */}
      <footer id="contactos" className="bg-[#1a1412] text-white py-20 px-6">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-serif text-3xl mb-6">{business.name}</h3>
            <p className="text-gray-400 mb-6">{business.address || "Luanda, Angola"}</p>
            <p className="text-gray-400">{business.phone}</p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6 uppercase tracking-widest">Links Rápidos</h4>
            <ul className="space-y-3 text-gray-400">
              <li><Link to={`/${slug}/sobre`} className="hover:text-white transition">Sobre Nós</Link></li>
              <li><Link to={`/${slug}/cardapio`} className="hover:text-white transition">Cardápio Digital</Link></li>
              <li><Link to={`/${slug}/galeria`} className="hover:text-white transition">Galeria</Link></li>
              <li><Link to={`/${slug}/contactos`} className="hover:text-white transition">Contactos</Link></li>
              {String(business.type || "").includes("restaurante") && (
                <>
                  <li><Link to={`/${slug}/takeaway`} className="hover:text-white transition">Takeaway</Link></li>
                  <li><Link to={`/${slug}/eventos`} className="hover:text-white transition">Eventos</Link></li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6 uppercase tracking-widest">Contacte-nos</h4>
            {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="inline-block px-6 py-3 rounded-full font-bold text-black mb-4" style={{ background: secondary }}>Enviar Mensagem WhatsApp</a>}
            <div className="text-sm text-gray-500 mt-8">© {new Date().getFullYear()} {business.name}. Todos os direitos reservados.</div>
          </div>
        </div>
      </footer>

      <FloatingActions phone={business.phone} primary={primary} />
    </main>
  );
}