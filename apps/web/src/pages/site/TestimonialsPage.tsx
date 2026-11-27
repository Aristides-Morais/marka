import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SiteHeader from "../../components/site/SiteHeader";

const ALIVE_DATA = {
  name: "Alive Restaurante & Lounge",
  primaryColor: "#6B1020",
  secondaryColor: "#9A7634",
  phone: "244923000000",
  testimonials: [
    { name: "Maria Fernandes", text: "O melhor Mufete de Luanda! O ambiente é super elegante e o atendimento é de outro mundo. Recomendo vivamente para jantares especiais.", role: "Cliente Fiel", rating: 5, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
    { name: "Carlos Andrade", text: "Festejei o meu aniversário aqui e superou todas as expectativas. O cocktail de maracujá é divinal e a equipa é super atenciosa.", role: "Cliente", rating: 5, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
    { name: "Ana Rita", text: "Atenção aos detalhes no prato e no serviço. Voltarei com certeza para experimentar o novo menu de autor!", role: "Food Blogger", rating: 5, image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" },
    { name: "João Silva", text: "Ambiente sofisticado, pratos deliciosos e um serviço impecável. O Alive tornou-se o meu restaurante favorito em Luanda.", role: "Empresário", rating: 5, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
    { name: "Sofia Costa", text: "Vim com amigas para celebrar e fomos super bem recebidas. O risoto de marisco estava simplesmente perfeito.", role: "Cliente", rating: 5, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
    { name: "Pedro Santos", text: "O Bife à Casa com Batata Trufada é uma experiência gastronómica única. Recomendo a 100%.", role: "Cliente Frequente", rating: 5, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80" },
  ]
};

function ScrollReveal({ children, delay = 0 }: any) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="transition-all duration-1000 ease-out" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(40px)", transitionDelay: `${delay}ms` }}>{children}</div>;
}

export default function TestimonialsPage() {
  const { slug = "" } = useParams();
  const business = ALIVE_DATA;
  const primary = ALIVE_DATA.primaryColor;
  const secondary = ALIVE_DATA.secondaryColor;
  const waLink = `https://wa.me/${ALIVE_DATA.phone}`;

  return (
    <main className="min-h-screen bg-[#F8F4EF] text-[#35232B] font-sans">
      <style>{`
            <SiteHeader businessName={business?.name || "Alive"} primary={primary} secondary={secondary} waLink={waLink} businessType={business?.type} />
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <SiteHeader businessName={business.name} primary={primary} secondary={secondary} waLink={waLink} />

      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, #1a1412 0%, ${primary} 100%)` }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
        <div className="relative z-10">
          <p className="text-sm font-bold tracking-[0.2em] uppercase mb-4 text-white/80">O Que Dizem de Nós</p>
          <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight mb-6">Histórias de Sucesso</h1>
          <div className="w-24 h-1 mx-auto" style={{ background: secondary }}></div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#F8F4EF] relative -mt-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {business.testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-full flex flex-col relative group hover:-translate-y-2 transition-transform duration-500">
                  <div className="absolute -top-6 -right-2 text-8xl font-serif leading-none opacity-10 group-hover:opacity-20 transition-opacity" style={{ color: primary }}>"</div>
                  <div className="flex gap-1 mb-6 relative z-10">
                    {[...Array(t.rating)].map((_, s) => (
                      <svg key={s} className="w-5 h-5" fill={secondary} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-gray-600 italic mb-8 relative z-10 flex-grow leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-4 relative z-10 border-t border-gray-100 pt-6">
                    <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                    <div>
                      <h4 className="font-bold text-[#221A18]">{t.name}</h4>
                      <span className="text-xs uppercase tracking-wider text-gray-400">{t.role}</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 text-center" style={{ background: primary }}>
        <div className="container mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl mb-6 text-white">Quer ser o próximo a viver esta experiência?</h2>
          <p className="text-white/80 mb-8 text-lg">Junte-se aos nossos clientes satisfeitos. Reserve a sua mesa hoje.</p>
          <a href={waLink} target="_blank" rel="noreferrer" className="inline-block px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition hover:-translate-y-1 shadow-xl" style={{ background: secondary, color: "#1a1412" }}>
            Reservar Mesa Agora
          </a>
        </div>
      </section>
    </main>
  );
}