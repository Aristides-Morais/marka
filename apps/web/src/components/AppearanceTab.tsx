import { useEffect, useState, type ChangeEvent } from "react";
import { apiFetch } from "../lib/api";
import { FONTS, loadFont, fontStack, normalizeUrl, type LinkItem } from "../lib/theme";

const FUNDOS = ["#FFFFFF", "#F4F4F5", "#FEF3C7", "#DCFCE7", "#DBEAFE", "#FCE7F3", "#18181B", "#000000"];
const SUGESTOES = ["Instagram", "Facebook", "Tripadvisor", "Google", "LinkedIn", "Outro"];

type Theme = {
  primaryColor: string;
  storeBgColor: string;
  storeBgImage: string;
  bookingBgColor: string;
  bookingBgImage: string;
  fontFamily: string;
  heroTitle: string;
  heroSubtitle: string;
  mapsUrl: string;
  links: LinkItem[];
};

const EMPTY: Theme = {
  primaryColor: "#1A4D2E",
  storeBgColor: "",
  storeBgImage: "",
  bookingBgColor: "",
  bookingBgImage: "",
  fontFamily: "",
  heroTitle: "",
  heroSubtitle: "",
  mapsUrl: "",
  links: [],
};

type BgProps = {
  title: string;
  color: string;
  image: string;
  uploading: boolean;
  onColor: (c: string) => void;
  onFile: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onClear: () => void;
};

