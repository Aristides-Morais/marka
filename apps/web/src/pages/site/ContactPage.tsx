import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

// Dados hardcoded para garantir funcionamento imediato
const ALIVE_DATA = {
  name: "Alive Restaurante & Lounge",
  phone: "244923000000", // Substitui pelo número real
  address: "Rua Principal, Luanda, Angola",
  mapsUrl: "https://maps.google.com/?q=Luanda,Angola",
  primaryColor: "#6B1020",
  secondaryColor: "#9A7634",
};

export default function ContactPage() {
  const { slug = "" } = useParams();
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });

  // Animação de entrada suave
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const primary = ALIVE_DATA.primaryColor;
  const secondary = ALIVE_DATA.secondaryColor;
  const waLink = `https://wa.me/${ALIVE_DATA.phone}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Cria a mensagem formatada para o WhatsApp
    const text = `Olá, *${ALIVE_DATA.name}*!%0A%0A` +
                 `*Nome:* ${formData.name}%0A` +
                 `*Telefone:* ${formData.phone}%0A` +
                 `*Mensagem:* ${formData.message}`;
                 
    // Abre o WhatsApp com a mensagem
    window.open(`${waLink}?text=${text}`, "_blank");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen bg-[#F8F4EF] text-[#35232B] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
        @keyframes pulse-btn {
          0% { box-shadow: 0 0 0 0 rgba(154, 118, 52, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(154, 118, 52, 0); }
          100% { box-shadow: 0 0 0 0 rgba(154, 118, 52, 0); }
        }
      `}</style>

      {/* HEADER */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to={`/${slug}`} className="font-serif text-2xl font-bold text-[#221A18]">{ALIVE_DATA.name}</Link>
          <Link to={`/${slug}`} className="text-sm font-medium uppercase tracking-widest text-gray-600 hover:text-black">← Voltar ao Início</Link>
        </div>
      </header>

      {/* HERO DA PÁGINA */}
      <section className="pt-40 pb-16 px-6 text-center bg-white">
        <p className="text-sm font-bold tracking-[0.2em] uppercase mb-4" style={{ color: primary }}>Contacte-nos</p>
        <h1 className="font-serif text-5xl md:text-7xl text-[#221A18] leading-tight mb-6">
          Estamos à sua espera
        </h1>
        <div className="w-24 h-1 mx-auto" style={{ background: secondary }}></div>
      </section>

      {/* SECÇÃO PRINCIPAL (Split Screen: Mapa + Formulário) */}
      <section className="py-16 px-6 bg-[#F8F4EF]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            
            {/* LADO ESQUERDO: INFORMAÇÕES E MAPA (Desliza da Esquerda) */}
            <div 
              className="transition-all duration-1000 ease-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateX(0)" : "translateX(-50px)"
              }}
            >
              <h2 className="font-serif text-3xl mb-6 text-[#221A18]">Informações de Contacto</h2>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: primary }}>📍</div>
                  <div>
                    <h4 className="font-bold text-[#221A18]">Endereço</h4>
                    <p className="text-gray-600">{ALIVE_DATA.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: primary }}>📞</div>
                  <div>
                    <h4 className="font-bold text-[#221A18]">Telefone / WhatsApp</h4>
                    <p className="text-gray-600">{ALIVE_DATA.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: primary }}>🕒</div>
                  <div>
                    <h4 className="font-bold text-[#221A18]">Horário</h4>
                    <p className="text-gray-600">Terça a Domingo: 12h - 23h</p>
                  </div>
                </div>
              </div>

              {/* MAPA (Google Maps Embed) */}
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 h-[300px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15793.26239243537!2d13.2301747!3d-8.8383198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1a51f2a6a3f1d5b7%3A0x6b3c3b3b3b3b3b3b!2sLuanda%2C%20Angola!5e0!3m2!1spt-PT!2sao!4v1620000000000!5m2!1spt-PT!2sao"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* LADO DIREITO: FORMULÁRIO (Desliza da Direita) */}
            <div 
              className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 transition-all duration-1000 ease-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateX(0)" : "translateX(50px)",
                transitionDelay: "200ms"
              }}
            >
              <h2 className="font-serif text-3xl mb-2 text-[#221A18]">Envie-nos uma mensagem</h2>
              <p className="text-gray-500 mb-8 text-sm">Preencha o formulário abaixo e entraremos em contacto consigo o mais breve possível.</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
                  <input 
                    type="text" 
                    name="name" 
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition"
                    style={{ focusRingColor: primary }}
                    placeholder="O seu nome" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Telefone / WhatsApp</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition"
                    placeholder="+244 9XX XXX XXX" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mensagem</label>
                  <textarea 
                    name="message" 
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition resize-none"
                    placeholder="Como podemos ajudar?" 
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-white transition hover:-translate-y-1 shadow-lg animate-[pulse-btn_2s_infinite]"
                  style={{ background: secondary }}
                >
                  Enviar para WhatsApp
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}