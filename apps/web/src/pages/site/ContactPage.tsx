import SiteLayout, { PageHero } from "./SiteLayout";
import { usePublicSite } from "./usePublicSite";
import { normalizeUrl } from "../../lib/theme";

export default function ContactPage() {
  const { business, content, loading, primary, secondary } = usePublicSite();

  if (loading || !business) {
    return (
      <div style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        A carregar...
      </div>
    );
  }

  const phoneClean = (business.phone || "").replace(/\D/g, "");
  const wa = phoneClean ? `https://wa.me/${phoneClean}` : null;

  return (
    <SiteLayout
      business={business}
      content={content}
      primary={primary}
      secondary={secondary}
      title={content.seo?.contact?.title || `Contactos | ${business.name}`}
    >
      <PageHero
        kicker="Fale connosco"
        title={content.contactTitle || "Contactos"}
        subtitle={content.contactIntro}
        primary={primary}
      />

      <section style={{ padding: "64px 0" }}>
        <div
          className="sl-wrap"
          style={{
            display: "grid",
            gap: 32,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          <div style={{ background: "#fff", border: "1px solid #EDE6DF", padding: 28 }}>
            <h3 className="sl-serif" style={{ margin: "0 0 16px", fontSize: 22 }}>Dados</h3>
            {business.phone && (
              <p style={{ margin: "0 0 10px", fontSize: 15 }}>
                <strong>Telefone:</strong>{" "}
                <a href={`tel:${business.phone}`} style={{ color: primary }}>{business.phone}</a>
              </p>
            )}
            {business.address && (
              <p style={{ margin: "0 0 10px", fontSize: 15 }}>
                <strong>Morada:</strong> {business.address}
              </p>
            )}
            {content.hours && (
              <p style={{ margin: "0 0 10px", fontSize: 15 }}>
                <strong>Horário:</strong> {content.hours}
              </p>
            )}
            {business.mapsUrl && (
              <p style={{ margin: "0 0 10px", fontSize: 15 }}>
                <a href={normalizeUrl(business.mapsUrl)} target="_blank" rel="noreferrer" style={{ color: primary }}>
                  Ver no mapa →
                </a>
              </p>
            )}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="sl-btn"
                style={{ marginTop: 16, background: secondary, color: "#1a1412" }}
              >
                WhatsApp
              </a>
            )}
          </div>

          <div style={{ background: "#fff", border: "1px solid #EDE6DF", padding: 28 }}>
            <h3 className="sl-serif" style={{ margin: "0 0 12px", fontSize: 22 }}>Mensagem</h3>
            <p style={{ color: "#6b635e", fontSize: 14, lineHeight: 1.6, marginTop: 0 }}>
              Prefere escrever? Use o WhatsApp ou ligue-nos — respondemos no horário de funcionamento.
            </p>
            {business.links?.map((l, i) => (
              <p key={i} style={{ margin: "8px 0 0" }}>
                <a href={normalizeUrl(l.url)} target="_blank" rel="noreferrer" style={{ color: primary, fontSize: 14 }}>
                  {l.label}
                </a>
              </p>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}