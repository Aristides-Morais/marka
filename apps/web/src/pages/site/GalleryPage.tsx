import { useMemo, useState } from "react";
import SiteLayout, { PageHero } from "./SiteLayout";
import { usePublicSite } from "./usePublicSite";
import PhotoEffect from "../../components/site/PhotoEffect";

export default function GaleriaPage() {
  const { business, content, loading, primary, secondary } = usePublicSite();
  const [filter, setFilter] = useState("Todos");

  const gallery = useMemo(() => {
    const g: any[] = Array.isArray((content as any).gallery) ? (content as any).gallery : [];
    return g.map((it: any, i: number) =>
      typeof it === "string"
        ? { image: it, title: `Momento ${i + 1}`, desc: "" }
        : { image: it.image, title: it.title || `Momento ${i + 1}`, desc: it.desc || "" }
    ).filter((x) => x.image);
  }, [content]);

  if (loading || !business) {
    return (
      <div style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        A carregar...
      </div>
    );
  }

  // Filtros simples - não muda a organização, só filtra
  const filters = ["Todos", ...Array.from(new Set(gallery.map((g) => g.title.split(" ")[0]).filter(Boolean))).slice(0, 4)];
  const filtered = filter === "Todos" ? gallery : gallery.filter((g) => g.title.startsWith(filter));

  return (
    <SiteLayout
      business={business}
      content={content}
      primary={primary}
      secondary={secondary}
      title={`Galeria | ${business.name}`}
    >
      <PageHero kicker="Momentos" title="Galeria" subtitle="Clique numa foto para ver em zoom, girar e passar para a próxima." primary={primary} />

      <section style={{ padding: "40px 0 56px" }}>
        <div className="sl-wrap">
          {gallery.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: f === filter ? `1px solid ${primary}` : "1px solid #EDE6DF",
                    background: f === filter ? primary : "#fff",
                    color: f === filter ? "#fff" : "#1a1412",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6b635e" }}>Em breve vamos publicar fotos aqui.</p>
          ) : (
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
              {filtered.map((item, i) => (
                <div key={i} className="sl-card" style={{ background: "#fff", border: "1px solid #EDE6DF", overflow: "hidden" }}>
                  <div style={{ height: 260, overflow: "hidden", background: "#f0ebe6" }}>
                    <PhotoEffect
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      gallery={filtered.map((x) => x.image)}
                    />
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{item.title}</p>
                    {item.desc && <p style={{ margin: "4px 0 0", color: "#6b635e", fontSize: 13, lineHeight: 1.5 }}>{item.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}