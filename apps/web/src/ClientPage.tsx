import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "./lib/api";

type Service = { id: string; name: string; durationMin: number; price: number };

export default function ClientPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [hours, setHours] = useState({ openTime: "08:00", closeTime: "18:00" });
  
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Service[]>("/api/v1/reservations/services", { skipAuth: true }),
      apiFetch<{ openTime: string, closeTime: string }>("/api/v1/reservations/hours", { skipAuth: true })
    ]).then(([svcs, hrs]) => {
      setServices(svcs);
      setHours(hrs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-zinc-500">A carregar...</div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl max-w-md text-center shadow-xl">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Confirmado!</h2>
          <p className="text-zinc-500 mb-6">Reserva para {selectedService?.name} no dia {date.split("-").reverse().join("/")} às {time}.</p>
          <button onClick={() => { setIsSuccess(false); setSelectedService(null); setDate(""); setTime(""); }} className="w-full bg-zinc-900 text-white py-3 rounded-lg">Nova Reserva</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 relative">
      <Link to="/admin" className="absolute top-4 right-4 text-xs text-zinc-400 hover:text-zinc-900">Admin</Link>
      
      <div className="max-w-lg mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold">Marka</h1>
          <p className="text-zinc-500">Faça a sua reserva online</p>
          <p className="text-xs text-emerald-600 font-medium mt-2 bg-emerald-50 inline-block px-3 py-1 rounded-full">Aberto das {hours.openTime} às {hours.closeTime}</p>
        </header>

        <div className="bg-white rounded-2xl p-6 md:p-8 border border-zinc-200 shadow-sm">
          {errorMsg && <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg">{errorMsg}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">1. Serviço</label>
              <div className="grid gap-2">
                {services.map(svc => (
                  <div key={svc.id} onClick={() => setSelectedService(svc)} className={`p-4 rounded-xl border-2 cursor-pointer ${selectedService?.id === svc.id ? "border-zinc-900 bg-zinc-50" : "border-zinc-200"}`}>
                    <div className="flex justify-between"><span className="font-semibold">{svc.name}</span><span className="font-bold">{Number(svc.price).toLocaleString("pt-AO")} Kz</span></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Data</label>
                <input type="date" required min={new Date().toISOString().split("T")[0]} value={date} onChange={e => setDate(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hora</label>
                <input type="time" required min={hours.openTime} max={hours.closeTime} value={time} onChange={e => setTime(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>

            <div className="space-y-3">
              <input type="text" required placeholder="Nome completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              <input type="text" required placeholder="Telefone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>

            <button type="submit" disabled={submitting || !selectedService} className="w-full bg-zinc-900 text-white py-3 rounded-lg font-bold disabled:opacity-50">
              {submitting ? "A agendar..." : "Confirmar Reserva"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}