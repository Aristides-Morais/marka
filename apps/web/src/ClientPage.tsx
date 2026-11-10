import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";

type Service = {
  id: string;
  name: string;
  durationMin: number;
  price: number;
};

export default function ClientPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/reservations/services`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedService || !date || !time) {
      setErrorMsg("Por favor, preencha todos os campos.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    const startTime = new Date(`${date}T${time}:00.000Z`).toISOString();

    try {
      const res = await fetch(`${API_URL}/api/v1/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          clientName: formData.name,
          clientPhone: formData.phone,
          startTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Erro ao reservar");
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 text-zinc-500">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4"></div>
        <p>A carregar serviços, aguarde...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-zinc-200">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Reserva Confirmada!</h2>
          <p className="text-zinc-500 mb-8">
            A sua reserva para <strong>{selectedService?.name}</strong> foi agendada para o dia <strong>{date.split("-").reverse().join("/")} às {time}</strong>.
          </p>
          <button
            onClick={() => {
              setIsSuccess(false);
              setSelectedService(null);
              setDate("");
              setTime("");
              setFormData({ name: "", phone: "" });
            }}
            className="w-full bg-zinc-900 text-white py-3 rounded-lg font-medium hover:bg-zinc-800 transition-colors"
          >
            Fazer outra reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 relative">
      <Link to="/admin" className="absolute top-4 right-4 text-xs text-zinc-400 hover:text-zinc-900 font-medium">
        Acesso Restrito (Admin)
      </Link>

      <div className="max-w-lg mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Marka</h1>
          <p className="text-zinc-500 mt-1">Faça a sua reserva online</p>
        </header>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 md:p-8">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">1. Escolha o serviço</label>
              <div className="grid grid-cols-1 gap-2">
                {services.length === 0 ? (
                  <p className="text-sm text-zinc-500">Nenhum serviço disponível de momento.</p>
                ) : (
                  services.map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => setSelectedService(svc)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedService?.id === svc.id
                          ? "border-zinc-900 bg-zinc-50"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-zinc-900">{svc.name}</div>
                          <div className="text-sm text-zinc-500">{svc.durationMin} minutos</div>
                        </div>
                        <div className="font-bold text-zinc-900">{Number(svc.price).toLocaleString("pt-AO")} Kz</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">2. Data</label>
                <input
                  type="date"
                  required
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Hora</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200">
              <label className="block text-sm font-medium text-zinc-700 mb-2">3. Os seus dados</label>
              <div className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="O seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="O seu telefone (ex: 923000000)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedService || !date || !time}
              className="w-full bg-zinc-900 text-white py-3 rounded-lg font-bold hover:bg-zinc-800 disabled:opacity-50 transition-colors"
            >
              {submitting ? "A agendar..." : "Confirmar Reserva"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}