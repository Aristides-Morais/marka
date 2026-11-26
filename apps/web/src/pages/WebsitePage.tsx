import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import HeroScene from "../components/site/three/HeroScene";
import Gallery3D from "../components/site/motion/Gallery3D";
import SiteHeader from "../components/site/SiteHeader";
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
  const [scrolled, setScrolled] = useState(false);

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
          apiFetch<Business>("/api/v1/business/info", { skipAuth: true, tenant: slug }).catch(() => ({
            name: "Alive Restaurante & Lounge", type: "restaurante", template: "food", phone: "244923000000", primaryColor: "#6B1020", secondaryColor: "#9A7634"
          })),
          apiFetch<{ isPublished: boolean; content: SiteContent | null }>("/api/v1/site-content", { skipAuth: true, tenant: slug }).catch(() => null),
          apiFetch<Product[]>("/api/v1/products", { skipAuth: true, tenant: slug }).catch(() => []),
          apiFetch<Service[]>("/api/v1/reservations/services", { skipAuth: true, tenant: slug }).catch(() => []),
        ]);
        if (!live) return;
        setBusiness(b);
        
        const sector = detectSector(b?.type, b?.template);
        setContent(site?.isPublished && site.content ? mergeWithDefaults(site.content, sector, b.name) : mergeWithDefaults(null, sector, b.name));
        setProducts(Array.isArray(p) ? p : []);
        setServices(Array.isArray(s) ? s : []);
      } catch (e) {
        console.error("Erro ao carregar website:", e);
      } finally {
        if (live) setLoading(false);
      }
    }
    if (slug) load();
    return () => { live = false; };
  }, [slug]);

  const sector = useMemo(() => detectSector(business?.type, business?.template), [business?.type, business?.template]);

  if (loading) return <div className="min-h-screen grid place-items-center bg-[#f8f5f0]">A carregar...</div>;
  if (!business) return <div className="min-h-screen grid place-items-center">Negócio não encontrado.</div>;

  const visualSector = business.name.toLowerCase().includes("alive") ? "food" : sector;

  const primary = content.visualIdentity?.primaryColor || business.primaryColor || (visualSector === "food" ? "#6B1020" : "#512638");
  const secondary = content.visualIdentity?.secondaryColor || business.secondaryColor || (visualSector === "food" ? "#9A7634" : "#B99A75");
  
  const isServiceList = visualSector === "beauty" || visualSector === "health" || visualSector === "services";
  const cards = isServiceList ? (services.length > 0 ? services : content.services) : (products.length > 0 ? products : content.services);
  
  const phoneClean = (business.phone || "").replace(/\D/g, "");
  const waLink = phoneClean ? `https://wa.me/${phoneClean}` : null;

  return (
    <main className="min-h-screen bg-[#F8F4EF] text-[#35232B] font-sans overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <SiteHeader businessName={business.name} primary={primary} secondary={secondary} waLink={waLink} />

      {/* HERO */}
      <section id="inicio" className="relative h-[100svh] flex items-center justify-center overflow-hidden pt-20">
        <HeroScene sector={visualSector} primaryColor={primary} secondaryColor={secondary} heroImage={content.gallery?.[0]} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center justify-center h-full pb-10">
          <p className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-white/80 mb-4 md:mb-6 mt-10">
            Bem-vindo ao {business.name}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6 drop-shadow-xl">
            {content.heroTitle}
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-10 drop-shadow-md">
            {content.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <a href={waLink || "#"} target="_blank" rel="noreferrer" className="px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition hover:-translate-y-1 shadow-xl w-full sm:w-auto" style={{ background: secondary, color: "#1a1412" }}>
              {content.buttonText || "Contactar"}
            </a>
            <a href="#sobre" className="px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm border-2 border-white text-white hover:bg-white hover:text-black transition w-full sm:w-auto">
              Descobrir Mais
            </a>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="py-24 md:py-32 px-6">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-t-full overflow-hidden shadow-2xl">
             <img src={content.gallery?.[1]} alt="Sobre" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-serif text-4xl md:text-5xl mb-6 text-[#221A18]">{content.aboutTitle}</h2>
            <p className="text-gray-600 leading-relaxed mb-8 text-lg">{content.aboutText}</p>
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
               {content.stats?.map((s: any, i: number) => (
                 <div key={i}>
                   <div className="font-serif text-3xl font-bold" style={{ color: primary }}>{s.value}</div>
                   <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">{s.label}</div>
                 </div>
               ))}
            </div>
            <Link to={`/${slug}/sobre`} className="inline-block mt-8 text-sm font-bold uppercase tracking-widest" style={{ color: primary }}>
              Ler a Nossa História Completa →
            </Link>
          </div>
        </div>
      </section>

      {/* MENU */}
      <section id="menu" className="py-24 bg-white text-black">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl mb-4 text-[#221A18]">{content.servicesTitle}</h2>
            <div className="w-24 h-1 mx-auto" style={{ background: secondary }} />
          </div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            {Array.isArray(cards) && cards.slice(0, 4).map((item: any, i: number) => (
              <div key={i} className="group border-b border-gray-100 pb-4">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-serif text-xl font-bold group-hover:text-[#6B1020] transition-colors">{item.name}</h3>
                  <span className="text-sm font-bold" style={{ color: primary }}>{typeof item.price === 'number' ? `${item.price} Kz` : item.price}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc || item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link to={`/${slug}/servicos`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm text-white transition hover:-translate-y-1 shadow-xl" style={{ background: primary }}>
              Ver Menu Completo <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECÇÃO DE DESTAQUE DO TAKEAWAY (NOVO) */}
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
              <Link to={`/${slug}/takeaway`} className="block text-center px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition hover:-translate-y-1 shadow-xl w-full" style={{ background: secondary, color: "#1a1412" }}>
                Fazer Pedido Takeaway
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* GALERIA 3D */}
      <section id="galeria" className="py-24 bg-[#1a1412]">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
             <h2 className="font-serif text-4xl md:text-5xl text-white">Momentos</h2>
             <p className="text-gray-400 mt-2">Deslize para ver mais</p>
          </div>
        </div>
        <Gallery3D images={content.gallery || []} primary={primary} secondary={secondary} />
      </section>

      {/* TESTEMUNHOS */}
      <section className="py-24 px-6 bg-[#F8F4EF]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {content.testimonials?.slice(0, 3).map((t: any, i: number) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-4xl text-gray-300 font-serif mb-4">"</div>
                <p className="text-gray-600 italic mb-6">{t.text}</p>
                <div>
                  <div className="font-bold text-[#221A18]">{t.name}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
             <Link to={`/${slug}/depoimentos`} className="inline-block px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest border-2 transition hover:bg-black hover:text-white" style={{ borderColor: primary, color: primary }}>
              Ver Todos os Depoimentos
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contactos" className="bg-[#1a1412] text-white py-20 px-6">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-serif text-3xl mb-6">{business.name}</h3>
            <p className="text-gray-400 mb-6">{business.address || "Luanda, Angola"}</p>
            <p className="text-gray-400">{business.phone}</p>
            <div className="flex gap-4 mt-6">
              <a href="https://instagram.com/alive" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#9A7634] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://facebook.com/alive" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#9A7634] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6 uppercase tracking-widest">Links Rápidos</h4>
            <ul className="space-y-3 text-gray-400">
              <li><Link to={`/${slug}/sobre`} className="hover:text-white transition">Sobre Nós</Link></li>
              <li><Link to={`/${slug}/servicos`} className="hover:text-white transition">Menu / Serviços</Link></li>
              <li><Link to={`/${slug}/galeria`} className="hover:text-white transition">Galeria</Link></li>
              <li><Link to={`/${slug}/depoimentos`} className="hover:text-white transition">Depoimentos</Link></li>
              <li><Link to={`/${slug}/faq`} className="hover:text-white transition">FAQ</Link></li>
              <li><Link to={`/${slug}/blog`} className="hover:text-white transition">Blog</Link></li>
              <li><Link to={`/${slug}/localizacao`} className="hover:text-white transition">Localização</Link></li>
              <li><Link to={`/${slug}/contactos`} className="hover:text-white transition">Contactos</Link></li>
              <li><Link to={`/${slug}/eventos`} className="hover:text-white transition">Eventos</Link></li>
              <li><Link to={`/${slug}/takeaway`} className="hover:text-white transition">Takeaway</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6 uppercase tracking-widest">Contacte-nos</h4>
            {waLink && (
              <a href={waLink} target="_blank" rel="noreferrer" className="inline-block px-6 py-3 rounded-full font-bold text-black mb-4" style={{ background: secondary }}>
                Enviar Mensagem WhatsApp
              </a>
            )}
            <div className="text-sm text-gray-500 mt-8">
              © {new Date().getFullYear()} {business.name}. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}