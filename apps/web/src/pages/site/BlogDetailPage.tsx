import { Link, useParams } from "react-router-dom";
import PhotoEffect from "../../components/site/PhotoEffect";
import { BLOG_DATA } from "./BlogPage";

export default function BlogPostPage() {
  const { slug = "", postSlug = "" } = useParams();
  const primary = "#6B1020";
  const secondary = "#9A7634";
  const waLink = "https://wa.me/244923000000";

  // Procura pelo slug da URL: mufete-perfeito, harmonizacao-vinhos, etc.
  const post = BLOG_DATA.find((p) => p.slug === postSlug) || BLOG_DATA[0];

  return (
    <main className="min-h-screen bg-[#F8F4EF] text-[#35232B] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <section className="pt-32 pb-12 px-6 text-center bg-white">
        <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-4" style={{ background: `${secondary}20`, color: secondary }}>{post.category}</span>
        <h1 className="font-serif text-4xl md:text-6xl text-[#221A18] leading-tight max-w-3xl mx-auto mb-4">{post.title}</h1>
        <p className="text-gray-400 text-sm">{post.date} • Alive Restaurante & Lounge</p>
      </section>

      <section className="px-6 pb-16">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-3xl overflow-hidden shadow-lg mb-10">
            <PhotoEffect src={post.image} alt={post.title} className="w-full aspect-[16/9] object-cover" gallery={BLOG_DATA.map((p) => p.image)} />
          </div>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">{post.excerpt}</p>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{post.body}</p>

          <div className="flex gap-3 mt-12">
            <Link to={`/${slug}/blog`} className="px-6 py-3 rounded-full border font-bold text-sm">← Voltar ao Blog</Link>
            <a href={waLink} target="_blank" rel="noreferrer" className="px-6 py-3 rounded-full text-white font-bold text-sm" style={{ background: primary }}>Reservar Mesa</a>
          </div>

          <h3 className="font-serif text-2xl font-bold mt-16 mb-6">Outros artigos</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {BLOG_DATA.filter((p) => p.slug !== post.slug).map((p) => (
              <Link key={p.slug} to={`/${slug}/blog/${p.slug}`} className="bg-white rounded-2xl overflow-hidden border shadow-sm block">
                <img src={p.image} alt={p.title} className="w-full aspect-[16/9] object-cover" />
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: primary }}>{p.category}</p>
                  <p className="font-serif font-bold mt-1 line-clamp-2">{p.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}