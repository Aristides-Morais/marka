import { Link, useParams } from "react-router-dom";
import WhatsAppFloat from "./WhatsAppFloat";

type Props = {
  businessName: string;
  primary: string;
  secondary: string;
  waLink: string | null;
  businessType?: string;
};

export default function SiteHeader({ businessName, primary, secondary, waLink, businessType = "restaurante" }: Props) {
  const { slug = "" } = useParams();
  const phoneNumber = waLink ? waLink.split("/").pop()?.split("?")[0] || "" : "";

  const type = (businessType || "").toLowerCase();

  // Define os links permitidos por tipo de negócio
  const getLinks = () => {
    // RESTAURANTE
    if (type.includes("restaurante") || type.includes("bar") || type.includes("cafe") || type.includes("padaria")) {
      return [
        { to: `/${slug}/sobre`, label: "Sobre" },
        { to: `/${slug}/servicos`, label: "Menu" },
        { to: `/${slug}/galeria`, label: "Galeria" },
        { to: `/${slug}/eventos`, label: "Eventos" },
        { to: `/${slug}/blog`, label: "Blog" },
        { to: `/${slug}/localizacao`, label: "Localização" },
        { to: `/${slug}/contactos`, label: "Contactos" },
        { to: `/${slug}/takeaway`, label: "Takeaway", highlight: true },
      ];
    }
    // SALÃO DE BELEZA
    if (type.includes("salao") || type.includes("barbearia") || type.includes("beleza") || type.includes("unhas") || type.includes("estetica")) {
      return [
        { to: `/${slug}/sobre`, label: "Sobre" },
        { to: `/${slug}/servicos`, label: "Serviços" },
        { to: `/${slug}/galeria`, label: "Galeria" },
        { to: `/${slug}/depoimentos`, label: "Depoimentos" },
        { to: `/${slug}/contactos`, label: "Contactos" },
      ];
    }
    // CLÍNICA
    if (type.includes("clinica") || type.includes("dentista") || type.includes("saude") || type.includes("consultorio")) {
      return [
        { to: `/${slug}/sobre`, label: "Sobre" },
        { to: `/${slug}/servicos`, label: "Especialidades" },
        { to: `/${slug}/faq`, label: "FAQ" },
        { to: `/${slug}/localizacao`, label: "Localização" },
        { to: `/${slug}/contactos`, label: "Contactos" },
      ];
    }
    // LOJA / BOUTIQUE
    if (type.includes("loja") || type.includes("boutique") || type.includes("comercio")) {
      return [
        { to: `/${slug}/sobre`, label: "Sobre" },
        { to: `/${slug}/servicos`, label: "Produtos" },
        { to: `/${slug}/galeria`, label: "Colecção" },
        { to: `/${slug}/contactos`, label: "Contactos" },
      ];
    }
    // TATUADOR
    if (type.includes("tatuagem") || type.includes("tatuador")) {
      return [
        { to: `/${slug}/sobre`, label: "Sobre" },
        { to: `/${slug}/servicos`, label: "Portfólio" },
        { to: `/${slug}/galeria`, label: "Galeria" },
        { to: `/${slug}/contactos`, label: "Contactos" },
      ];
    }
    // ORTODONTIA
    if (type.includes("ortodontia") || type.includes("placas")) {
      return [
        { to: `/${slug}/sobre`, label: "Sobre" },
        { to: `/${slug}/servicos`, label: "Tratamentos" },
        { to: `/${slug}/faq`, label: "FAQ" },
        { to: `/${slug}/contactos`, label: "Contactos" },
      ];
    }

    // DEFAULT
    return [
      { to: `/${slug}/sobre`, label: "Sobre" },
      { to: `/${slug}/servicos`, label: "Serviços" },
      { to: `/${slug}/galeria`, label: "Galeria" },
      { to: `/${slug}/contactos`, label: "Contactos" },
    ];
  };

  const links = getLinks();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm py-3">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/${slug}`} className="text-xs font-medium uppercase tracking-widest text-gray-500 hover:text-black transition" title="Voltar ao Início">
              ← Início
            </Link>
            <Link to={`/${slug}`} className="font-serif text-xl font-bold text-[#221A18] truncate max-w-[180px]">
              {businessName}
            </Link>
          </div>
          
          <nav className="hidden xl:flex items-center gap-4 text-[10px] xl:text-xs font-medium uppercase tracking-widest">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={link.highlight ? "px-3 py-1.5 rounded-full font-bold transition hover:scale-105" : "hover:opacity-70 transition"}
                style={link.highlight ? { background: secondary, color: "#1a1412" } : {}}
              >
                {link.label}
              </Link>
            ))}
            {waLink && (
              <a href={waLink} target="_blank" rel="noreferrer" className="ml-2 px-4 py-2 rounded-full font-bold text-black transition hover:scale-105 text-[10px] xl:text-xs" style={{ background: secondary }}>
                Reservar
              </a>
            )}
          </nav>

          <div className="xl:hidden flex items-center gap-2">
            {links.find(l => l.label === "Takeaway") && (
              <Link to={`/${slug}/takeaway`} className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-full text-white" style={{ background: secondary }}>
                Takeaway
              </Link>
            )}
            <Link to={`/${slug}/contactos`} className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-full text-white" style={{ background: primary }}>
              Menu
            </Link>
          </div>
        </div>
      </header>

      {phoneNumber && <WhatsAppFloat phone={phoneNumber} message={`Olá! Vi o site do ${businessName} e gostaria de mais informações.`} />}
    </>
  );
}