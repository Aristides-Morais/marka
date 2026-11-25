import { Link, useParams } from "react-router-dom";

type Props = {
  businessName: string;
  primary: string;
  secondary: string;
  waLink: string | null;
};

export default function SiteHeader({ businessName, primary, secondary, waLink }: Props) {
  const { slug = "" } = useParams();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm py-3">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to={`/${slug}`} className="font-serif text-xl font-bold text-[#221A18] truncate max-w-[200px]">
          {businessName}
        </Link>
        
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium uppercase tracking-widest">
          <Link to={`/${slug}/sobre`} className="hover:opacity-70 transition">Sobre</Link>
          <Link to={`/${slug}/servicos`} className="hover:opacity-70 transition">Menu</Link>
          <Link to={`/${slug}/galeria`} className="hover:opacity-70 transition">Galeria</Link>
          <Link to={`/${slug}/depoimentos`} className="hover:opacity-70 transition">Depoimentos</Link>
          <Link to={`/${slug}/faq`} className="hover:opacity-70 transition">FAQ</Link>
          <Link to={`/${slug}/blog`} className="hover:opacity-70 transition">Blog</Link>
          <Link to={`/${slug}/localizacao`} className="hover:opacity-70 transition">Localização</Link>
          <Link to={`/${slug}/contactos`} className="hover:opacity-70 transition">Contactos</Link>
          
          {waLink && (
            <a href={waLink} target="_blank" rel="noreferrer" className="ml-2 px-5 py-2 rounded-full font-bold text-black transition hover:scale-105" style={{ background: secondary }}>
              Reservar
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}