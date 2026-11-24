import { Link, useParams } from "react-router-dom";
import SiteLayout, { PageHero } from "./SiteLayout";
import { usePublicSite } from "./usePublicSite";

export default function BlogPostPage() {
  const { postSlug = "" } = useParams();
  const { slug, business, content, loading, primary, secondary } = usePublicSite();

  if (loading || !business) {
    return (
      <div style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        A carregar...
      </div>
    );
  }

  const post = (content.posts || []).find((p) => p.slug === postSlug);

  if (!post) {
    return (
      <SiteLayout business={business} content={content} primary={primary} secondary={secondary}>
        <div className="sl-wrap" style={{ padding: "80px 0", textAlign: "center" }}>
          <h1 className="sl-serif">Artigo não encontrado</h1>
          <Link to={`/${slug}/blog`} style={{ color: primary }}>Voltar ao blog</Link>
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
      title={`${post.title} | ${business.name}`}
    >
      <PageHero kicker="Artigo" title={post.title} subtitle={post.excerpt} primary={primary} />
      <section style={{ padding: "56px 0" }}>
        <div className="sl-wrap" style={{ maxWidth: 720 }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #EDE6DF",
              padding: 32,
              lineHeight: 1.8,
              color: "#3d3632",
              fontSize: 15,
              whiteSpace: "pre-line",
            }}
          >
            {post.body}
          </div>
          <p style={{ marginTop: 24 }}>
            <Link to={`/${slug}/blog`} style={{ color: primary, fontWeight: 600 }}>
              ← Todos os artigos
            </Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}