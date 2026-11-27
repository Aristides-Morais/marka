import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { detectSector, mergeWithDefaults, type SiteContent } from "../../lib/siteContent";

const DISH_IMAGES = [
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80",
];

const CATEGORIES = ["Todos", "Entradas", "Principais", "Bebidas", "Sobremesas", "Especiais"];

function ScrollReveal({ children, delay = 0, direction = "up", className = "" }: any) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const getTransform = () => {
    if (isVisible) return "translate(0, 0)";
    switch (direction) {
      case "up": return "translateY(40px)";
      case "down": return "translateY(-40px)";
      case "left": return "translateX(40px)";
      case "right": return "translateX(-40px)";
      default: return "translateY(40px)";
    }
  };
  return (
    <div ref={ref} className={`transition-all duration-1000 ease-out ${className}`} style={{ opacity: isVisible ? 1 : 0, transform: getTransform(), transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function ServicesListPage() {
  const { slug = "" } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [content, setContent] = useState<SiteContent>({});
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    async function load() {
      try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000));
        const fetchPromise = Promise.all([
          apiFetch<any>("/api/v1/business/info", { skipAuth: true, tenant: slug }).catch(() => null),
          apiFetch<any>("/api/v1/site-content", { skipAuth: true, tenant: slug }).catch(() => null),
        ]);
        const [b, site] = await Promise.race([fetchPromise, timeout]) as [any, any];
        if (!live) return;
        const safeBusiness = b || { name: "Alive Restaurante & Lounge", type: "restaurante", template: "food", phone: "244923000000", primaryColor: "#6B1020", secondaryColor: "#9A7634" };
        setBusiness(safeBusiness);
        const sector = detectSector(safeBusiness?.type, safeBusiness?.template) || "food";
        const merged = site?.isPublished && site.content ? mergeWithDefaults(site.content, sector, safeBusiness.name) : mergeWithDefaults(null, sector, safeBusiness.name);
        setContent(merged);
      } catch (e) {
        console.error(e);
        if (!live) return;
        setBusiness({ name: "Alive Restaurante & Lounge", phone: "244923000000", primaryColor: "#6B1020", secondaryColor: "#9A7634", type: "restaurante" });
        setContent(mergeWithDefaults(null, "food", "Alive Restaurante & Lounge"));
      } finally {
        if (live) setLoading(false);
      }
    }
    if (slug) load();
    return () => { live = false; };
  }, [slug]);

  if (loading) return <div className="min-h-screen grid place-items-center bg-[#F8F4EF]">A carregar...</div>;
  if (!business || !content) return <div className="min-h-screen grid place-items-center bg-[#F8F4EF]">A carregar dados...</div>;

  const primary = content.visualIdentity?.primaryColor || business.primaryColor || "#6B1020";
  const secondary = content.visualIdentity?.secondaryColor || business.secondaryColor || "#9A7634";
  
  // Usa os serviços do Super Admin (com categorias). Se vazio, usa o fallback do siteContent.
  const allServices = content.services && content.services.length > 0 ? content.services : [];
  const filteredServices = activeCategory === "Todos" 
    ? allServices 
    : allServices.filter((s: any) => (s.category || "Principais") === activeCategory);
  
  const waLink = `https://wa.me/${(business.phone || "").replace(/\D/g, "")}`;

  return (
    <main className="min-h-screen bg-[#F8F4EF] text-[#35232B] font-sans">
      <style>{`
            <SiteHeader businessName={business?.name || "Alive"} primary={primary} secondary={secondary} waLink={waLink} businessType={business?.type} />
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to={`/${slug}`} className="font-serif text-2xl font-bold text-[#221A18]">{business.name}</Link>
          <Link to={`/${slug}`} className="text-sm font-medium uppercase tracking-widest text-gray-600 hover:text-black">← Voltar ao Início</Link>
        </div>
      </header>

      <section className="pt-32 pb-12 px-6 text-center bg-white relative overflow-hidden">
        <ScrollReveal delay={100}>
          <p className="text-sm font-bold tracking-[0.2em] uppercase mb-4" style={{ color: primary }}>Gastronomia</p>
          <h1 className="font-serif text-5xl md:text-7xl text-[#221A18] leading-tight mb-6">{content.servicesTitle || "O Nosso Menu"}</h1>
          <div className="w-24 h-1 mx-auto" style={{ background: secondary }}></div>
        </ScrollReveal>
      </section>

      {/* FILTROS */}
      <section className="py-8 px-6 bg-white border-b border-gray-100 sticky top-[60px] z-40">
        <div className="container mx-auto max-w-4xl flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                activeCategory === cat ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={{ background: activeCategory === cat ? primary : undefined }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="py-12 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-12">
            {filteredServices.length === 0 ? (
              <p className="text-center text-gray-500">Nenhum prato encontrado nesta categoria.</p>
            ) : (
              filteredServices.map((item: any, index: number) => (
                <ScrollReveal key={`${activeCategory}-${index}`} delay={index * 100} direction={index % 2 === 0 ? "left" : "right"}>
                  <div className="group flex flex-col md:flex-row gap-8 items-center bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
                    <div className="w-full md:w-1/3 aspect-[4/3] overflow-hidden rounded-xl">
                      <img src={item.imageUrl || DISH_IMAGES[index % DISH_IMAGES.length]} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="w-full md:w-2/3 flex flex-col justify-center">
                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#221A18] group-hover:text-[#6B1020] transition-colors">{item.name}</h3>
                        <span className="text-lg font-bold" style={{ color: primary }}>{item.price}</span>
                      </div>
                      <div className="w-full border-b border-dotted border-gray-300 mb-4"></div>
                      <p className="text-gray-600 leading-relaxed mb-6">{item.desc}</p>
                      <div className="mt-auto">
                        <a href={`${waLink}?text=Olá, gostaria de pedir o prato: ${item.name}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider text-white transition hover:-translate-y-1 shadow-md" style={{ background: primary }}>
                          Pedir pelo WhatsApp <span aria-hidden>→</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 text-center" style={{ background: primary }}>
        <div className="container mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl mb-6 text-white">Pronto para experimentar?</h2>
          <p className="text-white/80 mb-8 text-lg">Faça a sua reserva e venha viver uma experiência inesquecível.</p>
          <a href={waLink} target="_blank" rel="noreferrer" className="inline-block px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition hover:-translate-y-1 shadow-xl" style={{ background: secondary, color: "#1a1412" }}>
            Reservar Mesa Agora
          </a>
        </div>
      </section>
    </main>
  );
}