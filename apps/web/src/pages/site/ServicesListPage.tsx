import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { detectSector, mergeWithDefaults, type SiteContent } from "../../lib/siteContent";
import ScrollReveal from "../../components/site/motion/ScrollReveal";

// Imagens de alta qualidade para cada prato do menu (substitui pelos URLs reais se tiveres)
const DISH_IMAGES = [
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80",
];

export default function ServicesListPage() {
  const { slug = "" } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [content, setContent] = useState<SiteContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    async function load() {
      try {
        const [b, site] = await Promise.all([
          apiFetch<any>("/api/v1/business/info", { skipAuth: true, tenant: slug }),
          apiFetch<any>("/api/v1/site-content", { skipAuth: true, tenant: slug }),
        ]);
        if (!live) return;
        setBusiness(b);
        const sector = detectSector(b?.type, b?.template);
        setContent(site?.isPublished && site.content ? mergeWithDefaults(site.content, sector, b.name) : mergeWithDefaults(null, sector, b.name));
      } catch (e) {
        console.error(e);
      } finally {
        if (live) setLoading(false);
      }
    }
    if (slug) load();
    return () => { live = false; };
  }, [slug]);

  if (loading) return <div className="min-h-screen grid place-items-center bg-[#F8F4EF]">A carregar...</div>;
  if (!business) return <div className="min-h-screen grid place-items-center">Negócio não encontrado.</div>;

  const primary = content.visualIdentity?.primary || business.primaryColor || "#6B1020";
  const secondary = content.visualIdentity?.secondary || business.secondaryColor || "#9A7634";
  const isFood = business.name.toLowerCase().includes("alive") || detectSector(business.type, business.template) === "food";
  
  const services = content.services || [];
  const phoneClean = (business.phone || "").replace(/\D/g, "");
  const waLink = phoneClean ? `https://wa.me/${phoneClean}` : null;

  return (
    <main className="min-h-screen bg-[#F8F4EF] text-[#35232B] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* HEADER SIMPLES */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to={`/${slug}`} className="font-serif text-2xl font-bold text-[#221A18]">{business.name}</Link>
          <Link to={`/${slug}`} className="text-sm font-medium uppercase tracking-widest text-gray-600 hover:text-black">← Voltar ao Início</Link>
        </div>
      </header>

      {/* HERO DA PÁGINA */}
      <section className="pt-40 pb-20 px-6 text-center bg-white relative overflow-hidden">
        <ScrollReveal delay={100}>
          <p className="text-sm font-bold tracking-[0.2em] uppercase mb-4" style={{ color: primary }}>
            {isFood ? "Gastronomia" : "O Que Fazemos"}
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-[#221A18] leading-tight mb-6">
            {content.servicesTitle || (isFood ? "O Nosso Menu" : "Os Nossos Serviços")}
          </h1>
          <div className="w-24 h-1 mx-auto" style={{ background: secondary }}></div>
        </ScrollReveal>
      </section>

      {/* LISTA DE SERVIÇOS/MENU COM ANIMAÇÃO */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-12">
            {services.map((item: any, index: number) => (
              <ScrollReveal key={index} delay={index * 150} direction={index % 2 === 0 ? "left" : "right"}>
                <div className="group flex flex-col md:flex-row gap-8 items-center bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
                  
                  {/* Imagem do Prato (com zoom no hover) */}
                  <div className="w-full md:w-1/3 aspect-[4/3] overflow-hidden rounded-xl">
                    <img 
                      src={DISH_IMAGES[index % DISH_IMAGES.length]} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Detalhes do Prato */}
                  <div className="w-full md:w-2/3 flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#221A18] group-hover:text-[#6B1020] transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-lg font-bold" style={{ color: primary }}>
                        {typeof item.price === 'number' ? `${item.price} Kz` : item.price}
                      </span>
                    </div>
                    <div className="w-full border-b border-dotted border-gray-300 mb-4"></div>
                    <p className="text-gray-600 leading-relaxed mb-6">{item.desc || item.description}</p>
                    
                    <div className="mt-auto">
                      {waLink && (
                        <a 
                          href={`${waLink}?text=Olá, gostaria de pedir o prato: ${item.name}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider text-white transition hover:-translate-y-1 shadow-md"
                          style={{ background: primary }}
                        >
                          Pedir pelo WhatsApp <span aria-hidden>→</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 text-center" style={{ background: primary }}>
        <div className="container mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl mb-6 text-white">Pronto para experimentar?</h2>
          <p className="text-white/80 mb-8 text-lg">Faça a sua reserva e venha viver uma experiência inesquecível.</p>
          {waLink && (
            <a 
              href={waLink} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-block px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition hover:-translate-y-1 shadow-xl"
              style={{ background: secondary, color: "#1a1412" }}
            >
              Reservar Mesa Agora
            </a>
          )}
        </div>
      </section>
    </main>
  );
}