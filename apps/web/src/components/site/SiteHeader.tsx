import { useState } from "react";
import { Link, useParams } from "react-router-dom";

type Props = { businessName: string; primary: string; secondary: string; waLink: string | null; businessType?: string; business?: any };

export default function SiteHeader({ businessName, primary, waLink }: Props) {
  const { slug = "" } = useParams();
  const [open, setOpen] = useState(false);
  const links = [
    { to: `/${slug}`, label: "Início" },
    { to: `/${slug}/sobre`, label: "Sobre" },
    { to: `/${slug}/cardapio`, label: "Cardápio Digital" },
    { to: `/${slug}/galeria`, label: "Galeria" },
    { to: `/${slug}/eventos`, label: "Eventos" },
    { to: `/${slug}/blog`, label: "Blog" },
    { to: `/${slug}/contactos`, label: "Contactos" },
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-[90]">
      <div className="mx-3 md:mx-6 mt-3">
        <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl px-4 py-3 flex items-center justify-between border border-black/5">
          <Link to={`/${slug}`} className="font-serif font-bold text-xl" style={{ color: primary }}>{businessName}</Link>
          <nav className="hidden md:flex items-center gap-1 bg-[#F8F4EF] rounded-full p-1">
            {links.map((l) => (<Link key={l.to} to={l.to} className="px-3 py-2 rounded-full text-[13px] font-bold hover:bg-white hover:shadow transition">{l.label}</Link>))}
            <Link to={`/${slug}/contactos`} className="ml-1 px-4 py-2 rounded-full text-white text-[13px] font-bold" style={{ background: primary }}>Contactar</Link>
          </nav>
          <button onClick={() => setOpen(!open)} className="md:hidden w-11 h-11 rounded-full bg-black text-white text-xl leading-none" aria-label="Menu">⋯</button>
        </div>
        {open && (
          <div className="md:hidden mt-2 bg-white rounded-2xl shadow-2xl p-3">
            {links.map((l) => (<Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl font-bold text-[15px] hover:bg-[#F8F4EF]">{l.label}</Link>))}
          </div>
        )}
      </div>
    </header>
  );
}