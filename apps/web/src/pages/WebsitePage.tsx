import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import HeroScene from "../components/site/three/HeroScene";
import { detectSector, mergeWithDefaults, type SiteContent, type Sector } from "../lib/siteContent";

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
          apiFetch<Business>("/api/v1/business/info", { skipAuth: true, tenant: slug }),
          apiFetch<{ isPublished: boolean; content: SiteContent | null }>("/api/v1/site-content", { skipAuth: true, tenant: slug }),
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

  const primary = content.visualIdentity?.primary || business.primaryColor || "#512638";
  const secondary = content.visualIdentity?.secondary || business.secondaryColor || "#B99A75";
  const isServiceList = sector === "beauty" || sector === "health" || sector === "services";
  
  // Puxa os serviços da API ou os do Fallback do siteContent.ts
  const cards = isServiceList ? (services.length > 0 ? services : content.services) : (products.length > 0 ? products : content.services);
  
  const phoneClean = (business.phone || "").replace(/\D/g, "");
  const waLink = phoneClean ? `https://wa.me/${phoneClean}` : null;

  return (
    <main className="min-h-screen bg-[#F8F4EF] text-[#35232B] font-sans overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
        @keyframes slow-zoom { from { transform: scale(1); } to { transform: scale(1.1); } }
      `}</style>

      {/* HEADER PREMIUM */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3 text-black" : "bg-transparent py-6 text-white"}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to={`/${slug}`} className="font-serif text-2xl font-bold tracking-tight">
            {business.name}
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest">
            <a href="#sobre" className="hover:opacity-70 transition">Sobre</a>
            <a href="#menu" className="hover:opacity-70 transition">{isServiceList ? "Serviços" : "Menu"}</a>
            <a href="#galeria" className="hover:opacity-70 transition">Galeria</a>
            <a href="#contactos" className="hover:opacity-70 transition">Contactos</a>
            {waLink && (
              <a href={waLink} target="_blank" rel="noreferrer" className="px-6 py-2 rounded-full font-bold text-black transition hover:scale-105" style={{ background: secondary }}>
                Reservar
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* HERO CINEMATOGRÁFICO */}
      <section id="inicio" className="relative h-[100svh] flex items-center justify-center overflow-hidden">
        <HeroScene sector={sector} primaryColor={primary} secondaryColor={secondary} heroImage={content.gallery?.[0]} />
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
          <p className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-white/80 mb-6">
            Bem-vindo ao {business.name}
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-tight mb-8 drop-shadow-lg">
            {content.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12 drop-shadow-md">
            {content.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={waLink || "#"} target="_blank" rel="noreferrer" className="px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition hover:-translate-y-1 shadow-xl" style={{ background: secondary, color: "#1a1412" }}>
              {content.buttonText || "Contactar"}
            </a>
            <a href="#sobre" className="px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm border-2 border-white text-white hover:bg-white hover:text-black transition">
              Descobrir Mais
            </a>
          </div>
        </div>
      </section>

      {/* SOBRE NÓS */}
      <section id="sobre" className="py-24 md:py-32 px-6">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-t-full overflow-hidden shadow-2xl">
             <img src={content.gallery?.[1] || "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c"} alt="Sobre" className="w-full h-full object-cover" />
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
          </div>
        </div>
      </section>

      {/* SERVIÇOS / MENU */}
      <section id="menu" className="py-24 bg-white text-black">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl mb-4 text-[#221A18]">{content.servicesTitle}</h2>
            <div className="w-24 h-1 mx-auto" style={{ background: secondary }} />
          </div>
          
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            {Array.isArray(cards) && cards.map((item: any, i: number) => (
              <div key={i} className="group border-b border-gray-100 pb-4">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-serif text-xl font-bold group-hover:text-[#6B1020] transition-colors">{item.name}</h3>
                  <span className="text-sm font-bold" style={{ color: primary }}>{typeof item.price === 'number' ? `${item.price} Kz` : item.price}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc || item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIA (Agora alinhada corretamente) */}
      <section id="galeria" className="py-24 px-6 bg-[#F8F4EF]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
             <h2 className="font-serif text-4xl md:text-5xl text-[#221A18]">Momentos</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {content.gallery?.slice(0, 4).map((img: string, i: number) => (
              <div key={i} className={`overflow-hidden rounded-2xl shadow-lg ${i === 1 || i === 2 ? "md:translate-y-8" : ""}`}>
                <img src={img} alt="Galeria" className="w-full h-[300px] object-cover hover:scale-110 transition duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTEMUNHOS */}
      <section className="py-24 px-6 bg-[#F8F4EF]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {content.testimonials?.map((t: any, i: number) => (
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
        </div>
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
              <li><Link to={`/${slug}/servicos`} className="hover:text-white transition">Serviços</Link></li>
              <li><Link to={`/${slug}/faq`} className="hover:text-white transition">FAQ</Link></li>
              <li><Link to={`/${slug}/blog`} className="hover:text-white transition">Blog</Link></li>
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