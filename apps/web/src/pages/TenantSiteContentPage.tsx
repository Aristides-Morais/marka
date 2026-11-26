import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

type SiteContent = {
  heroTitle?: string;
  heroSubtitle?: string;
  aboutTitle?: string;
  aboutText?: string;
  servicesTitle?: string;
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
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        
        <div className="flex justify-between items-center mb-8 border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editor do Website</h1>
            <p className="text-gray-500 text-sm mt-1">Personalize o site do seu negócio.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSaveDraft} 
              disabled={saving}
              className="px-5 py-2.5 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              Guardar Rascunho
            </button>
            <button 
              onClick={handlePublish} 
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition shadow-md disabled:opacity-50"
            >
              Publicar Website
            </button>
          </div>
        </div>

        {isPublished && (
          <div className="mb-6 bg-green-50 text-green-700 p-3 rounded-lg text-sm font-medium">
            ✓ Este website tem alterações publicadas e está online.
          </div>
        )}

        <div className="space-y-8">
          {/* Secção: Identidade Visual */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-2">Identidade Visual</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Cor Principal</label>
                <div className="flex items-center gap-3">
                  <input type="color" name="primaryColor" value={content.visualIdentity?.primaryColor || "#6B1020"} onChange={handleColorChange} className="w-10 h-10 rounded cursor-pointer" />
                  <input type="text" name="primaryColor" value={content.visualIdentity?.primaryColor || "#6B1020"} onChange={handleColorChange} className="border p-2 rounded w-full text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cor Secundária</label>
                <div className="flex items-center gap-3">
                  <input type="color" name="secondaryColor" value={content.visualIdentity?.secondaryColor || "#9A7634"} onChange={handleColorChange} className="w-10 h-10 rounded cursor-pointer" />
                  <input type="text" name="secondaryColor" value={content.visualIdentity?.secondaryColor || "#9A7634"} onChange={handleColorChange} className="border p-2 rounded w-full text-sm" />
                </div>
              </div>
            </div>
          </section>

          {/* Secção: Hero (Topo) */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-2">Secção Principal (Hero)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título Principal</label>
                <input type="text" name="heroTitle" value={content.heroTitle || ""} onChange={handleChange} className="w-full border p-3 rounded-lg" placeholder="Ex: Onde Cada Prato Conta Uma História" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtítulo</label>
                <textarea name="heroSubtitle" value={content.heroSubtitle || ""} onChange={handleChange} rows={2} className="w-full border p-3 rounded-lg" placeholder="Ex: Ingredientes frescos, sabores intensos..."></textarea>
              </div>
            </div>
          </section>

          {/* Secção: Sobre Nós */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-2">Sobre Nós</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input type="text" name="aboutTitle" value={content.aboutTitle || ""} onChange={handleChange} className="w-full border p-3 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Texto de Apresentação</label>
                <textarea name="aboutText" value={content.aboutText || ""} onChange={handleChange} rows={4} className="w-full border p-3 rounded-lg"></textarea>
              </div>
            </div>
          </section>

          {/* Secção: Títulos das Páginas */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-2">Títulos das Secções</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título do Menu/Serviços</label>
                <input type="text" name="servicesTitle" value={content.servicesTitle || ""} onChange={handleChange} className="w-full border p-3 rounded-lg" />
              </div>
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