import { useEffect, useState, type ChangeEvent } from "react";
import { apiFetch } from "../lib/api";
import { FONTS, loadFont, fontStack, normalizeUrl, type LinkItem } from "../lib/theme";

const PRIMARIAS = ["#16A34A", "#1A4D2E", "#1877F2", "#7C3AED", "#DB2777", "#DC2626", "#EA580C", "#EAB308", "#000000"];
const FUNDOS = ["#FFFFFF", "#F4F4F5", "#FEF3C7", "#DCFCE7", "#DBEAFE", "#FCE7F3", "#18181B", "#000000"];
const SUGESTOES = ["Instagram", "Facebook", "Tripadvisor", "Google", "LinkedIn", "Outro"];
const HEX = /^#[0-9A-Fa-f]{6}$/;

type Theme = {
  name: string;
  logoUrl: string;
  primaryColor: string;
  storeBgColor: string;
  storeBgImage: string;
  storeHeroTitle: string;
  storeHeroSubtitle: string;
  storeHeroImage: string;
  bookingBgColor: string;
  bookingBgImage: string;
  fontFamily: string;
  heroTitle: string;
  heroSubtitle: string;
  mapsUrl: string;
  links: LinkItem[];
};

const EMPTY: Theme = {
  name: "",
  logoUrl: "",
  primaryColor: "#1A4D2E",
  storeBgColor: "",
  storeBgImage: "",
  storeHeroTitle: "",
  storeHeroSubtitle: "",
  storeHeroImage: "",
  bookingBgColor: "",
  bookingBgImage: "",
  fontFamily: "",
  heroTitle: "",
  heroSubtitle: "",
  mapsUrl: "",
  links: [],
};

function isDark(hex?: string) {
  if (!hex || !HEX.test(hex)) return false;
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

type ColorFieldProps = { colors: string[]; value: string; onChange: (c: string) => void; allowEmpty?: boolean };

function ColorField({ colors, value, onChange }: ColorFieldProps) {
  const [hex, setHex] = useState(value);
  useEffect(() => setHex(value), [value]);

  function typeHex(v: string) {
    let x = v.trim();
    if (x && !x.startsWith("#")) x = "#" + x;
    setHex(x);
    if (HEX.test(x)) onChange(x.toUpperCase());
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {colors.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => onChange(c)}
            className="w-9 h-9 rounded-full border-2"
            style={{ backgroundColor: c, borderColor: value.toUpperCase() === c ? "#2563eb" : "#d4d4d8" }}
          />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={HEX.test(value) ? value : "#FFFFFF"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="w-16 h-12 rounded-lg cursor-pointer border p-1 bg-white"
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => typeHex(e.target.value)}
          placeholder="#FFFFFF"
          maxLength={7}
          className="w-32 border rounded-lg px-3 py-2 text-sm font-mono uppercase"
        />
      </div>
      <p className="text-xs text-zinc-500 mt-1">Escolhe uma cor pronta, abre a paleta ou escreve o código.</p>
    </div>
  );
}

type ImageFieldProps = {
  label: string;
  image: string;
  uploading: boolean;
  onFile: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
};

function ImageField({ label, image, uploading, onFile, onRemove }: ImageFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type="file" accept="image/*" onChange={onFile} className="w-full text-sm" />
      {uploading && <p className="text-xs text-zinc-500 mt-1">A enviar imagem...</p>}
      {image && (
        <div className="mt-2 flex items-center gap-3">
          <img src={image} className="w-20 h-14 object-cover rounded-lg border" />
          <button type="button" onClick={onRemove} className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full font-semibold">
            Remover imagem
          </button>
        </div>
      )}
    </div>
  );
}

