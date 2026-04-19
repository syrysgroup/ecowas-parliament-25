import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface SEOProps {
  pagePath?: string;
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
  schemaType?: "WebPage" | "Event" | "Organization" | "Article";
  schemaData?: Record<string, unknown>;
}

function setMeta(name: string, content: string, isProperty = false) {
  const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    if (isProperty) el.setAttribute("property", name);
    else el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setSchema(data: Record<string, unknown>) {
  const id = "schema-org-script";
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.setAttribute("type", "application/ld+json");
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function SEOHead({
  pagePath,
  title: propTitle,
  description: propDescription,
  ogTitle: propOgTitle,
  ogDescription: propOgDescription,
  ogImage: propOgImage,
  canonical: propCanonical,
  noindex: propNoindex,
  schemaType,
  schemaData,
}: SEOProps) {
  const { get: getSetting } = useSiteSettings();
  const siteName = getSetting("site_name", "ECOWAS Parliament Initiatives");
  const defaultOgImage = getSetting("og_image_url", "");

  // Fetch from seo_pages table if pagePath provided
  const { data: dbSeo } = useQuery({
    queryKey: ["seo-page", pagePath ?? ""],
    queryFn: async () => {
      if (!pagePath) return null;
      const { data } = await supabase
        .from("seo_pages")
        .select("*")
        .eq("page_path", pagePath)
        .maybeSingle();
      return data;
    },
    enabled: !!pagePath,
    staleTime: 5 * 60 * 1000,
  });

  // Resolve: prop > DB > defaults
  const title       = propTitle       ?? dbSeo?.title          ?? siteName;
  const description = propDescription ?? dbSeo?.meta_description ?? "";
  const ogTitle     = propOgTitle     ?? dbSeo?.og_title        ?? title;
  const ogDesc      = propOgDescription ?? dbSeo?.og_description ?? description;
  const ogImage     = propOgImage     ?? defaultOgImage;
  const canonical   = propCanonical   ?? dbSeo?.canonical_url   ?? (typeof window !== "undefined" ? window.location.href : "");
  const noindex     = propNoindex     ?? dbSeo?.noindex         ?? false;

  useEffect(() => {
    const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
    document.title = fullTitle;

    if (description) setMeta("description", description);
    setMeta("og:title",       ogTitle, true);
    setMeta("og:description", ogDesc,  true);
    setMeta("og:site_name",   siteName, true);
    setMeta("og:type",        "website", true);
    if (ogImage) setMeta("og:image", ogImage, true);
    if (canonical) setLink("canonical", canonical);
    setMeta("twitter:card",        "summary_large_image");
    setMeta("twitter:title",       ogTitle);
    setMeta("twitter:description", ogDesc);
    if (ogImage) setMeta("twitter:image", ogImage);
    setMeta("robots", noindex ? "noindex,nofollow" : "index,follow");

    // Schema.org
    if (schemaType) {
      const base: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": schemaType,
        "name": ogTitle,
        "description": ogDesc,
        "url": canonical,
        ...(ogImage ? { "image": ogImage } : {}),
        ...(schemaData ?? {}),
      };
      setSchema(base);
    }
  }, [title, description, ogTitle, ogDesc, ogImage, canonical, noindex, siteName, schemaType, schemaData]);

  return null;
}

// ─── Google Analytics injection ───────────────────────────────────────────────
export function GoogleAnalyticsHead() {
  const { get } = useSiteSettings();
  const gaId  = get("ga_tracking_id", "");
  const gtmId = get("gtm_id", "");

  useEffect(() => {
    if (gaId && !document.getElementById("ga-script")) {
      const s = document.createElement("script");
      s.id    = "ga-script";
      s.async = true;
      s.src   = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(s);

      const inline = document.createElement("script");
      inline.id      = "ga-inline";
      inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`;
      document.head.appendChild(inline);
    }

    if (gtmId && !document.getElementById("gtm-script")) {
      const s = document.createElement("script");
      s.id = "gtm-script";
      s.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;
      document.head.insertBefore(s, document.head.firstChild);
    }
  }, [gaId, gtmId]);

  return null;
}