function BgPicker({ title, color, image, uploading, onColor, onFile, onRemoveImage, onClear }: BgProps) {
  const [hex, setHex] = useState(color);
  useEffect(() => setHex(color), [color]);

  function typeHex(v: string) {
    let x = v.trim();
    if (x && !x.startsWith("#")) x = "#" + x;
    setHex(x);
    if (/^#[0-9A-Fa-f]{6}$/.test(x)) onColor(x.toUpperCase());
  }

  return (
    <div className="border rounded-2xl p-5 space-y-4 bg-white shadow-sm">
      <h3 className="font-bold">{title}</h3>
      <div
        className="h-32 rounded-xl border flex items-center justify-center"
        style={{
          backgroundColor: color || "#FFFFFF",
          backgroundImage: image ? `url(${image})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <span className="bg-white/90 text-xs text-zinc-600 px-3 py-1 rounded-full">Pré-visualização</span>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Cor de fundo (qualquer cor)</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {FUNDOS.map((c) => (
            <button type="button" key={c} onClick={() => onColor(c)} className="w-9 h-9 rounded-full border-2" style={{ backgroundColor: c, borderColor: color === c ? "#2563eb" : "#d4d4d8" }} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(color) ? color : "#FFFFFF"} onChange={(e) => onColor(e.target.value.toUpperCase())} className="w-16 h-12 rounded-lg cursor-pointer border p-1 bg-white" />
          <input type="text" value={hex} onChange={(e) => typeHex(e.target.value)} placeholder="#FFFFFF" maxLength={7} className="w-32 border rounded-lg px-3 py-2 text-sm font-mono uppercase" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Imagem de fundo (opcional, tem prioridade sobre a cor)</label>
        <input type="file" accept="image/*" onChange={onFile} className="w-full text-sm" />
        {uploading && <p className="text-xs text-zinc-500 mt-1">A enviar imagem...</p>}
        {image && <button type="button" onClick={onRemoveImage} className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full font-semibold">Remover imagem</button>}
      </div>
      <button type="button" onClick={onClear} className="text-xs text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-full font-semibold">Repor fundo padrão</button>
    </div>
  );
}

type Props = { slug?: string; onToast: (message: string, type: "success" | "error") => void };

export default function AppearanceTab({ slug, onToast }: Props) {
  const [t, setT] = useState<Theme>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"store" | "booking" | null>(null);

  useEffect(() => {
    FONTS.forEach(loadFont);
    apiFetch<any>("/api/v1/business/info", { skipAuth: true, tenant: slug })
      .then((b) =>
        setT({
          primaryColor: b.primaryColor || "#1A4D2E",
          storeBgColor: b.storeBgColor || "",
          storeBgImage: b.storeBgImage || "",
          bookingBgColor: b.bookingBgColor || "",
          bookingBgImage: b.bookingBgImage || "",
          fontFamily: b.fontFamily || "",
          heroTitle: b.heroTitle || "",
          heroSubtitle: b.heroSubtitle || "",
          mapsUrl: b.mapsUrl || "",
          links: Array.isArray(b.links) ? b.links : [],
        })
      )
      .catch(() => onToast("Erro ao carregar a aparência", "error"));
  }, [slug]);

  async function pickImage(kind: "store" | "booking", e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setUploading(kind);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await apiFetch<{ url: string }>("/api/v1/upload", { method: "POST", body: fd, tenant: slug });
      setT((p) => (kind === "store" ? { ...p, storeBgImage: r.url } : { ...p, bookingBgImage: r.url }));
      onToast("Imagem enviada. Clica em Guardar Aparência.", "success");
    } catch (err: any) {
      onToast(err.message || "Erro ao enviar imagem", "error");
    } finally {
      setUploading(null);
      input.value = "";
    }
  }

  function setLink(i: number, patch: Partial<LinkItem>) {
    setT((p) => ({ ...p, links: p.links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) }));
  }

  async function save() {
    setSaving(true);
    try {
      await apiFetch("/api/v1/business/info", {
        method: "PATCH",
        tenant: slug,
        body: JSON.stringify({
          storeBgColor: t.storeBgColor || null,
          storeBgImage: t.storeBgImage || null,
          bookingBgColor: t.bookingBgColor || null,
          bookingBgImage: t.bookingBgImage || null,
          fontFamily: t.fontFamily || null,
          heroTitle: t.heroTitle || null,
          heroSubtitle: t.heroSubtitle || null,
          mapsUrl: t.mapsUrl ? normalizeUrl(t.mapsUrl) : null,
          links: t.links
            .filter((l) => l.label.trim() && l.url.trim())
            .map((l) => ({ label: l.label.trim(), url: normalizeUrl(l.url) })),
        }),
      });
      onToast("Aparência guardada!", "success");
    } catch (err: any) {
      onToast(err.message || "Erro ao guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-bold text-lg">Aparência</h2>
        <p className="text-sm text-zinc-500">Personaliza a Loja e a página de Marcações. No fim, clica em Guardar Aparência.</p>
      </div>

      <BgPicker
        title="Fundo da Loja"
        color={t.storeBgColor}
        image={t.storeBgImage}
        uploading={uploading === "store"}
        onColor={(c) => setT((p) => ({ ...p, storeBgColor: c }))}
        onFile={(e) => pickImage("store", e)}
        onRemoveImage={() => setT((p) => ({ ...p, storeBgImage: "" }))}
        onClear={() => setT((p) => ({ ...p, storeBgColor: "", storeBgImage: "" }))}
      />

      <BgPicker
        title="Fundo das Marcações"
        color={t.bookingBgColor}
        image={t.bookingBgImage}
        uploading={uploading === "booking"}
        onColor={(c) => setT((p) => ({ ...p, bookingBgColor: c }))}
        onFile={(e) => pickImage("booking", e)}
        onRemoveImage={() => setT((p) => ({ ...p, bookingBgImage: "" }))}
        onClear={() => setT((p) => ({ ...p, bookingBgColor: "", bookingBgImage: "" }))}
      />

      <div className="border rounded-2xl p-5 space-y-3 bg-white shadow-sm">
        <h3 className="font-bold">Tipo de letra</h3>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setT((p) => ({ ...p, fontFamily: f }))}
              className="border rounded-xl px-3 py-3 text-left text-lg"
              style={{ fontFamily: fontStack(f), borderColor: t.fontFamily === f ? "#2563eb" : "#e4e4e7", borderWidth: 2 }}
            >
              {f}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setT((p) => ({ ...p, fontFamily: "" }))} className="text-xs text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-full font-semibold">Repor letra padrão</button>
      </div>

      <div className="border rounded-2xl p-5 space-y-3 bg-white shadow-sm">
        <h3 className="font-bold">Textos da página de Marcações</h3>
        <input value={t.heroTitle} onChange={(e) => setT({ ...t, heroTitle: e.target.value })} placeholder="Título (ex: Steak & Sea)" className="w-full border rounded-lg px-3 py-2 text-sm" />
        <input value={t.heroSubtitle} onChange={(e) => setT({ ...t, heroSubtitle: e.target.value })} placeholder="Subtítulo (ex: Experiência gastronómica única)" className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div className="border rounded-2xl p-5 space-y-3 bg-white shadow-sm">
        <h3 className="font-bold">Botões e links</h3>
        <input value={t.mapsUrl} onChange={(e) => setT({ ...t, mapsUrl: e.target.value })} placeholder="Link do Como chegar (Google Maps)" className="w-full border rounded-lg px-3 py-2 text-sm" />

        {t.links.map((l, i) => (
          <div key={i} className="flex gap-2">
            <input value={l.label} onChange={(e) => setLink(i, { label: e.target.value })} placeholder="Nome" className="w-1/3 border rounded-lg px-3 py-2 text-sm" />
            <input value={l.url} onChange={(e) => setLink(i, { url: e.target.value })} placeholder="Link (https://...)" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
            <button type="button" onClick={() => setT((p) => ({ ...p, links: p.links.filter((_, idx) => idx !== i) }))} className="text-red-500 px-2">🗑️</button>
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          {SUGESTOES.map((s) => (
            <button
              type="button"
              key={s}
              disabled={t.links.length >= 12}
              onClick={() => setT((p) => ({ ...p, links: [...p.links, { label: s === "Outro" ? "" : s, url: "" }] }))}
              className="text-xs bg-zinc-100 px-3 py-1.5 rounded-full font-semibold disabled:opacity-50"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      <button type="button" onClick={save} disabled={saving || uploading !== null} className="w-full text-white py-3 rounded-xl font-semibold disabled:opacity-50" style={{ backgroundColor: t.primaryColor }}>
        {saving ? "A guardar..." : "Guardar Aparência"}
      </button>
    </div>
  );
}