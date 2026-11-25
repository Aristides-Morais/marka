import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { detectSector, mergeWithDefaults, type SiteContent } from "../../lib/siteContent";

export default function AboutPage() {
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

  const aboutTitle = content.aboutTitle || `Sobre a ${business.name}`;
  const aboutText = content.aboutText || "Fundado com a paixão de trazer o melhor da gastronomia para Luanda...";
  const mission = content.aboutMission || "Proporcionar momentos inesquecíveis...";
  const vision = content.aboutVision || "Ser reconhecido como referência...";
  const values = content.aboutValues || ["Excelência", "Ingredientes Frescos", "Paixão", "Acolhimento"];
  const stats = content.stats || [
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

      {/* HEADER SIMPLES */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to={`/${slug}`} className="font-serif text-2xl font-bold text-[#221A18]">{business.name}</Link>
          <Link to={`/${slug}`} className="text-sm font-medium uppercase tracking-widest text-gray-600 hover:text-black">← Voltar ao Início</Link>
        </div>
      </header>

      {/* HERO DA PÁGINA */}
      <section className="pt-40 pb-20 px-6 text-center bg-white">
        <div className="container mx-auto max-w-3xl">
          <p className="text-sm font-bold tracking-[0.2em] uppercase mb-4" style={{ color: primary }}>A Nossa História</p>
          <h1 className="font-serif text-5xl md:text-6xl text-[#221A18] leading-tight mb-6">{aboutTitle}</h1>
          <div className="w-24 h-1 mx-auto" style={{ background: secondary }}></div>
        </div>
      </section>

      {/* TEXTO EDITORIAL */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-xl md:text-2xl font-serif italic text-gray-700 mb-8 leading-relaxed">
            "{aboutText.split('.')[0]}."
          </p>
          <p className="text-gray-600 leading-relaxed text-lg">{aboutText}</p>
        </div>
      </section>

      {/* MISSÃO E VISÃO */}
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

      {/* VALORES */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="font-serif text-4xl text-[#221A18] mb-12">Os Nossos Valores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((v: string, i: number) => (
              <div key={i} className="p-6 rounded-xl bg-[#F8F4EF]">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ background: primary }}>
                  {i + 1}
                </div>
                <h4 className="font-bold text-[#221A18]">{v}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESTATÍSTICAS */}
      <section className="py-20 px-6 text-white text-center" style={{ background: primary }}>
        <div className="container mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((s: any, i: number) => (
            <div key={i}>
              <div className="font-serif text-5xl font-bold mb-2">{s.value}</div>
              <div className="text-sm uppercase tracking-widest opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
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