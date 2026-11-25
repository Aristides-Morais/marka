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

  // --- Funções para editar os Serviços/Menu ---
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

  // --- Funções para editar a Galeria ---
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

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        
        {/* CABEÇALHO DO PAINEL */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin - Editor do Website</h1>
            <p className="text-gray-500 text-sm mt-1">Personalize todo o conteúdo e identidade visual do negócio.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSaveDraft} 
              disabled={saving}
              className="px-5 py-2.5 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              {saving ? "A guardar..." : "Guardar Rascunho"}
            </button>
            <button 
              onClick={handlePublish} 
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition shadow-md disabled:opacity-50"
            >
              {saving ? "A publicar..." : "Publicar Website"}
            </button>
          </div>
        </div>

        {isPublished && (
          <div className="mb-6 bg-green-50 text-green-700 p-3 rounded-lg text-sm font-medium border border-green-200">
            ✓ Este website tem alterações publicadas e está online.
          </div>
        )}

        <div className="space-y-10">
          {/* 1. IDENTIDADE VISUAL */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-2">1. Identidade Visual</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Cor Principal (Destaques)</label>
                <div className="flex items-center gap-3">
                  <input type="color" name="primaryColor" value={content.visualIdentity?.primaryColor || "#6B1020"} onChange={handleColorChange} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                  <input type="text" name="primaryColor" value={content.visualIdentity?.primaryColor || "#6B1020"} onChange={handleColorChange} className="border p-2 rounded w-full text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cor Secundária (Botões)</label>
                <div className="flex items-center gap-3">
                  <input type="color" name="secondaryColor" value={content.visualIdentity?.secondaryColor || "#9A7634"} onChange={handleColorChange} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                  <input type="text" name="secondaryColor" value={content.visualIdentity?.secondaryColor || "#9A7634"} onChange={handleColorChange} className="border p-2 rounded w-full text-sm" />
                </div>
              </div>
            </div>
          </section>

          {/* 2. HERO */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-2">2. Secção Principal (Hero)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título Principal (Grande)</label>
                <input type="text" name="heroTitle" value={content.heroTitle || ""} onChange={handleChange} className="w-full border p-3 rounded-lg" placeholder="Ex: Onde Cada Prato Conta Uma História" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtítulo (Abaixo do título)</label>
                <textarea name="heroSubtitle" value={content.heroSubtitle || ""} onChange={handleChange} rows={2} className="w-full border p-3 rounded-lg" placeholder="Ex: Ingredientes frescos, sabores intensos..."></textarea>
              </div>
            </div>
          </section>

          {/* 3. SOBRE NÓS */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-2">3. Sobre Nós</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título da Secção</label>
                <input type="text" name="aboutTitle" value={content.aboutTitle || ""} onChange={handleChange} className="w-full border p-3 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Texto de Apresentação</label>
                <textarea name="aboutText" value={content.aboutText || ""} onChange={handleChange} rows={4} className="w-full border p-3 rounded-lg"></textarea>
              </div>
            </div>
          </section>

          {/* 4. SERVIÇOS / MENU (NOVO) */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-900">4. Serviços / Menu</h2>
              <button onClick={addService} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 font-medium">
                + Adicionar Prato
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Título da Secção</label>
              <input type="text" name="servicesTitle" value={content.servicesTitle || ""} onChange={handleChange} className="w-full border p-3 rounded-lg" />
            </div>

            <div className="space-y-4">
              {(content.services || []).map((service, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                  <button onClick={() => removeService(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                  
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Nome</label>
                    <input type="text" value={service.name} onChange={(e) => handleServiceChange(index, "name", e.target.value)} className="w-full border p-2 rounded" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Preço</label>
                    <input type="text" value={service.price} onChange={(e) => handleServiceChange(index, "price", e.target.value)} className="w-full border p-2 rounded" />
                  </div>
                  <div className="flex-[2]">
                    <label className="block text-xs text-gray-500 mb-1">Descrição</label>
                    <input type="text" value={service.desc} onChange={(e) => handleServiceChange(index, "desc", e.target.value)} className="w-full border p-2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. GALERIA (NOVO) */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-900">5. Galeria de Fotos</h2>
              <button onClick={addGalleryImage} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 font-medium">
                + Adicionar Imagem
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(content.gallery || []).map((url, index) => (
                <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-200 relative group">
                  <button onClick={() => removeGalleryImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                  
                  <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {url ? <img src={url} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Vazio</div>}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">URL da Imagem</label>
                    <input type="text" value={url} onChange={(e) => handleGalleryChange(index, e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="https://..." />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. OUTROS TÍTULOS */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-2">6. Outros Títulos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título de Contactos</label>
                <input type="text" name="contactTitle" value={content.contactTitle || ""} onChange={handleChange} className="w-full border p-3 rounded-lg" />
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}