import { Outlet, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import SiteAnimationRuntime from "./motion/SiteAnimationRuntime";

export default function GlobalSiteLayout() {
  const { slug } = useParams();
  const [theme, setTheme] = useState<any>({});
  const [content, setContent] = useState<any>({});

  useEffect(() => {
    if (!slug) return;
    apiFetch<any>("/api/v1/business/info", { skipAuth: true, tenant: slug })
      .then((b) => setTheme(b?.theme || b || {}))
      .catch(() => {});
    apiFetch<any>("/api/v1/site-content", { skipAuth: true, tenant: slug })
      .then((r) => {
        const c = r?.content || r?.published || r?.data || r || {};
        setContent(c);
      })
      .catch(() => {});
  }, [slug]);

  const animFromContent = content?.animations || content?.animation || {};
  const animFromTheme = theme?.animation || theme?.animations || {};

  const experience = animFromContent.experience || animFromTheme.experience || "classic";
  const intensity = animFromContent.intensity || animFromTheme.intensity || "normal";
  const enabled = animFromContent.enabled ?? animFromTheme.enabled ?? true;
  const duration = animFromContent.duration || animFromTheme.duration || 800;
  const stagger = animFromContent.stagger || animFromTheme.stagger || 90;
  const parallax = animFromContent.parallax ?? animFromTheme.parallax ?? true;
  const hover = animFromContent.hover ?? animFromTheme.hover ?? true;

  // FIX: settings estável, só muda quando um valor muda de verdade
  const settings = useMemo(() => ({
    experience, intensity, enabled, duration, stagger, parallax, hover,
  }), [experience, intensity, enabled, duration, stagger, parallax, hover]);

  return (
    <div className="site-animation-root">
      <SiteAnimationRuntime settings={settings} />
      <Outlet />
    </div>
  );
}