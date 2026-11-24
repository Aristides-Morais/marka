import SiteLayout, { PageHero } from "./SiteLayout";
import { usePublicSite } from "./usePublicSite";

export default function TestimonialsPage() {
  const { business, content, loading, primary, secondary } = usePublicSite();

  if (loading || !business) {
    return (
      <div style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        A carregar...
      </div>
    );
  }

  const list = content.testimonials || [];

  return (
    <SiteLayout
      business={business}
      content={content}
      primary={primary}
      secondary={secondary}
      title={`${content.testimonialsTitle || "Depoimentos"} | ${business.name}`}
    >
      <PageHero
        kicker="Opiniões reais"
        title={content.testimonialsTitle || "Depoimentos"}
        subtitle="Quem já confiou em nós conta a experiência."
        primary={primary}
      />

      <section style={{ padding: "72px 0" }}>
        <div className="sl-wrap">
          <div
            style={{
              display: "grid",
              gap: 24,
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            }}
          >
            {list.map((t) => (
              <blockquote
                key={t.id}
                className="sl-card"
                style={{
                  margin: 0,
                  background: "#fff",
                  border: "1px solid #EDE6DF",
                  padding: 28,
                  borderTop: `3px solid ${secondary}`,
                }}
              >
                {t.rating ? (
                  <div style={{ color: secondary, letterSpacing: 2, marginBottom: 12, fontSize: 14 }}>
                    {"★".repeat(Math.min(5, t.rating))}
                  </div>
                ) : null}
                <p style={{ margin: "0 0 20px", lineHeight: 1.7, color: "#3d3632", fontSize: 15 }}>
                  “{t.text}”
                </p>
                <footer style={{ fontSize: 13 }}>
                  <strong>{t.name}</strong>
                  {t.role ? <span style={{ color: "#8a817a" }}> · {t.role}</span> : null}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}