import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SiteHeader from "../../components/site/SiteHeader";

export default function AboutPage() {
  const { slug = "" } = useParams();
  const businessName = "Alive Restaurante & Lounge";
  const primary = "#6B1020";
  const secondary = "#9A7634";
  const waLink = "https://wa.me/244923000000";

  const aboutTitle = "A Nossa Paixão pela Alta Cozinha";
  const aboutText = "Fundado em 2018, o Restaurante Alive nasceu do sonho de trazer para Luanda uma fusão perfeita entre a tradição angolana e as técnicas culinárias mais modernas do mundo. A nossa cozinha é liderada pelo Chef João Silva, que combina ingredientes locais frescos com um toque de sofisticação internacional.";
  const mission = "Proporcionar momentos inesquecíveis através da gastronomia, oferecendo um serviço impecável e pratos que celebram a cultura e o sabor.";
  const vision = "Ser reconhecido como o destino gastronómico número um de Luanda, elevando a experiência culinária angolana a padrões internacionais.";
  const values = ["Excelência no Serviço", "Ingredientes Frescos", "Paixão pela Cozinha", "Ambiente Acolhedor"];
  const stats = [
    { label: "Anos de Experiência", value: "10+" },
    { label: "Clientes Satisfeitos", value: "5k+" },
    { label: "Pratos no Menu", value: "45" },
  ];

  return (
    <main className="min-h-screen bg-[#F8F4EF] text-[#35232B] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <SiteHeader businessName={businessName} primary={primary} secondary={secondary} waLink={waLink} />

      <section className="pt-32 pb-20 px-6 text-center bg-white">
        <div className="container mx-auto max-w-3xl">
          <p className="text-sm font-bold tracking-[0.2em] uppercase mb-4" style={{ color: primary }}>A Nossa História</p>
          <h1 className="font-serif text-5xl md:text-6xl text-[#221A18] leading-tight mb-6">{aboutTitle}</h1>
          <div className="w-24 h-1 mx-auto" style={{ background: secondary }}></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-xl md:text-2xl font-serif italic text-gray-700 mb-8 leading-relaxed">"{aboutText.split('.')[0]}."</p>
          <p className="text-gray-600 leading-relaxed text-lg">{aboutText}</p>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#F8F4EF]">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-2xl shadow-sm border-t-4" style={{ borderColor: primary }}>
            <h3 className="font-serif text-2xl font-bold mb-4 text-[#221A18]">A Nossa Missão</h3>
            <p className="text-gray-600 leading-relaxed">{mission}</p>
          </div>
          <div className="bg-white p-10 rounded-2xl shadow-sm border-t-4" style={{ borderColor: secondary }}>
            <h3 className="font-serif text-2xl font-bold mb-4 text-[#221A18]">A Nossa Visão</h3>
            <p className="text-gray-600 leading-relaxed">{vision}</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="font-serif text-4xl text-[#221A18] mb-12">Os Nossos Valores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="p-6 rounded-xl bg-[#F8F4EF]">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ background: primary }}>{i + 1}</div>
                <h4 className="font-bold text-[#221A18]">{v}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 text-white text-center" style={{ background: primary }}>
        <div className="container mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="font-serif text-5xl font-bold mb-2">{s.value}</div>
              <div className="text-sm uppercase tracking-widest opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-[#F8F4EF] text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl mb-6 text-[#221A18]">Pronto para nos conhecer?</h2>
          <p className="text-gray-600 mb-8">Venha viver a experiência que temos preparada para si.</p>
          <Link to={`/${slug}/contactos`} className="inline-block px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm text-white transition hover:-translate-y-1 shadow-lg" style={{ background: primary }}>
            Contacte-nos
          </Link>
        </div>
      </section>
    </main>
  );
}