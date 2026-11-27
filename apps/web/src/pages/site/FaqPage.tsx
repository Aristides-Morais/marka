import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import SiteHeader from "../../components/site/SiteHeader";

const FAQ_DATA = [
  { q: "É necessário fazer reserva?", a: "Recomendamos vivamente a reserva, especialmente aos fins de semana, para garantir o seu lugar. Pode fazê-lo através do nosso WhatsApp." },
  { q: "Têm opções vegetarianas ou veganas?", a: "Sim, o nosso chef prepara opções deliciosas mediante pedido prévio. Por favor, informe-nos das suas restrições alimentares ao fazer a reserva." },
  { q: "Qual é o horário de funcionamento?", a: "Abrimos de terça a domingo, das 12h às 23h. A cozinha encerra às 22h30." },
  { q: "Fazem eventos privados ou festas de aniversário?", a: "Sim, temos um espaço lounge dedicado para eventos privados e podemos criar menus personalizados para a sua ocasião. Contacte-nos para mais informações." },
  { q: "Há estacionamento no local?", a: "Sim, dispomos de estacionamento privativo e seguro para os nossos clientes, com serviço de valet opcional." },
  { q: "Posso levar crianças?", a: "Com certeza! Temos um ambiente familiar e um menu infantil especialmente pensado para os mais pequenos." },
];

export default function FaqPage() {
  const { slug = "" } = useParams();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const primary = "#6B1020";
  const secondary = "#9A7634";
  const waLink = "https://wa.me/244923000000";
  const businessName = "Alive Restaurante & Lounge";

  const toggleAccordion = (index: number) => setOpenIndex(openIndex === index ? null : index);

  return (
    <main className="min-h-screen bg-[#F8F4EF] text-[#35232B] font-sans">
      <style>{`
            <SiteHeader businessName={business?.name || "Alive"} primary={primary} secondary={secondary} waLink={waLink} businessType={business?.type} />
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <SiteHeader businessName={businessName} primary={primary} secondary={secondary} waLink={waLink} />

      <section className="pt-32 pb-20 px-6 text-center bg-white">
        <p className="text-sm font-bold tracking-[0.2em] uppercase mb-4" style={{ color: primary }}>Dúvidas Frequentes</p>
        <h1 className="font-serif text-5xl md:text-7xl text-[#221A18] leading-tight mb-6">Perguntas & Respostas</h1>
        <div className="w-24 h-1 mx-auto" style={{ background: secondary }}></div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-4">
            {FAQ_DATA.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
                  <button onClick={() => toggleAccordion(index)} className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none group">
                    <h3 className="font-serif text-xl font-bold text-[#221A18] group-hover:text-[#6B1020] transition-colors pr-4">{item.q}</h3>
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300" style={{ background: isOpen ? primary : "#F8F4EF", color: isOpen ? "white" : primary, transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </button>
                  <div className="px-8 overflow-hidden transition-all duration-500 ease-in-out" style={{ maxHeight: isOpen ? "200px" : "0", opacity: isOpen ? 1 : 0 }}>
                    <p className="text-gray-600 leading-relaxed pb-6 pt-2">{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 text-center" style={{ background: primary }}>
        <div className="container mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl mb-6 text-white">Ainda tem dúvidas?</h2>
          <p className="text-white/80 mb-8 text-lg">A nossa equipa está pronta para ajudar.</p>
          <a href={waLink} target="_blank" rel="noreferrer" className="inline-block px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition hover:-translate-y-1 shadow-xl" style={{ background: secondary, color: "#1a1412" }}>
            Falar no WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}