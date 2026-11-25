import { Link, useParams } from "react-router-dom";
import ParallaxImage from "../../components/site/motion/ParallaxImage";

// Imagens de alta qualidade para a galeria
const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80",
];

export default function GalleryPage() {
  const { slug = "" } = useParams();
  const businessName = "Alive Restaurante & Lounge";
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

      {/* HEADER */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to={`/${slug}`} className="font-serif text-2xl font-bold text-[#221A18]">{businessName}</Link>
          <Link to={`/${slug}`} className="text-sm font-medium uppercase tracking-widest text-gray-600 hover:text-black">← Voltar ao Início</Link>
        </div>
      </header>

      {/* HERO DA GALERIA */}
      <section className="pt-40 pb-16 px-6 text-center bg-white relative overflow-hidden">
        <p className="text-sm font-bold tracking-[0.2em] uppercase mb-4" style={{ color: primary }}>Galeria Visual</p>
        <h1 className="font-serif text-5xl md:text-7xl text-[#221A18] leading-tight mb-6">
          Momentos Inesquecíveis
        </h1>
        <div className="w-24 h-1 mx-auto" style={{ background: secondary }}></div>
      </section>

      {/* GRELHA MASONRY COM PARALLAX */}
      <section className="py-20 px-6 bg-[#F8F4EF]">
        <div className="container mx-auto max-w-7xl">
          
          {/* Layout Masonry (Grelha Assimétrica) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Coluna 1 */}
            <div className="space-y-6 md:space-y-8">
              <ParallaxImage src={GALLERY_IMAGES[0]} alt="Momento 1" className="h-[400px] rounded-2xl shadow-xl" speed={0.05} />
              <ParallaxImage src={GALLERY_IMAGES[3]} alt="Momento 4" className="h-[600px] rounded-2xl shadow-xl" speed={0.08} />
            </div>

            {/* Coluna 2 (Afastada para baixo para criar o efeito Masonry) */}
            <div className="space-y-6 md:space-y-8 md:mt-16">
              <ParallaxImage src={GALLERY_IMAGES[1]} alt="Momento 2" className="h-[500px] rounded-2xl shadow-xl" speed={0.06} />
              <ParallaxImage src={GALLERY_IMAGES[4]} alt="Momento 5" className="h-[350px] rounded-2xl shadow-xl" speed={0.04} />
              <ParallaxImage src={GALLERY_IMAGES[6]} alt="Momento 7" className="h-[450px] rounded-2xl shadow-xl" speed={0.07} />
            </div>

            {/* Coluna 3 */}
            <div className="space-y-6 md:space-y-8">
              <ParallaxImage src={GALLERY_IMAGES[2]} alt="Momento 3" className="h-[550px] rounded-2xl shadow-xl" speed={0.05} />
              <ParallaxImage src={GALLERY_IMAGES[5]} alt="Momento 6" className="h-[450px] rounded-2xl shadow-xl" speed={0.08} />
              <ParallaxImage src={GALLERY_IMAGES[7]} alt="Momento 8" className="h-[400px] rounded-2xl shadow-xl" speed={0.06} />
            </div>

          </div>

        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 text-center" style={{ background: primary }}>
        <div className="container mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl mb-6 text-white">Ficou com água na boca?</h2>
          <p className="text-white/80 mb-8 text-lg">Visite-nos e viva a experiência que os nossos clientes adoram.</p>
          <a 
            href={waLink} 
            target="_blank" 
            rel="noreferrer" 
            className="inline-block px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition hover:-translate-y-1 shadow-xl"
            style={{ background: secondary, color: "#1a1412" }}
          >
            Reservar Mesa Agora
          </a>
        </div>
      </section>
    </main>
  );
}