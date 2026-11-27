import { Link, useParams } from "react-router-dom";
import SiteLayout, { PageHero } from "./SiteLayout";
import { usePublicSite, money } from "./usePublicSite";

export default function ServiceDetailPage() {
  const { id = "" } = useParams();
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
  const pool: any[] = isService ? services : products;
  const item = pool.find((x) => x.id === id);

  if (!item) {
    return (
      <SiteLayout business={business} content={content} primary={primary} secondary={secondary}>
        <div className="sl-wrap" style={{ padding: "80px 0", textAlign: "center" }}>
          <h1 className="sl-serif">Não encontrado</h1>
          <p style={{ color: "#6b635e" }}>Este item não está disponível.</p>
          <Link to={`/${slug}/servicos`} className="sl-btn" style={{ background: primary, color: "#fff", marginTop: 16 }}>
            Voltar à lista
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout
      business={business}
      content={content}
      primary={primary}
      secondary={secondary}
      title={`${item.name} | ${business.name}`}
    >
      <PageHero kicker={isService ? "Serviço" : "Produto"} title={item.name} primary={primary} />

      <section style={{ padding: "64px 0" }}>
        <div
          className="sl-wrap"
          style={{
            display: "grid",
            gap: 40,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "#f0ebe6",
              minHeight: 280,
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
            }}
          >
            {item.imageUrl ? (
              <img
  src={item.imageUrl}
  alt={item.name}
  style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 280 }}
/>
            ) : (
              <span className="sl-serif" style={{ fontSize: 48, opacity: 0.3, color: primary }}>
                {item.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p style={{ color: "#6b635e", lineHeight: 1.75, fontSize: 15 }}>
              {item.description ||
                `Saiba mais sobre ${item.name} na ${business.name}. Fale connosco para esclarecer dúvidas ou marcar.`}
            </p>
            <p style={{ marginTop: 20 }}>
              <strong style={{ fontSize: 22, color: primary }}>{money(Number(item.price))}</strong>
              {isService && item.durationMin ? (
                <span style={{ marginLeft: 12, color: "#8a817a", fontSize: 14 }}>
                  · {item.durationMin} min
                </span>
              ) : null}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
              <Link to={`/${slug}/reservas`} className="sl-btn" style={{ background: primary, color: "#fff" }}>
                Marcar / Reservar
              </Link>
              <Link
                to={`/${slug}/contactos`}
                className="sl-btn"
                style={{ border: `1px solid ${primary}`, color: primary, background: "transparent" }}
              >
                Contactar
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}