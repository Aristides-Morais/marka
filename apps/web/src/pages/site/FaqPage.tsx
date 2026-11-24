import { useState } from "react";
import SiteLayout, { PageHero } from "./SiteLayout";
import { usePublicSite } from "./usePublicSite";

export default function FaqPage() {
  const { business, content, loading, primary, secondary } = usePublicSite();
  const [openId, setOpenId] = useState<string | null>(null);

  if (loading || !business) {
    return (
      <div style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        A carregar...
      </div>
    );
  }

  const list = content.faq || [];

  return (
    <SiteLayout
      business={business}
      content={content}
      primary={primary}
      secondary={secondary}
      title={`${content.faqTitle || "FAQ"} | ${business.name}`}
    >
      <PageHero
        kicker="Ajuda"
        title={content.faqTitle || "Perguntas frequentes"}
        subtitle="Respostas rápidas às dúvidas mais comuns."
        primary={primary}
      />

      <section style={{ padding: "64px 0" }}>
        <div className="sl-wrap" style={{ maxWidth: 720 }}>
          {list.map((item) => {
            const open = openId === item.id;
            return (
              <div key={item.id} style={{ borderBottom: "1px solid #EDE6DF", padding: "18px 0" }}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : item.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    alignItems: "center",
                    padding: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1a1412",
                  }}
                >
                  {item.question}
                  <span style={{ color: primary, fontSize: 22, lineHeight: 1 }}>
                    {open ? "−" : "+"}
                  </span>
                </button>
                {open && (
                  <p style={{ margin: "12px 0 4px", color: "#5c534e", lineHeight: 1.7, fontSize: 14 }}>
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}