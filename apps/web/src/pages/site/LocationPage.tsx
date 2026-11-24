import SiteLayout, { PageHero } from "./SiteLayout";
import { usePublicSite } from "./usePublicSite";
import { normalizeUrl } from "../../lib/theme";

export default function LocationPage() {
  const { business, content, loading, primary, secondary } = usePublicSite();

  if (loading || !business) {
    return (
      <div style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        A carregar...
      </div>
    );
  }

  return (
    <SiteLayout
      business={business}
      content={content}
      primary={primary}
      secondary={secondary}
      title={`Localização | ${business.name}`}
    >
      <PageHero
        kicker="Onde estamos"
        title="Localização"
        subtitle={business.address || "Visite-nos ou peça indicações."}
        primary={primary}
      />

      <section style={{ padding: "64px 0" }}>
        <div className="sl-wrap" style={{ display: "grid", gap: 28 }}>
          <div style={{ background: "#fff", border: "1px solid #EDE6DF", padding: 28 }}>
            {business.address && <p style={{ fontSize: 16, margin: "0 0 12px" }}>{business.address}</p>}
            {content.hours && <p style={{ color: "#6b635e", margin: "0 0 12px" }}>Horário: {content.hours}</p>}
            {business.phone && (
              <p style={{ margin: "0 0 16px" }}>
                <a href={`tel:${business.phone}`} style={{ color: primary }}>{business.phone}</a>
              </p>
            )}
            {business.mapsUrl && (
              <a
                href={normalizeUrl(business.mapsUrl)}
                target="_blank"
                rel="noreferrer"
                className="sl-btn"
                style={{ background: primary, color: "#fff" }}
              >
                Abrir no Google Maps
              </a>
            )}
          </div>
          {business.mapsUrl && (
            <div
              style={{
                border: "1px solid #EDE6DF",
                minHeight: 320,
                background: "#f0ebe6",
                display: "grid",
                placeItems: "center",
                color: "#8a817a",
                fontSize: 14,
              }}
            >
              <a href={normalizeUrl(business.mapsUrl)} target="_blank" rel="noreferrer" style={{ color: primary }}>
                Ver mapa interactivo →
              </a>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}