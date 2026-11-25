import { useState } from "react";
import { Link, useParams } from "react-router-dom";

// Dados hardcoded para garantir que abre instantaneamente
const ALIVE_DATA = {
  name: "Alive Restaurante & Lounge",
  phone: "244923000000",
  primaryColor: "#6B1020",
  secondaryColor: "#9A7634",
};

export default function ClientPage() {
  const { slug = "" } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    notes: "",
  });

  const primary = ALIVE_DATA.primaryColor;
  const secondary = ALIVE_DATA.secondaryColor;
  const waLink = `https://wa.me/${ALIVE_DATA.phone}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Cria a mensagem formatada para o WhatsApp
    const text = `Olá, *${ALIVE_DATA.name}*!%0A%0A` +
                 `Gostaria de fazer uma reserva:%0A%0A` +
                 `*Nome:* ${formData.name}%0A` +
                 `*Telefone:* ${formData.phone}%0A` +
                 `*Data:* ${formData.date}%0A` +
                 `*Hora:* ${formData.time}%0A` +
                 `*Pessoas:* ${formData.guests}%0A` +
                 (formData.notes ? `*Observações:* ${formData.notes}` : "");
                 
    // Abre o WhatsApp com a mensagem
    window.open(`${waLink}?text=${text}`, "_blank");
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#F8F4EF]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* LADO ESQUERDO: IMAGEM E BRANDING */}
      <div className="relative w-full md:w-1/2 h-[40vh] md:h-screen flex flex-col justify-between p-8 md:p-16 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80" 
          alt="Restaurante" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10">
          <Link to={`/${slug}`} className="font-serif text-2xl font-bold text-white hover:opacity-80 transition">
            {ALIVE_DATA.name}
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight mb-4">
            Reserve o seu <br/>momento.
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Garanta o seu lugar e prepare-se para uma experiência gastronómica inesquecível.
          </p>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-[#221A18] mb-2">Faça a sua Reserva</h2>
            <p className="text-gray-500 text-sm">Preencha os dados abaixo e envie-nos uma mensagem via WhatsApp.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo *</label>
              <input 
                type="text" 
                name="name" 
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition"
                placeholder="O seu nome" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Telefone *</label>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Data *</label>
                <input 
                  type="date" 
                  name="date" 
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Hora *</label>
                <input 
                  type="time" 
                  name="time" 
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Número de Pessoas *</label>
              <select 
                name="guests" 
                value={formData.guests}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition bg-white"
              >
                <option value="1">1 Pessoa</option>
                <option value="2">2 Pessoas</option>
                <option value="3">3 Pessoas</option>
                <option value="4">4 Pessoas</option>
                <option value="5">5 Pessoas</option>
                <option value="6">6 Pessoas</option>
                <option value="7+">Mais de 6 Pessoas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Observações (Opcional)</label>
              <textarea 
                name="notes" 
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition resize-none"
                placeholder="Alguma restrição alimentar ou pedido especial?" 
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-white transition hover:-translate-y-1 shadow-lg mt-4"
              style={{ background: primary }}
            >
              Confirmar via WhatsApp
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to={`/${slug}`} className="text-sm text-gray-500 hover:text-black transition">
              ← Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}