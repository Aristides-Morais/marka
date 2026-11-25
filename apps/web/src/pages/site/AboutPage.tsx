import { Link, useParams } from "react-router-dom";
import { usePublicSite } from "./usePublicSite";
import SiteLayout, { PageHero } from "./SiteLayout";

export default function AboutPage() {
  const { business, content, loading, primary, secondary } = usePublicSite();
  const { slug = "" } = useParams();

  if (loading || !business) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#f8f5f0]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Usa os valores de fallback do siteContent.ts
  const aboutTitle = content.aboutTitle || "A Nossa Paixão pela Alta Cozinha";
  const aboutText = content.aboutText || "Fundado em 2018...";
  const mission = content.aboutMission || "Proporcionar momentos inesquecíveis...";
  const vision = content.aboutVision || "Ser reconhecido como o destino gastronómico...";
  const values = content.aboutValues || ["Excelência no Serviço", "Ingredientes Frescos", "Paixão pela Cozinha", "Ambiente Acolhedor"];
  const stats = content.stats || [
    { label: "Anos de Experiência", value: "10+" },
    { label: "Clientes Satisfeitos", value: "5k+" },
    { label: "Pratos no Menu", value: "45" },
  ];

  return (
    <SiteLayout
      business={business}
      content={content}
      primary={primary}
      secondary={secondary}
      title={`Sobre Nós | ${business.name}`}
    >
      {/* HERO DA PÁGINA SOBRE */}
      <PageHero
        kicker="A Nossa História"
        title={aboutTitle}
        subtitle="Conheça a paixão e a dedicação que colocamos em cada detalhe."
        primary={primary}
      />

      {/* SECÇÃO DE TEXTO EDITORIAL */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed text-center">
            <p className="text-xl md:text-2xl text-gray-800 font-serif mb-8 italic">
              "{aboutText.split('.')[0]}."
            </p>
            <p>{aboutText}</p>
          </div>
        </div>
      </section>

      {/* MISSÃO E VISÃO */}
      <section className="py-24 px-6 bg-[#F8F4EF]">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-12">
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

      {/* VALORES */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-[#221A18]">Os Nossos Valores</h2>
            <div className="w-16 h-1 mx-auto mt-4" style={{ background: secondary }}></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <div key={idx} className="text-center p-6 rounded-xl hover:bg-gray-50 transition">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ background: primary }}>
                  {idx + 1}
                </div>
                <h4 className="font-bold text-[#221A18]">{value}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NÚMEROS (ESTATÍSTICAS) */}
      <section className="py-20 px-6 text-white text-center" style={{ background: primary }}>
        <div className="container mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <div className="font-serif text-5xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm uppercase tracking-widest opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 bg-[#F8F4EF] text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl mb-6 text-[#221A18]">Pronto para nos conhecer?</h2>
          <p className="text-gray-600 mb-8">Venha viver a experiência que temos preparada para si.</p>
          <Link
            to={`/${slug}/contactos`}
            className="inline-block px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm text-white transition hover:-translate-y-1 shadow-lg"
            style={{ background: primary }}
          >
            Contacte-nos
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}