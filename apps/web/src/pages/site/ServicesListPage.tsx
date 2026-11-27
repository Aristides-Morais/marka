import { Link } from "react-router-dom";
import SiteLayout, { PageHero } from "./SiteLayout";
import { usePublicSite, money } from "./usePublicSite";
import PhotoEffect from "../../components/site/PhotoEffect";

export default function ServicosPage() {
  const { slug, business, content, products, services, sector, loading, primary, secondary } = usePublicSite();

  if (loading || !business) {
    return (
      <div style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        A carregar...
      </div>
    );
  }

  const isService = sector === "beauty" || sector === "health" || sector === "services";
  const list: any[] = isService ? services : products;
  const title = isService ? "Serviços" : "Menu / Produtos";

  return (
    <SiteLayout
      business={business}
      content={content}
      primary={primary}
      secondary={secondary}
      title={`${title} | ${business.name}`}
    >
      <PageHero kicker={isService ? "O que fazemos" : "O nosso menu"} title={title} subtitle={content.servicesIntro || `Descubra ${title.toLowerCase()} na ${business.name}. Clique numa foto para ver em zoom e girar.`} primary={primary} />

      <section style={{ padding: "56px 0" }}>
        <div className="sl-wrap">
          {list.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6b635e" }}>Em breve vamos publicar novidades aqui.</p>
          ) : (
            <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
              {list.map((item: any) => (
                <Link
                  key={item.id}
                  to={`/${slug}/servicos/${item.id}`}
                  className="sl-card"
                  style={{ textDecoration: "none", color: "inherit", background: "#fff", border: "1px solid #EDE6DF", overflow: "hidden", display: "block" }}
                >
                  <div style={{ height: 220, background: "#f0ebe6", overflow: "hidden" }} onClick={(e) => e.preventDefault()}>
                    {item.imageUrl ? (
                      <PhotoEffect
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        gallery={list.filter((x) => x.imageUrl).map((x) => x.imageUrl)}
                      />
                    ) : (
                      <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
                        <span className="sl-serif" style={{ fontSize: 48, opacity: 0.3, color: primary }}>{item.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 20 }}>
                    <h3 className="sl-serif" style={{ margin: "0 0 8px", fontSize: 20 }}>{item.name}</h3>
                    <p style={{ margin: "0 0 12px", color: "#6b635e", fontSize: 14, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.description || ""}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <strong style={{ fontSize: 18, color: primary }}>{money(Number(item.price))}</strong>
                      <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 600, color: primary }}>Ver →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}