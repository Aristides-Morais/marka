import { Link } from "react-router-dom";
import SiteLayout, { PageHero } from "./SiteLayout";
import { usePublicSite } from "./usePublicSite";

export default function BlogPage() {
  const { slug, business, content, loading, primary, secondary } = usePublicSite();

  if (loading || !business) {
    return (
      <div style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        A carregar...
      </div>
    );
  }

  const posts = content.posts || [];

  return (
    <SiteLayout
      business={business}
      content={content}
      primary={primary}
      secondary={secondary}
      title={`${content.blogTitle || "Recursos"} | ${business.name}`}
    >
      <PageHero
        kicker="Recursos"
        title={content.blogTitle || "Blog e materiais"}
        subtitle="Artigos e dicas úteis."
        primary={primary}
      />

      <section style={{ padding: "64px 0" }}>
        <div className="sl-wrap">
          <div
            style={{
              display: "grid",
              gap: 24,
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            {posts.map((p) => (
              <article
                key={p.id}
                className="sl-card"
                style={{ background: "#fff", border: "1px solid #EDE6DF", padding: 24 }}
              >
                <h3 className="sl-serif" style={{ margin: "0 0 10px", fontSize: 22 }}>{p.title}</h3>
                <p style={{ color: "#6b635e", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>
                  {p.excerpt}
                </p>
                <Link to={`/${slug}/blog/${p.slug}`} style={{ color: primary, fontSize: 13, fontWeight: 600 }}>
                  Ler mais →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}