import SiteLayout, { PageHero } from "./SiteLayout";
import { usePublicSite } from "./usePublicSite";

export default function TermsPage() {
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
      title={`${content.termsTitle || "Termos"} | ${business.name}`}
    >
      <PageHero kicker="Legal" title={content.termsTitle || "Termos de Uso"} primary={primary} />
      <section style={{ padding: "56px 0" }}>
        <div className="sl-wrap" style={{ maxWidth: 720 }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #EDE6DF",
              padding: 32,
              whiteSpace: "pre-line",
              lineHeight: 1.75,
              color: "#3d3632",
              fontSize: 15,
            }}
          >
            {content.termsBody}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}