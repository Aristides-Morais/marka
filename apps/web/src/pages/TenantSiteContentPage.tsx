import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

type ServiceItem = { name: string; desc: string; price: string };

type SiteContent = {
  heroTitle?: string;
  heroSubtitle?: string;
  aboutTitle?: string;
  aboutText?: string;
  servicesTitle?: string;
  services?: ServiceItem[];
  gallery?: string[];
  visualIdentity?: Record<string, string>;
};

export default function TenantSiteContentPage() {
  const { slug = "" } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<SiteContent>({});
  const [isPublished, setIsPublished] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // Quando o conteúdo muda, envia os dados para o iframe (site real)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: "SITE_CONTENT_UPDATE", content },
          "*"
        );
      }
    }, 300); // 300ms debounce para não spammar o iframe
    return () => clearTimeout(timer);
  }, [content]);

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
    setContent({ ...content, services: [...(content.services || []), { name: "Novo Prato", desc: "Descrição do prato...", price: "0 Kz" }] });
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
    if (!confirm("Tem a certeza que quer publicar estas alterações?")) return;
    setSaving(true);
    try {
      await apiFetch(`/api/v1/site-content/publish`, { method: "POST", tenant: slug });
      setIsPublished(true);
      alert("Website publicado com sucesso!");
    } catch (e) {
      alert("Erro ao publicar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen grid place-items-center bg-gray-100">A carregar painel...</div>;

  const primary = content.visualIdentity?.primaryColor || "#6B1020";
  const secondary = content.visualIdentity?.secondaryColor || "#9A7634";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row font-sans text-gray-800">
      
      {/* COLUNA ESQUERDA: FORMULÁRIO */}
      <div className="w-full lg:w-[400px] xl:w-[450px] p-5 overflow-y-auto h-screen border-r border-gray-300 bg-white shadow-lg z-10 flex-shrink-0">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Editor do Website</h1>
          <p className="text-gray-500 text-xs mt-1">As alterações aparecem no site real à direita.</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={handleSaveDraft} disabled={saving} className="flex-1 py-2 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 transition disabled:opacity-50 text-xs">
            Guardar Rascunho
          </button>
          <button onClick={handlePublish} disabled={saving} className="flex-1 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition shadow disabled:opacity-50 text-xs">
            Publicar
          </button>
        </div>

        {isPublished && (
          <div className="mb-6 bg-green-50 text-green-700 p-2 rounded-lg text-xs font-medium border border-green-200">
            ✓ Website publicado e online.
          </div>
        )}

        <div className="space-y-6 pb-20">
          <section>
            <h2 className="text-sm font-bold mb-3 text-gray-900 border-b pb-1">Cores</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium mb-1">Principal</label>
                <input type="color" name="primaryColor" value={primary} onChange={handleColorChange} className="w-full h-8 rounded cursor-pointer" />
              </div>
              <div>
                <label className="block text-[10px] font-medium mb-1">Secundária</label>
                <input type="color" name="secondaryColor" value={secondary} onChange={handleColorChange} className="w-full h-8 rounded cursor-pointer" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold mb-3 text-gray-900 border-b pb-1">Hero (Topo)</h2>
            <div className="space-y-2">
              <input type="text" name="heroTitle" value={content.heroTitle || ""} onChange={handleChange} className="w-full border p-2 rounded text-xs" placeholder="Título Principal" />
              <textarea name="heroSubtitle" value={content.heroSubtitle || ""} onChange={handleChange} rows={2} className="w-full border p-2 rounded text-xs" placeholder="Subtítulo"></textarea>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold mb-3 text-gray-900 border-b pb-1">Sobre Nós</h2>
            <div className="space-y-2">
              <input type="text" name="aboutTitle" value={content.aboutTitle || ""} onChange={handleChange} className="w-full border p-2 rounded text-xs" placeholder="Título" />
              <textarea name="aboutText" value={content.aboutText || ""} onChange={handleChange} rows={3} className="w-full border p-2 rounded text-xs" placeholder="Texto"></textarea>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-3 border-b pb-1">
              <h2 className="text-sm font-bold text-gray-900">Menu</h2>
              <button onClick={addService} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold hover:bg-blue-100">+ Adicionar</button>
            </div>
            <input type="text" name="servicesTitle" value={content.servicesTitle || ""} onChange={handleChange} className="w-full border p-2 rounded text-xs mb-3" placeholder="Título da Secção" />
            
            <div className="space-y-3">
              {(content.services || []).map((service, index) => (
                <div key={index} className="flex flex-col gap-1 bg-gray-50 p-2 rounded border border-gray-200 relative group">
                  <button onClick={() => removeService(index)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition">×</button>
                  <input type="text" value={service.name} onChange={(e) => handleServiceChange(index, "name", e.target.value)} className="w-full border p-1 rounded text-xs font-bold" placeholder="Nome" />
                  <input type="text" value={service.price} onChange={(e) => handleServiceChange(index, "price", e.target.value)} className="w-full border p-1 rounded text-xs text-gray-600" placeholder="Preço" />
                  <input type="text" value={service.desc} onChange={(e) => handleServiceChange(index, "desc", e.target.value)} className="w-full border p-1 rounded text-[10px] text-gray-500" placeholder="Descrição" />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-3 border-b pb-1">
              <h2 className="text-sm font-bold text-gray-900">Galeria</h2>
              <button onClick={addGalleryImage} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold hover:bg-blue-100">+ Imagem</button>
            </div>
            <div className="space-y-2">
              {(content.gallery || []).map((url, index) => (
                <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded border border-gray-200 relative group">
                  <button onClick={() => removeGalleryImage(index)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition">×</button>
                  <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {url && <img src={url} alt="Preview" className="w-full h-full object-cover" />}
                  </div>
                  <input type="text" value={url} onChange={(e) => handleGalleryChange(index, e.target.value)} className="w-full border p-1 rounded text-[10px]" placeholder="URL da imagem" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* COLUNA DIREITA: IFRAME DO SITE REAL */}
      <div className="flex-1 bg-gray-200 flex flex-col h-screen overflow-hidden">
        <div className="bg-white border-b border-gray-300 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-bold">Pré-visualização ao Vivo:</span>
            <span className="bg-gray-100 px-2 py-1 rounded">marka-two-nu.vercel.app/{slug}</span>
          </div>
          <button onClick={() => iframeRef.current?.contentWindow?.location.reload()} className="text-xs text-blue-600 hover:underline">Recarregar</button>
        </div>
        <div className="flex-1 p-4 md:p-8">
          <div className="w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-400">
            <iframe
              ref={iframeRef}
              src={`/${slug}`}
              className="w-full h-full border-0"
              title="Site Preview"
            />
          </div>
        </div>
      </div>

    </div>
  );
}