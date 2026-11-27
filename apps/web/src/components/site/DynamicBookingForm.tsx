import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BUSINESS_TYPES, resolveType } from "../../lib/businessTypes";

export default function DynamicBookingForm({ business, waNumber = "244923000000" }: { business: any; waNumber?: string }) {
  const { slug = "" } = useParams();
  const type = resolveType(business);
  const cfg = BUSINESS_TYPES[type];
  const primary = "#6B1020";

  const initial: Record<string, string> = {};
  cfg.bookingFields.forEach((f) => (initial[f.key] = ""));
  const [form, setForm] = useState(initial);
  const [sent, setSent] = useState(false);
  const [cartNote, setCartNote] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const isValid = cfg.bookingFields.filter((f) => f.required).every((f) => form[f.key]?.trim().length >= 2);

  const msg = `${cfg.whatsappIntro}\n\n${cfg.bookingFields.map((f) => `• ${f.label}: ${form[f.key] || "-"}`).join("\n")}${cartNote ? `\n\n${cartNote}` : ""}`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 16px", borderRadius: 12, border: "1px solid #E5DDD6", fontSize: 15, background: "#fff" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6, color: "#6b635e" };

  return (
    <main className="min-h-screen bg-[#F8F4EF] font-sans">
      <section className="pt-32 pb-12 px-6 text-center bg-white">
        <Link to={`/${slug}`} className="inline-block mb-6 px-5 py-2 rounded-full border font-bold text-sm">← Voltar à Página Inicial</Link>
        <h1 className="font-serif text-5xl md:text-6xl">{cfg.bookingTitle}</h1>
        <p className="text-gray-500 mt-3">Preencha, confirme e só depois enviamos para o WhatsApp.</p>
      </section>
      <section className="px-6 py-12">
        <div className="container mx-auto max-w-2xl bg-white rounded-3xl shadow-lg border p-6 md:p-10">
          {!sent ? (
            <div className="space-y-5">
              {cfg.bookingFields.map((f) => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label} {f.required ? "*" : ""}</label>
                  {f.type === "select" ? (
                    <select style={inputStyle} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)}>
                      <option value="">Escolha...</option>
                      {f.options?.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea style={{ ...inputStyle, minHeight: 90 }} placeholder={f.placeholder} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
                  ) : f.type === "file" ? (
                    <input type="file" style={inputStyle} onChange={(e) => set(f.key, e.target.files?.[0]?.name || "")} />
                  ) : (
                    <input type={f.type} style={inputStyle} placeholder={f.placeholder} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
                  )}
                </div>
              ))}
              <button onClick={() => { if (isValid) setSent(true); }} disabled={!isValid} className="w-full py-4 rounded-full text-white font-bold" style={{ background: isValid ? primary : "#ccc" }}>
                {isValid ? "Confirmar →" : "Preencha os campos obrigatórios *"}
              </button>
              <p className="text-center text-xs text-gray-400">Ainda não enviamos nada.</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="font-serif text-3xl font-bold mb-3">Resumo</h2>
              <div className="bg-[#F8F4EF] rounded-2xl p-6 text-left space-y-2 text-[15px]">
                {cfg.bookingFields.map((f) => <p key={f.key}><b>{f.label}:</b> {form[f.key] || "-"}</p>)}
              </div>
              <a href={waLink} target="_blank" rel="noreferrer" className="inline-block w-full mt-6 py-4 rounded-full text-white font-bold" style={{ background: "#25D366" }}>📲 Encaminhar no WhatsApp</a>
              <button onClick={() => setSent(false)} className="mt-3 text-sm underline text-gray-500 font-bold">Editar dados</button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}