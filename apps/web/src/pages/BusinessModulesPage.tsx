
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, getAccessToken, setAccessToken } from "../lib/api";

type ModuleName = "website" | "store" | "booking";

type Business = {
  id: string;
  name: string;
  slug: string;
  modules: string[];
  active: boolean;
};

const moduleOptions: {
  id: ModuleName;
  title: string;
  description: string;
}[] = [
  {
    id: "website",
    title: "Website",
    description: "Página pública e conteúdo institucional.",
  },
  {
    id: "store",
    title: "Loja",
    description: "Produtos, catálogo e encomendas.",
  },
  {
    id: "booking",
    title: "Reservas",
    description: "Marcações e gestão de reservas.",
  },
];

function normalizeModules(modules: string[] = []): ModuleName[] {
  // Compatibilidade apenas com o valor antigo exacto do Prisma.
  if (modules.length === 1 && modules[0] === "Website") {
    return ["website", "store", "booking"];
  }

  const values = modules.map((value) => value.trim().toLowerCase());

  return [...new Set(
    values.filter(
      (value): value is ModuleName =>
        value === "website" ||
        value === "store" ||
        value === "booking"
    )
  )];
}

export default function BusinessModulesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadBusinesses() {
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch<Business[]>(
        "/api/v1/super-admin/businesses"
      );

      setBusinesses(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os negócios."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (getAccessToken()) {
      void loadBusinesses();
    } else {
      setLoading(false);
    }
  }, []);

  async function saveModules(
    business: Business,
    modules: ModuleName[]
  ) {
    setSavingId(business.id);
    setError("");
    setSuccess("");

    try {
      await apiFetch(
        `/api/v1/super-admin/businesses/${business.id}/modules`,
        {
          method: "PATCH",
          body: JSON.stringify({ modules }),
        }
      );

      setBusinesses((current) =>
        current.map((item) =>
          item.id === business.id
            ? { ...item, modules }
            : item
        )
      );

      setSuccess(`Módulos de ${business.name} actualizados.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível actualizar os módulos."
      );
    } finally {
      setSavingId(null);
    }
  }

  function toggleModule(
    business: Business,
    module: ModuleName
  ) {
    const current = normalizeModules(business.modules);

    const next = current.includes(module)
      ? current.filter((item) => item !== module)
      : [...current, module];

    void saveModules(business, next);
  }

  if (!getAccessToken()) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-7 text-center">
          <h1 className="text-2xl font-black mb-3">
            Gestão de módulos
          </h1>

          <p className="text-zinc-400 text-sm mb-6">
            Entra primeiro no painel do Super Admin para gerir os módulos dos negócios.
          </p>

          <Link
            to="/super-admin"
            className="inline-block bg-emerald-500 px-5 py-3 rounded-xl font-bold"
          >
            Abrir Super Admin
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-5 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black">
              MARKA<span className="text-emerald-500">.</span> MÓDULOS
            </h1>

            <p className="text-zinc-400 text-sm mt-1">
              Controla as funcionalidades disponíveis em cada negócio.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/super-admin"
              className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
            >
              Voltar ao painel
            </Link>

            <button
              onClick={() => {
                setAccessToken(null);
                window.location.href = "/super-admin";
              }}
              className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm"
            >
              Sair
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 mb-5 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl p-4 mb-5 text-sm">
            {success}
          </div>
        )}

        {loading ? (
          <p className="text-zinc-400">A carregar negócios...</p>
        ) : (
          <div className="space-y-5">
            {businesses.map((business) => {
              const enabled = normalizeModules(business.modules);
              const saving = savingId === business.id;

              return (
                <section
                  key={business.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div>
                      <h2 className="text-lg font-bold">
                        {business.name}
                      </h2>

                      <p className="text-xs text-zinc-500 mt-1">
                        /{business.slug}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        business.active
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {business.active
                        ? "Negócio activo"
                        : "Negócio bloqueado"}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    {moduleOptions.map((option) => {
                      const checked = enabled.includes(option.id);

                      return (
                        <button
                          key={option.id}
                          type="button"
                          disabled={saving || !business.active}
                          onClick={() =>
                            toggleModule(business, option.id)
                          }
                          className={`text-left rounded-xl border p-4 transition-colors disabled:opacity-50 ${
                            checked
                              ? "border-emerald-500/50 bg-emerald-500/10"
                              : "border-zinc-700 bg-zinc-950 hover:border-zinc-500"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-bold">
                              {option.title}
                            </span>

                            <span
                              className={`text-xs font-bold ${
                                checked
                                  ? "text-emerald-400"
                                  : "text-zinc-500"
                              }`}
                            >
                              {checked ? "Activo" : "Desactivado"}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {saving && (
                    <p className="text-xs text-zinc-400 mt-3">
                      A guardar alterações...
                    </p>
                  )}
                </section>
              );
            })}

            {businesses.length === 0 && (
              <p className="text-zinc-400 text-sm">
                Ainda não existem negócios registados.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
