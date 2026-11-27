import { Link } from "react-router-dom";
import SiteLayout, { PageHero } from "./SiteLayout";
import { usePublicSite } from "./usePublicSite";
import PhotoEffect from "../../components/site/PhotoEffect";

export default function BlogPage() {
  const { slug, business, content, loading, primary, secondary } = usePublicSite();

  if (loading || !business) {
    return (
      <div style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        A carregar...
      </div>
    );
  }

  const posts: any[] = Array.isArray((content as any).blogPosts) ? (content as any).blogPosts : [];

  const fallback = [
    {
      id: "1",
      title: "Bem-vindo à nossa casa",
      excerpt: "Descubra a nossa história, os nossos sabores e o que nos torna especiais.",
      image: business.logoUrl || "",
      date: "Novidades",
    },
    {
      id: "2",
      title: "Os nossos pratos mais pedidos",
      excerpt: "Uma viagem pelos sabores que os nossos clientes mais amam.",
      image: "",
      date: "Destaques",
    },
  ];

  const list = posts.length > 0 ? posts : fallback;

  return (
    <SiteLayout
      business={business}
      content={content}
      primary={primary}
      secondary={secondary}
      title={`Blog | ${business.name}`}
    >
      <PageHero kicker="Histórias & Novidades" title="Blog" subtitle="Histórias, novidades e bastidores da nossa casa. Clique numa foto para ver em zoom." primary={primary} />

      <section style={{ padding: "56px 0" }}>
        <div className="sl-wrap">
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {list.map((post: any, i: number) => (
              <article key={post.id || i} className="sl-card" style={{ background: "#fff", border: "1px solid #EDE6DF", overflow: "hidden" }}>
                <div style={{ height: 220, background: "#f0ebe6", overflow: "hidden" }}>
                  {post.image || post.coverImage ? (
                    <PhotoEffect
                      src={post.image || post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      gallery={list.filter((x) => x.image || x.coverImage).map((x) => x.image || x.coverImage)}
                    />
                  ) : (
                    <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
                      <span className="sl-serif" style={{ fontSize: 48, opacity: 0.3, color: primary }}>{(post.title || "B").charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: 20 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 600, color: secondary }}>
                    {post.date || post.category || "Blog"}
                  </p>
                  <h3 className="sl-serif" style={{ margin: "0 0 10px", fontSize: 22, lineHeight: 1.3 }}>{post.title}</h3>
                  <p style={{ margin: "0 0 16px", color: "#6b635e", fontSize: 14, lineHeight: 1.6 }}>
                    {post.excerpt || post.description || ""}
                  </p>
                  {post.id && posts.length > 0 ? (
                    <Link to={`/${slug}/blog/${post.id}`} style={{ color: primary, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                      Ler mais →
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}