import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

type ServiceItem = {
  name: string;
  desc: string;
  price: string;
};

type SiteContent = {
  heroTitle?: string;
  heroSubtitle?: string;
  aboutTitle?: string;
  aboutText?: string;
  servicesTitle?: string;
  services?: ServiceItem[];
  gallery?: string[];
  contactTitle?: string;
  visualIdentity?: Record<string, string>;
};

export default function TenantSiteContentPage() {
  const { slug = "" } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<SiteContent>({});
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch<any>("/api/v1/site-content", { tenant: slug });
        if (res && res.content) setContent(res.content);
        if (res && res.isPublished) setIsPublished(res.isPublished);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContent({ ...content, [e.target.name]: e.target.value });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContent({ ...content, visualIdentity: { ...content.visualIdentity, [name]: value } });
  };

  const handleServiceChange = (index: number, field: keyof ServiceItem, value: string) => {
    const updatedServices = [...(content.services || [])];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setContent({ ...content, services: updatedServices });
  };

  const addService = () => {
    setContent({ 
      ...content, 
      services: [...(content.services || []), { name: "Novo Prato", desc: "Descrição do prato...", price: "0 Kz" }] 
    });
  };

  const removeService = (index: number) => {
    const updatedServices = [...(content.services || [])];
    updatedServices.splice(index, 1);
    setContent({ ...content, services: updatedServices });
  };

  const handleGalleryChange = (index: number, value: string) => {
    const updatedGallery = [...(content.gallery || [])];
    updatedGallery[index] = value;
    setContent({ ...content, gallery: updatedGallery });
  };

  const addGalleryImage = () => {
    setContent({ ...content, gallery: [...(content.gallery || []), ""] });
  };

  const removeGalleryImage = (index: number) => {
    const updatedGallery = [...(content.gallery || [])];
    updatedGallery.splice(index, 1);
    setContent({ ...content, gallery: updatedGallery });
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await apiFetch(`/api/v1/site-content/draft`, {
        method: "PUT",
        tenant: slug,
        body: JSON.stringify({ content }),
      });
      alert("Rascunho guardado com sucesso!");
    } catch (e) {
      alert("Erro ao guardar rascunho.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm("Tem a certeza que quer publicar estas alterações? Elas ficarão visíveis no site.")) return;
    setSaving(true);
    try {
      await apiFetch(`/api/v1/site-content/publish`, {
        method: "POST",
        tenant: slug,
      });
      setIsPublished(true);
      alert("Website publicado com sucesso!");
    } catch (e) {
      alert("Erro ao publicar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen grid place-items-center">A carregar painel...</div>;

  const primary = content.visualIdentity?.primaryColor || "#6B1020";
  const secondary = content.visualIdentity?.secondaryColor || "#9A7634";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row font-sans text-gray-800">
      
      {/* COLUNA ESQUERDA: FORMULÁRIO DE EDIÇÃO */}
      <div className="w-full lg:w-1/2 p-6 md:p-8 overflow-y-auto h-screen border-r border-gray-300 bg-white">
        <div className="flex justify-between items-center mb-8 border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editor do Website</h1>
            <p className="text-gray-500 text-sm mt-1">As alterações aparecem à direita em tempo real.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSaveDraft} disabled={saving} className="px-4 py-2 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 transition disabled:opacity-50 text-sm">
              Guardar Rascunho
            </button>
            <button onClick={handlePublish} disabled={saving} className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition shadow-md disabled:opacity-50 text-sm">
              Publicar
            </button>
          </div>
        </div>

        {isPublished && (
          <div className="mb-6 bg-green-50 text-green-700 p-3 rounded-lg text-sm font-medium">
            ✓ Este website tem alterações publicadas e está online.
          </div>
        )}

        <div className="space-y-8 pb-20">
          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-2">1. Identidade Visual</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Cor Principal</label>
                <div className="flex items-center gap-2">
                  <input type="color" name="primaryColor" value={primary} onChange={handleColorChange} className="w-8 h-8 rounded cursor-pointer" />
                  <input type="text" name="primaryColor" value={primary} onChange={handleColorChange} className="border p-2 rounded w-full text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Cor Secundária</label>
                <div className="flex items-center gap-2">
                  <input type="color" name="secondaryColor" value={secondary} onChange={handleColorChange} className="w-8 h-8 rounded cursor-pointer" />
                  <input type="text" name="secondaryColor" value={secondary} onChange={handleColorChange} className="border p-2 rounded w-full text-xs" />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-2">2. Hero (Topo)</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Título Principal</label>
                <input type="text" name="heroTitle" value={content.heroTitle || ""} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Subtítulo</label>
                <textarea name="heroSubtitle" value={content.heroSubtitle || ""} onChange={handleChange} rows={2} className="w-full border p-2 rounded text-sm"></textarea>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-2">3. Sobre Nós</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Título</label>
                <input type="text" name="aboutTitle" value={content.aboutTitle || ""} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Texto</label>
                <textarea name="aboutText" value={content.aboutText || ""} onChange={handleChange} rows={3} className="w-full border p-2 rounded text-sm"></textarea>
              </div>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-900">4. Menu</h2>
              <button onClick={addService} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-medium">+ Prato</button>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">Título da Secção</label>
              <input type="text" name="servicesTitle" value={content.servicesTitle || ""} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
            </div>
            <div className="space-y-3">
              {(content.services || []).map((service, index) => (
                <div key={index} className="flex flex-col gap-2 bg-gray-50 p-3 rounded border border-gray-200 relative group">
                  <button onClick={() => removeService(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                  <input type="text" value={service.name} onChange={(e) => handleServiceChange(index, "name", e.target.value)} className="w-full border p-1 rounded text-sm font-bold" placeholder="Nome" />
                  <input type="text" value={service.price} onChange={(e) => handleServiceChange(index, "price", e.target.value)} className="w-full border p-1 rounded text-sm text-gray-600" placeholder="Preço" />
                  <input type="text" value={service.desc} onChange={(e) => handleServiceChange(index, "desc", e.target.value)} className="w-full border p-1 rounded text-xs text-gray-500" placeholder="Descrição" />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-900">5. Galeria</h2>
              <button onClick={addGalleryImage} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-medium">+ Imagem</button>
            </div>
            <div className="space-y-2">
              {(content.gallery || []).map((url, index) => (
                <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded border border-gray-200 relative group">
                  <button onClick={() => removeGalleryImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                  <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {url && <img src={url} alt="Preview" className="w-full h-full object-cover" />}
                  </div>
                  <input type="text" value={url} onChange={(e) => handleGalleryChange(index, e.target.value)} className="w-full border p-1 rounded text-xs" placeholder="URL da imagem" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* COLUNA DIREITA: PRÉ-VISUALIZAÇÃO EM TEMPO REAL */}
      <div className="w-full lg:w-1/2 bg-gray-200 p-4 md:p-8 overflow-y-auto h-screen flex justify-center">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-300 flex flex-col h-[90vh]">
          {/* Barra de Endereço Falsa */}
          <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b border-gray-300">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 bg-white rounded-md text-xs text-gray-400 px-3 py-1 text-center truncate">
              marka-kanda.com/{slug}
            </div>
          </div>

          {/* Conteúdo da Preview */}
          <div className="flex-1 overflow-y-auto bg-[#F8F4EF]">
            {/* Header Simulado */}
            <div className="p-4 flex justify-between items-center border-b border-gray-200 bg-white/80 sticky top-0 backdrop-blur-sm z-10">
              <div className="font-serif font-bold text-sm" style={{ color: primary }}>Alive Restaurante</div>
              <div className="flex gap-3 text-[10px] uppercase font-bold text-gray-400">
                <span>Sobre</span>
                <span>Menu</span>
                <span>Contactos</span>
              </div>
            </div>

            {/* Hero Simulado */}
            <div className="relative h-64 flex items-center justify-center text-center px-6 overflow-hidden" style={{ background: `linear-gradient(135deg, #1a1412 0%, ${primary} 100%)` }}>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase mb-2 text-white/60">Bem-vindo</p>
                <h1 className="font-serif text-2xl md:text-3xl text-white leading-tight mb-3">
                  {content.heroTitle || "O seu título aqui"}
                </h1>
                <p className="text-xs text-white/80 line-clamp-3">
                  {content.heroSubtitle || "O seu subtítulo aqui"}
                </p>
                <div className="mt-4 inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ background: secondary, color: "#1a1412" }}>
                  Reservar
                </div>
              </div>
            </div>

            {/* Sobre Simulado */}
            <div className="p-6 bg-white">
              <h2 className="font-serif text-xl mb-2 text-[#221A18]">{content.aboutTitle || "Sobre Nós"}</h2>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-6">
                {content.aboutText || "O texto de apresentação do seu negócio aparecerá aqui."}
              </p>
            </div>

            {/* Menu Simulado */}
            <div className="p-6 bg-[#F8F4EF]">
              <h2 className="font-serif text-xl mb-4 text-center text-[#221A18]">{content.servicesTitle || "O Nosso Menu"}</h2>
              <div className="space-y-4">
                {(content.services || []).slice(0, 3).map((s, i) => (
                  <div key={i} className="flex justify-between items-start border-b border-gray-200 border-dotted pb-2">
                    <div>
                      <div className="font-bold text-sm text-[#221A18]">{s.name}</div>
                      <div className="text-[10px] text-gray-500 line-clamp-1">{s.desc}</div>
                    </div>
                    <div className="text-xs font-bold ml-4" style={{ color: primary }}>{s.price}</div>
                  </div>
                ))}
                {(content.services || []).length > 3 && (
                  <div className="text-center text-[10px] text-gray-400 uppercase tracking-widest mt-2">E muito mais...</div>
                )}
              </div>
            </div>

            {/* Galeria Simulada */}
            <div className="p-6 bg-[#1a1412]">
              <h2 className="font-serif text-xl text-white text-center mb-4">Galeria</h2>
              <div className="grid grid-cols-2 gap-2">
                {(content.gallery || []).slice(0, 2).map((img, i) => (
                  <div key={i} className="aspect-square bg-gray-800 rounded overflow-hidden">
                    {img && <img src={img} alt="Galeria" className="w-full h-full object-cover" />}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-gray-100 text-center text-[10px] text-gray-500">
              © 2026 Alive Restaurante. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}