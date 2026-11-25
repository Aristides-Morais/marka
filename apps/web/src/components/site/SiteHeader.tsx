import { Link, useParams } from "react-router-dom";
import WhatsAppFloat from "./WhatsAppFloat";

type Props = {
  businessName: string;
  primary: string;
  secondary: string;
  waLink: string | null;
};

export default function SiteHeader({ businessName, primary, secondary, waLink }: Props) {
  const { slug = "" } = useParams();
  const phoneNumber = waLink ? waLink.split("/").pop()?.split("?")[0] || "" : "";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm py-3">
        <div className="container mx-auto px-6 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <Link 
              to={`/${slug}`} 
              className="text-xs font-medium uppercase tracking-widest text-gray-500 hover:text-black transition"
              title="Voltar ao Início"
            >
              ← Início
            </Link>
            <Link to={`/${slug}`} className="font-serif text-xl font-bold text-[#221A18] truncate max-w-[180px]">
              {businessName}
            </Link>
          </div>
          
          <nav className="hidden lg:flex items-center gap-4 text-[10px] xl:text-xs font-medium uppercase tracking-widest">
            <Link to={`/${slug}/sobre`} className="hover:opacity-70 transition">Sobre</Link>
            <Link to={`/${slug}/servicos`} className="hover:opacity-70 transition">Menu</Link>
            <Link to={`/${slug}/galeria`} className="hover:opacity-70 transition">Galeria</Link>
            <Link to={`/${slug}/depoimentos`} className="hover:opacity-70 transition">Depoimentos</Link>
            <Link to={`/${slug}/faq`} className="hover:opacity-70 transition">FAQ</Link>
            <Link to={`/${slug}/blog`} className="hover:opacity-70 transition">Blog</Link>
            <Link to={`/${slug}/localizacao`} className="hover:opacity-70 transition">Localização</Link>
            <Link to={`/${slug}/contactos`} className="hover:opacity-70 transition">Contactos</Link>
            
            {waLink && (
              <a href={waLink} target="_blank" rel="noreferrer" className="ml-2 px-4 py-2 rounded-full font-bold text-black transition hover:scale-105 text-[10px] xl:text-xs" style={{ background: secondary }}>
                Reservar
              </a>
            )}
          </nav>

          <div className="lg:hidden">
            <Link to={`/${slug}/contactos`} className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full text-white" style={{ background: primary }}>
              Menu
            </Link>
          </div>
        </div>
      </header>

      {phoneNumber && (
        <WhatsAppFloat 
          phone={phoneNumber} 
          message={`Olá! Vi o site do ${businessName} e gostaria de mais informações.`} 
        />
      )}
    </>
  );
}