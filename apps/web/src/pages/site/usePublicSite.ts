import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import {
  detectSector,
  mergeWithDefaults,
  type SiteContent,
  type Sector,
} from "../../lib/siteContent";

export type Business = {
  name: string;
  type?: string | null;
  template?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  address?: string | null;
  phone?: string | null;
  mapsUrl?: string | null;
  links?: { label: string; url: string }[];
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  storeHeroImage?: string | null;
  modules?: string[];
};

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
};

export type Service = {
  id: string;
  name: string;
  durationMin?: number;
  price: number;
};

export function usePublicSite() {
  const { slug = "" } = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [rawContent, setRawContent] = useState<SiteContent | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    async function load() {
      setLoading(true);
      try {
        const [b, site, p, s] = await Promise.all([
          apiFetch<Business>("/api/v1/business/info", {
            skipAuth: true,
            tenant: slug,
          }),
          apiFetch<{ isPublished: boolean; content: SiteContent | null }>(
            "/api/v1/site-content",
            { skipAuth: true, tenant: slug }
          ),
          apiFetch<Product[]>("/api/v1/products", {
            skipAuth: true,
            tenant: slug,
          }).catch(() => []),
          apiFetch<Service[]>("/api/v1/reservations/services", {
            skipAuth: true,
            tenant: slug,
          }).catch(() => []),
        ]);
        if (!live) return;
        setBusiness(b);
        setRawContent(
          site?.isPublished && site.content ? site.content : null
        );
        setProducts(Array.isArray(p) ? p : []);
        setServices(Array.isArray(s) ? s : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (live) setLoading(false);
      }
    }
    if (slug) load();
    return () => {
      live = false;
    };
  }, [slug]);

  const sector: Sector = useMemo(
    () => detectSector(business?.type, business?.template),
    [business?.type, business?.template]
  );

  const content = useMemo(
    () => mergeWithDefaults(rawContent, sector, business?.name || ""),
    [rawContent, sector, business?.name]
  );

  const primary =
    content.visualIdentity?.primaryColor ||
    content.visualIdentity?.primary ||
    business?.primaryColor ||
    "#512638";
  const secondary =
    content.visualIdentity?.secondaryColor ||
    content.visualIdentity?.secondary ||
    business?.secondaryColor ||
    "#B99A75";

  return {
    slug,
    business,
    content,
    products,
    services,
    sector,
    loading,
    primary,
    secondary,
  };
}

export const money = (value: number) =>
  `${Number(value || 0).toLocaleString("pt-AO")} Kz`;