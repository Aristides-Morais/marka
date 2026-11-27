import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { detectSector, mergeWithDefaults, type SiteContent } from "../../lib/siteContent";
import SiteHeader from "../../components/site/SiteHeader";
import PhotoEffect from "../../components/site/PhotoEffect";

type EventItem = {
  title: string;
  date: string;
  desc: string;
  image: string;
};

export default function EventsPage() {
  const { slug = "" } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [content, setContent] = useState<SiteContent>({});
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
  const waLink = `https://wa.me/${(business.phone || "").replace(/\D/g, "")}`;

  const defaultEvents: EventItem[] = [
    { title: "Noite de Fado ao Vivo", date: "Todas as Sextas", desc: "Junte-se a nós para uma noite mágica com música ao vivo e um menu especial de tapas.", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80" },
    { title: "Almoço Executivo", date: "Segunda a Sexta, 12h-15h", desc: "Menu completo com entrada, prato principal e bebida por apenas 8.500 Kz.", image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80" },
  ];

  const events: EventItem[] = Array.isArray((content as any).events) && (content as any).events.length > 0
    ? ((content as any).events as EventItem[])
    : defaultEvents;

  return (
    <main className="min-h-screen bg-[#F8F4EF] text-[#35232B] font-sans">
      <SiteHeader businessName={business?.name || "Alive"} primary={primary} secondary={secondary} waLink={waLink} businessType={business?.type} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <section className="pt-32 pb-16 px-6 text-center bg-white">
        <p className="text-sm font-bold tracking-[0.2em] uppercase mb-4" style={{ color: primary }}>Agenda</p>
        <h1 className="font-serif text-5xl md:text-7xl text-[#221A18] leading-tight mb-6">Eventos & Promoções</h1>
        <div className="w-24 h-1 mx-auto" style={{ background: secondary }}></div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl space-y-12">
          {events.map((ev, i) => (
            <div key={i} className="group flex flex-col md:flex-row gap-8 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
              <div className="w-full md:w-1/3 aspect-[4/3] md:aspect-auto overflow-hidden">
                <PhotoEffect src={ev.image} alt={ev.title} className="w-full h-full object-cover" gallery={events.map(e => e.image)} />
              </div>
              <div className="p-8 flex-1 flex flex-col justify-center">
                <span className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: secondary }}>{ev.date}</span>
                <h2 className="font-serif text-3xl font-bold mb-4 text-[#221A18] group-hover:text-[#6B1020] transition-colors">{ev.title}</h2>
                <p className="text-gray-600 leading-relaxed mb-6">{ev.desc}</p>
                <a href={waLink} target="_blank" rel="noreferrer" className="inline-block px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider text-white self-start transition hover:-translate-y-1" style={{ background: primary }}>
                  Reservar para este evento
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}