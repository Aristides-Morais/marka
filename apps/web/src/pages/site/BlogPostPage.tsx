import { Link, useParams } from "react-router-dom";

const BLOG_DATA = [
  {
    title: "A Arte de Preparar um Mufete Perfeito",
    excerpt: "Descubra os segredos do nosso chef para grelhar o peixe na perfeição e o equilíbrio do óleo de palma.",
    date: "15 Nov 2026",
    category: "Gastronomia",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Harmonização de Vinhos com Pratos Angolanos",
    excerpt: "Saiba qual vinho escolher para acompanhar o Calulu ou a Muamba de Galinha.",
    date: "02 Nov 2026",
    category: "Vinhos",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Os Segredos dos Temperos Angolanos",
    excerpt: "Uma viagem pelos sabores que tornam a nossa comida única no mundo.",
    date: "25 Out 2026",
    category: "Cultura",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Como Criar o Ambiente Perfeito para um Jantar",
    excerpt: "Dicas de decoração, iluminação e música para uma noite memorável.",
    date: "10 Out 2026",
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  },
];

export default function BlogPage() {
  const { slug = "" } = useParams();
  const primary = "#6B1020";
  const secondary = "#9A7634";
  const businessName = "Alive Restaurante & Lounge";

  return (
    <main className="min-h-screen bg-[#F8F4EF] text-[#35232B] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to={`/${slug}`} className="font-serif text-2xl font-bold text-[#221A18]">{businessName}</Link>
          <Link to={`/${slug}`} className="text-sm font-medium uppercase tracking-widest text-gray-600 hover:text-black">← Voltar ao Início</Link>
        </div>
      </header>

      <section className="pt-40 pb-20 px-6 text-center bg-white">
        <p className="text-sm font-bold tracking-[0.2em] uppercase mb-4" style={{ color: primary }}>O Nosso Blog</p>
        <h1 className="font-serif text-5xl md:text-7xl text-[#221A18] leading-tight mb-6">Histórias & Sabores</h1>
        <div className="w-24 h-1 mx-auto" style={{ background: secondary }}></div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          
          {/* Artigo de Destaque */}
          <div className="mb-16 group cursor-pointer">
            <Link to={`/${slug}/blog/mufete-perfeito`} className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 transition hover:shadow-2xl">
              <div className="aspect-[4/3] md:aspect-auto md:h-full overflow-hidden">
                <img src={BLOG_DATA[0].image} alt={BLOG_DATA[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-8 md:p-12">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block" style={{ background: `${secondary}20`, color: secondary }}>{BLOG_DATA[0].category}</span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#221A18] mb-4 group-hover:text-[#6B1020] transition-colors">{BLOG_DATA[0].title}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{BLOG_DATA[0].excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{BLOG_DATA[0].date}</span>
                  <span className="font-bold uppercase tracking-widest" style={{ color: primary }}>Ler Artigo →</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Grelha de Outros Artigos */}
          <div className="grid md:grid-cols-3 gap-8">
            {BLOG_DATA.slice(1).map((post, index) => (
              <div key={index} className="group cursor-pointer">
                <Link to={`/${slug}/blog/post-${index}`} className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition hover:-translate-y-2 hover:shadow-xl h-full flex flex-col">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-70" style={{ color: primary }}>{post.category}</span>
                    <h3 className="font-serif text-xl font-bold text-[#221A18] mb-3 group-hover:text-[#6B1020] transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 flex-grow line-clamp-3">{post.excerpt}</p>
                    <div className="text-xs text-gray-400 border-t border-gray-100 pt-4 mt-auto">{post.date}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>
    </main>
  );
}