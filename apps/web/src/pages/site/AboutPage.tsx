import SiteLayout, { PageHero } from "./SiteLayout";
import { usePublicSite } from "./usePublicSite";

export default function AboutPage() {
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
      title={content.seo?.about?.title || `Sobre | ${business.name}`}
    >
      <PageHero
        kicker="Quem somos"
        title={content.aboutTitle || `Sobre a ${business.name}`}
        subtitle={content.seo?.about?.description}
        primary={primary}
      />

      <section style={{ padding: "72px 0" }}>
        <div
          className="sl-wrap"
          style={{
            display: "grid",
            gap: 40,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            alignItems: "start",
          }}
        >
          <div>
            <p style={{ whiteSpace: "pre-line", lineHeight: 1.8, color: "#5c534e", fontSize: 15, margin: 0 }}>
              {content.aboutText || content.description}
            </p>
          </div>
          <div style={{ display: "grid", gap: 20 }}>
            {content.aboutMission && (
              <div style={{ background: "#fff", border: "1px solid #EDE6DF", padding: 24 }}>
                <h3 className="sl-serif" style={{ margin: "0 0 8px", fontSize: 20 }}>Missão</h3>
                <p style={{ margin: 0, color: "#5c534e", lineHeight: 1.65, fontSize: 14 }}>{content.aboutMission}</p>
              </div>
            )}
            {content.aboutVision && (
              <div style={{ background: "#fff", border: "1px solid #EDE6DF", padding: 24 }}>
                <h3 className="sl-serif" style={{ margin: "0 0 8px", fontSize: 20 }}>Visão</h3>
                <p style={{ margin: 0, color: "#5c534e", lineHeight: 1.65, fontSize: 14 }}>{content.aboutVision}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {content.aboutValues && content.aboutValues.length > 0 && (
        <section style={{ padding: "0 0 72px" }}>
          <div className="sl-wrap">
            <h2 className="sl-serif" style={{ fontSize: 28, marginBottom: 28, textAlign: "center" }}>
              Os nossos valores
            </h2>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              {content.aboutValues.map((v) => (
                <div
                  key={v}
                  style={{
                    background: "#fff",
                    padding: "22px 20px",
                    border: "1px solid #EDE6DF",
                    borderTop: `3px solid ${secondary}`,
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {content.stats && content.stats.length > 0 && (
        <section style={{ background: primary, color: "#fff", padding: "56px 0" }}>
          <div
            className="sl-wrap"
            style={{
              display: "grid",
              gap: 24,
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              textAlign: "center",
            }}
          >
            {content.stats.map((s) => (
              <div key={s.label}>
                <div className="sl-serif" style={{ fontSize: 36, fontWeight: 600 }}>{s.value}</div>
                <div style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", opacity: 0.75, marginTop: 6 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}