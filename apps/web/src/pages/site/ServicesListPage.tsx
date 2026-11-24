import { Link } from "react-router-dom";
import SiteLayout, { PageHero } from "./SiteLayout";
import { usePublicSite, money } from "./usePublicSite";

export default function ServicesListPage() {
  const { slug, business, content, products, services, sector, loading, primary, secondary } =
    usePublicSite();

  if (loading || !business) {
    return (
      <div style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        A carregar...
      </div>
    );
  }

  const isService = sector === "beauty" || sector === "health" || sector === "services";
  const items = isService ? services : products;

  return (
    <SiteLayout
      business={business}
      content={content}
      primary={primary}
      secondary={secondary}
      title={content.seo?.services?.title || `Serviços | ${business.name}`}
    >
      <PageHero
        kicker={business.name}
        title={content.servicesTitle || "A nossa oferta"}
        subtitle={content.seo?.services?.description || "Conheça em detalhe o que temos para si."}
        primary={primary}
      />

      <section style={{ padding: "72px 0" }}>
        <div className="sl-wrap">
          {items.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6b635e" }}>
              Em breve publicaremos a lista completa. Contacte-nos para mais informações.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 24,
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              }}
            >
              {items.map((item: any) => (
                <article
                  key={item.id}
                  className="sl-card"
                  style={{ background: "#fff", border: "1px solid #EDE6DF", overflow: "hidden" }}
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: "100%", height: 200, objectFit: "cover" }}
                      loading="lazy"
                    />
                  )}
                  <div style={{ padding: 22 }}>
                    <h3 className="sl-serif" style={{ margin: "0 0 8px", fontSize: 22 }}>
                      {item.name}
                    </h3>
                    {item.description && (
                      <p style={{ margin: "0 0 14px", color: "#6b635e", fontSize: 14, lineHeight: 1.6 }}>
                        {item.description}
                      </p>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <strong style={{ color: primary, fontSize: 14 }}>{money(Number(item.price))}</strong>
                      {isService && item.durationMin ? (
                        <span style={{ fontSize: 12, color: "#8a817a" }}>{item.durationMin} min</span>
                      ) : null}
                    </div>
                    <Link
                      to={`/${slug}/servicos/${item.id}`}
                      className="sl-btn"
                      style={{ marginTop: 16, background: primary, color: "#fff", width: "100%" }}
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}