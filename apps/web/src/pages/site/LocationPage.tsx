import { Link, useParams } from "react-router-dom";
import SiteHeader from "../../components/site/SiteHeader";

export default function LocationPage() {
  const { slug = "" } = useParams();
  const primary = "#6B1020";
  const secondary = "#9A7634";
  const businessName = "Alive Restaurante & Lounge";
  const waLink = "https://wa.me/244923000000";
  
  return (
    <main className="min-h-screen bg-[#F8F4EF] text-[#35232B] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
        @keyframes kenburns { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
        .animate-kenburns { animation: kenburns 20s ease-in-out infinite alternate; }
      `}</style>

      <SiteHeader businessName={businessName} primary={primary} secondary={secondary} waLink={waLink} />

      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80" alt="Localização" className="absolute inset-0 w-full h-full object-cover animate-kenburns" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-6">
          <p className="text-sm font-bold tracking-[0.2em] uppercase mb-4 text-white/80">Onde Estamos</p>
          <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight">Venha Visitar-nos</h1>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center text-white text-2xl" style={{ background: primary }}>📍</div>
              <h3 className="font-serif text-2xl mb-2 text-[#221A18]">Endereço</h3>
              <p className="text-gray-600">Rua Principal, nº 123<br />Bairro do Miramar<br />Luanda, Angola</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center text-white text-2xl" style={{ background: primary }}>🕒</div>
              <h3 className="font-serif text-2xl mb-2 text-[#221A18]">Horário</h3>
              <p className="text-gray-600">Terça a Domingo<br />12h00 - 23h00<br />(Fechado à Segunda)</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center text-white text-2xl" style={{ background: primary }}>📞</div>
              <h3 className="font-serif text-2xl mb-2 text-[#221A18]">Contacto</h3>
              <p className="text-gray-600">+244 923 000 000<br />reservas@alive.ao</p>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-[500px]">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15793.26239243537!2d13.2301747!3d-8.8383198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1a51f2a6a3f1d5b7%3A0x6b3c3b3b3b3b3b3b!2sLuanda%2C%20Angola!5e0!3m2!1spt-PT!2sao!4v1620000000000!5m2!1spt-PT!2sao" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </section>
    </main>
  );
}