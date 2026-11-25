import { Link, useParams } from "react-router-dom";
import SiteHeader from "../../components/site/SiteHeader";

const EVENTS = [
  { title: "Noite de Fado ao Vivo", date: "Todas as Sextas", desc: "Junte-se a nós para uma noite mágica com música ao vivo e um menu especial de tapas.", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80" },
  { title: "Almoço Executivo", date: "Segunda a Sexta, 12h-15h", desc: "Menu completo com entrada, prato principal e bebida por apenas 8.500 Kz.", image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80" },
  { title: "Happy Hour", date: "Terça a Quinta, 18h-20h", desc: "Cocktails a metade do preço e petiscos para partilhar.", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80" },
];

export default function EventsPage() {
  const { slug = "" } = useParams();
  const primary = "#6B1020";
  const secondary = "#9A7634";
  const waLink = "https://wa.me/244923000000";

  return (
    <main className="min-h-screen bg-[#F8F4EF] text-[#35232B] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <SiteHeader businessName="Alive Restaurante & Lounge" primary={primary} secondary={secondary} waLink={waLink} />

      <section className="pt-32 pb-16 px-6 text-center bg-white">
        <p className="text-sm font-bold tracking-[0.2em] uppercase mb-4" style={{ color: primary }}>Agenda</p>
        <h1 className="font-serif text-5xl md:text-7xl text-[#221A18] leading-tight mb-6">Eventos & Promoções</h1>
        <div className="w-24 h-1 mx-auto" style={{ background: secondary }}></div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl space-y-12">
          {EVENTS.map((ev, i) => (
            <div key={i} className="group flex flex-col md:flex-row gap-8 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
              <div className="w-full md:w-1/3 aspect-[4/3] md:aspect-auto overflow-hidden">
                <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
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