function StorePreview({ t }: { t: Theme }) {
  const p = HEX.test(t.primaryColor) ? t.primaryColor : "#1A4D2E";
  const bg = t.storeBgColor || "#F8F9FA";
  const dark = !t.storeBgImage && isDark(bg);
  const title = t.storeHeroTitle || `Bem-vindo à ${t.name || "nossa loja"}`;
  const words = title.split(" ");
  const last = words.length > 1 ? words.pop() : "";
  const first = words.join(" ");

  return (
    <div
      className="rounded-2xl overflow-hidden border shadow-sm"
      style={{
        backgroundColor: bg,
        backgroundImage: t.storeBgImage ? `url(${t.storeBgImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: fontStack(t.fontFamily),
      }}
    >
      <div className="bg-white px-3 py-2 flex items-center justify-between border-b">
        <div className="flex items-center gap-2 min-w-0">
          {t.logoUrl ? (
            <img src={t.logoUrl} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: p }}>
              {(t.name || "L").charAt(0)}
            </div>
          )}
          <span className="text-xs font-bold truncate max-w-[110px]">{t.name || "A tua loja"}</span>
        </div>
        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: p }} />
      </div>

      <div className="p-3 space-y-3">
        <div className="rounded-xl overflow-hidden grid grid-cols-2 bg-white">
          <div className="p-3 flex flex-col justify-center" style={{ background: `linear-gradient(135deg, ${p}1A, #FFFFFF)` }}>
            <p className="text-sm font-extrabold leading-tight text-zinc-900">
              {first} {last && <span style={{ color: p }}>{last}</span>}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">{t.storeHeroSubtitle || "Descobre os nossos produtos."}</p>
            <span className="mt-2 text-[10px] text-white px-2 py-1 rounded-full self-start" style={{ backgroundColor: p }}>
              Ver produtos
            </span>
          </div>
          {t.storeHeroImage ? (
            <img src={t.storeHeroImage} className="w-full h-full object-cover" />
          ) : (
            <div className="min-h-[80px]" style={{ background: `linear-gradient(135deg, ${p}, ${p}99)` }} />
          )}
        </div>

        <p className={`text-xs font-bold ${t.storeBgImage ? "text-white" : dark ? "text-white" : "text-zinc-900"}`}>Produtos em Destaque</p>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl p-2">
              <div className="aspect-square bg-zinc-100 rounded-lg mb-2" />
              <div className="h-2 w-2/3 bg-zinc-200 rounded mb-1" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold" style={{ color: p }}>
                  5.000 Kz
                </span>
                <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center" style={{ backgroundColor: p }}>
                  +
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type Props = { slug?: string; onToast: (message: string, type: "success" | "error") => void };

export default function AppearanceTab({ slug, onToast }: Props) {
  const [t, setT] = useState<Theme>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"store" | "booking" | "hero" | null>(null);

  useEffect(() => {
    FONTS.forEach(loadFont);
    apiFetch<any>("/api/v1/business/info", { skipAuth: true, tenant: slug })
      .then((b) =>
        setT({
          name: b.name || "",
          logoUrl: b.logoUrl || "",
          primaryColor: b.primaryColor || "#1A4D2E",
          storeBgColor: b.storeBgColor || "",
          storeBgImage: b.storeBgImage || "",
          storeHeroTitle: b.storeHeroTitle || "",
          storeHeroSubtitle: b.storeHeroSubtitle || "",
          storeHeroImage: b.storeHeroImage || "",
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

  async function pickImage(kind: "store" | "booking" | "hero", e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setUploading(kind);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await apiFetch<{ url: string }>("/api/v1/upload", { method: "POST", body: fd, tenant: slug });
      setT((p) =>
        kind === "store"
          ? { ...p, storeBgImage: r.url }
          : kind === "booking"
          ? { ...p, bookingBgImage: r.url }
          : { ...p, storeHeroImage: r.url }
      );
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

  function pickFont(f: string) {
    loadFont(f);
    setT((p) => ({ ...p, fontFamily: f }));
  }

  async function save() {
    setSaving(true);
    try {
      await apiFetch("/api/v1/business/info", {
        method: "PATCH",
        tenant: slug,
        body: JSON.stringify({
          primaryColor: HEX.test(t.primaryColor) ? t.primaryColor : undefined,
          storeBgColor: t.storeBgColor || null,
          storeBgImage: t.storeBgImage || null,
          storeHeroTitle: t.storeHeroTitle || null,
          storeHeroSubtitle: t.storeHeroSubtitle || null,
          storeHeroImage: t.storeHeroImage || null,
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

  const card = "border rounded-2xl p-5 space-y-4 bg-white shadow-sm";

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
      <div className="space-y-6 min-w-0">
        <div>
          <h2 className="font-bold text-lg">Aparência</h2>
          <p className="text-sm text-zinc-500">Personaliza a Loja e a página de Marcações. A pré-visualização muda em direto. No fim, clica em Guardar Aparência.</p>
        </div>

        {/* Cor principal */}
        <div className={card}>
          <h3 className="font-bold">Cor da marca</h3>
          <ColorField colors={PRIMARIAS} value={t.primaryColor} onChange={(c) => setT((p) => ({ ...p, primaryColor: c }))} />
        </div>

        {/* Letra */}
        <div className={card}>
          <h3 className="font-bold">Tipo de letra</h3>
          <select
            value={t.fontFamily}
            onChange={(e) => pickFont(e.target.value)}
            className="w-full border rounded-lg px-3 py-3 text-base bg-white"
            style={{ fontFamily: fontStack(t.fontFamily) }}
          >
            <option value="">Padrão</option>
            {FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <p className="text-2xl" style={{ fontFamily: fontStack(t.fontFamily) }}>
            Aa Bb Cc 123 — {t.fontFamily || "Padrão"}
          </p>
        </div>

        {/* Banner da loja */}
        <div className={card}>
          <h3 className="font-bold">Banner da Loja</h3>
          <input
            value={t.storeHeroTitle}
            onChange={(e) => setT({ ...t, storeHeroTitle: e.target.value })}
            placeholder="Título (ex: Estilo que expressa quem você é)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={t.storeHeroSubtitle}
            onChange={(e) => setT({ ...t, storeHeroSubtitle: e.target.value })}
            placeholder="Subtítulo (ex: Confira a nossa coleção exclusiva)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <ImageField
            label="Imagem do banner (opcional)"
            image={t.storeHeroImage}
            uploading={uploading === "hero"}
            onFile={(e) => pickImage("hero", e)}
            onRemove={() => setT((p) => ({ ...p, storeHeroImage: "" }))}
          />
          <p className="text-xs text-zinc-500">A última palavra do título fica na cor da marca.</p>
        </div>

        {/* Fundo da loja */}
        <div className={card}>
          <h3 className="font-bold">Fundo da Loja</h3>
          <ColorField colors={FUNDOS} value={t.storeBgColor} onChange={(c) => setT((p) => ({ ...p, storeBgColor: c }))} />
          <ImageField
            label="Imagem de fundo (opcional, tem prioridade sobre a cor)"
            image={t.storeBgImage}
            uploading={uploading === "store"}
            onFile={(e) => pickImage("store", e)}
            onRemove={() => setT((p) => ({ ...p, storeBgImage: "" }))}
          />
          <button
            type="button"
            onClick={() => setT((p) => ({ ...p, storeBgColor: "", storeBgImage: "" }))}
            className="text-xs text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-full font-semibold"
          >
            Repor fundo padrão
          </button>
        </div>

        {/* Fundo das marcações */}
        <div className={card}>
          <h3 className="font-bold">Fundo das Marcações</h3>
          <div
            className="h-24 rounded-xl border"
            style={{
              backgroundColor: t.bookingBgColor || "#F4F4F5",
              backgroundImage: t.bookingBgImage ? `url(${t.bookingBgImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <ColorField colors={FUNDOS} value={t.bookingBgColor} onChange={(c) => setT((p) => ({ ...p, bookingBgColor: c }))} />
          <ImageField
            label="Imagem de fundo (opcional)"
            image={t.bookingBgImage}
            uploading={uploading === "booking"}
            onFile={(e) => pickImage("booking", e)}
            onRemove={() => setT((p) => ({ ...p, bookingBgImage: "" }))}
          />
          <button
            type="button"
            onClick={() => setT((p) => ({ ...p, bookingBgColor: "", bookingBgImage: "" }))}
            className="text-xs text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-full font-semibold"
          >
            Repor fundo padrão
          </button>
        </div>

        {/* Textos marcações */}
        <div className={card}>
          <h3 className="font-bold">Textos da página de Marcações</h3>
          <input value={t.heroTitle} onChange={(e) => setT({ ...t, heroTitle: e.target.value })} placeholder="Título (ex: Steak & Sea)" className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input value={t.heroSubtitle} onChange={(e) => setT({ ...t, heroSubtitle: e.target.value })} placeholder="Subtítulo (ex: Experiência gastronómica única)" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>

        {/* Links */}
        <div className={card}>
          <h3 className="font-bold">Botões e links</h3>
          <input value={t.mapsUrl} onChange={(e) => setT({ ...t, mapsUrl: e.target.value })} placeholder="Link do Como chegar (Google Maps)" className="w-full border rounded-lg px-3 py-2 text-sm" />

          {t.links.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input value={l.label} onChange={(e) => setLink(i, { label: e.target.value })} placeholder="Nome" className="w-1/3 border rounded-lg px-3 py-2 text-sm" />
              <input value={l.url} onChange={(e) => setLink(i, { url: e.target.value })} placeholder="Link (https://...)" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
              <button type="button" onClick={() => setT((p) => ({ ...p, links: p.links.filter((_, idx) => idx !== i) }))} className="text-red-500 px-2">
                🗑️
              </button>
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

        <button
          type="button"
          onClick={save}
          disabled={saving || uploading !== null}
          className="w-full text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          style={{ backgroundColor: HEX.test(t.primaryColor) ? t.primaryColor : "#1A4D2E" }}
        >
          {saving ? "A guardar..." : "Guardar Aparência"}
        </button>
      </div>

      {/* Pré-visualização */}
      <div className="lg:sticky lg:top-4 order-first lg:order-none">
        <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Pré-visualização da Loja</p>
        <StorePreview t={t} />
      </div>
    </div>
  );
}