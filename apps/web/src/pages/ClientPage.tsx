import { useEffect, useState, type FormEvent, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { loadFont, fontStack, normalizeUrl, type LinkItem } from "../lib/theme";

type Service = { id: string; name: string; durationMin: number; price: number };

type Info = {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  address: string | null;
  bookingBgColor: string | null;
  bookingBgImage: string | null;
  fontFamily: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  mapsUrl: string | null;
  links: LinkItem[];
};

function isDark(hex?: string | null) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

export default function ClientPage() {
  const { slug } = useParams();

  const [info, setInfo] = useState<Info | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [hours, setHours] = useState({ openTime: "08:00", closeTime: "18:00" });

  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [showForm, setShowForm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      apiFetch<Service[]>("/api/v1/reservations/services", { skipAuth: true, tenant: slug }),
      apiFetch<{ openTime: string; closeTime: string }>("/api/v1/reservations/hours", { skipAuth: true, tenant: slug }),
      apiFetch<any>("/api/v1/business/info", { skipAuth: true, tenant: slug }),
    ])
      .then(([svcs, hrs, b]) => {
        setServices(svcs);
        setHours(hrs);
        loadFont(b.fontFamily);
        setInfo({
          name: b.name,
          logoUrl: b.logoUrl || null,
          primaryColor: b.primaryColor || "#1A4D2E",
          address: b.address || null,
          bookingBgColor: b.bookingBgColor || null,
          bookingBgImage: b.bookingBgImage || null,
          fontFamily: b.fontFamily || null,
          heroTitle: b.heroTitle || null,
          heroSubtitle: b.heroSubtitle || null,
          mapsUrl: b.mapsUrl || null,
          links: Array.isArray(b.links) ? b.links : [],
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedService || !date || !time) return setErrorMsg("Preencha todos os campos.");

    setSubmitting(true);
    setErrorMsg(null);
    const startTime = new Date(`${date}T${time}:00.000Z`).toISOString();

    try {
      await apiFetch("/api/v1/reservations", {
        method: "POST",
        body: JSON.stringify({ serviceId: selectedService.id, clientName: formData.name, clientPhone: formData.phone, startTime }),
        skipAuth: true,
        tenant: slug,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function closeForm() {
    setShowForm(false);
    setErrorMsg(null);
    if (isSuccess) {
      setIsSuccess(false);
      setSelectedService(null);
      setDate("");
      setTime("");
      setFormData({ name: "", phone: "" });
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-zinc-500">A carregar...</div>;
  if (!info) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Negócio não encontrado.</div>;

  const primary = info.primaryColor;
  const hasImage = !!info.bookingBgImage;
  const bgColor = info.bookingBgColor || "#F4F4F5";
  const light = hasImage || isDark(bgColor);

  const rootStyle: CSSProperties = {
    backgroundColor: bgColor,
    backgroundImage: hasImage ? `url(${info.bookingBgImage})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    fontFamily: fontStack(info.fontFamily),
  };

  const textMain = light ? "#FFFFFF" : "#18181B";
  const textSub = light ? "rgba(255,255,255,0.8)" : "#52525B";

  const title = info.heroTitle || info.name;
  const ampIdx = title.indexOf("&");
  const titleFirst = ampIdx > 0 ? title.slice(0, ampIdx).trim() : title;
  const titleSecond = ampIdx > 0 ? title.slice(ampIdx).trim() : "";

  const secondaryBtn: CSSProperties = light
    ? { backgroundColor: "#F5EFE6", color: "#18181B" }
    : { backgroundColor: "#FFFFFF", color: "#18181B", border: "1px solid #E4E4E7" };

  const linkBtn: CSSProperties = light
    ? { backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)", color: "#FFFFFF" }
    : { backgroundColor: "#FFFFFF", border: "1px solid #D4D4D8", color: "#18181B" };

  return (
    <div className="min-h-screen relative" style={rootStyle}>
      {hasImage && (
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.78))" }} />
      )}

      <div className="relative z-10 min-h-screen max-w-lg mx-auto px-5 py-8 flex flex-col">
        {/* Topo: logo + nome */}
        <header className="flex items-center gap-4">
          {info.logoUrl ? (
            <img src={info.logoUrl} alt="Logo" className="w-20 h-20 rounded-full object-cover border border-white/20 shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg" style={{ backgroundColor: primary }}>
              {info.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold leading-tight" style={{ color: textMain }}>{info.name}</h2>
            {info.address && <p className="text-base" style={{ color: textSub }}>{info.address}</p>}
          </div>
        </header>

        {/* Título grande */}
        <section className="flex-1 flex flex-col justify-center py-10">
          <h1 className="font-bold leading-[1.05] text-6xl" style={{ color: textMain }}>
            {titleFirst}
            {titleSecond && (
              <>
                <br />
                <span style={{ color: primary }}>{titleSecond}</span>
              </>
            )}
          </h1>
          {info.heroSubtitle && <p className="mt-5 text-lg max-w-xs" style={{ color: textSub }}>{info.heroSubtitle}</p>}
          <p className="mt-4 text-xs inline-block self-start px-3 py-1 rounded-full" style={{ backgroundColor: light ? "rgba(255,255,255,0.12)" : "#ECFDF5", color: light ? "#FFFFFF" : "#047857" }}>
            Aberto das {hours.openTime} às {hours.closeTime}
          </p>
        </section>

        {/* Botões */}
        <section className="space-y-3">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-between px-6 py-5 rounded-2xl font-semibold text-xl text-white shadow-lg"
            style={{ background: `linear-gradient(90deg, ${primary}CC, ${primary})` }}
          >
            <span>Reservar</span>
            <span className="text-2xl">→</span>
          </button>

          <Link to={`/${slug}/loja`} className="w-full flex items-center justify-center py-4 rounded-2xl font-semibold text-lg" style={secondaryBtn}>
            Ir para a Loja
          </Link>

          {info.mapsUrl && (
            <a href={normalizeUrl(info.mapsUrl)} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center py-4 rounded-2xl font-semibold text-lg" style={secondaryBtn}>
              Como chegar
            </a>
          )}

          {info.links.length > 0 && (
            <div className="grid grid-cols-3 gap-3 pt-1">
              {info.links.map((l, i) => (
                <a
                  key={i}
                  href={normalizeUrl(l.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center text-center px-2 py-5 rounded-2xl text-base font-medium break-words"
                  style={linkBtn}
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </section>

        <footer className="pt-6 text-center">
          <Link to={`/${slug}/admin`} className="text-xs" style={{ color: textSub, opacity: 0.6 }}>Admin</Link>
        </footer>
      </div>

      {/* Formulário de reserva */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={closeForm}>
          <div
            className="bg-white w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 md:p-8 text-zinc-900"
            style={{ fontFamily: fontStack(info.fontFamily) }}
            onClick={(e) => e.stopPropagation()}
          >
            {isSuccess ? (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white" style={{ backgroundColor: primary }}>
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Confirmado!</h2>
                <p className="text-zinc-500 mb-6">Reserva para {selectedService?.name} no dia {date.split("-").reverse().join("/")} às {time}.</p>
                <button onClick={closeForm} className="w-full text-white py-3 rounded-xl font-semibold" style={{ backgroundColor: primary }}>Fechar</button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold">Fazer reserva</h2>
                  <button type="button" onClick={closeForm} className="text-zinc-400 hover:text-zinc-900 text-2xl leading-none px-2">×</button>
                </div>

                {errorMsg && <div className="mb-5 p-4 bg-red-50 text-red-700 text-sm rounded-lg">{errorMsg}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">1. Serviço</label>
                    <div className="grid gap-2">
                      {services.map((svc) => (
                        <div
                          key={svc.id}
                          onClick={() => setSelectedService(svc)}
                          className="p-4 rounded-xl border-2 cursor-pointer"
                          style={{ borderColor: selectedService?.id === svc.id ? primary : "#E4E4E7", backgroundColor: selectedService?.id === svc.id ? "#FAFAFA" : "#FFFFFF" }}
                        >
                          <div className="flex justify-between">
                            <span className="font-semibold">{svc.name}</span>
                            <span className="font-bold">{Number(svc.price).toLocaleString("pt-AO")} Kz</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Data</label>
                      <input type="date" required min={new Date().toISOString().split("T")[0]} value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Hora</label>
                      <input type="time" required min={hours.openTime} max={hours.closeTime} value={time} onChange={(e) => setTime(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <input type="text" required placeholder="Nome completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                    <input type="text" required placeholder="Telefone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                  </div>

                  <button type="submit" disabled={submitting || !selectedService} className="w-full text-white py-3 rounded-xl font-bold disabled:opacity-50" style={{ backgroundColor: primary }}>
                    {submitting ? "A agendar..." : "Confirmar Reserva"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}