import { useEffect } from "react";
import { portfolioData } from "@/data/portfolioData";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

/**
 * Zero-dependency SEO manager using native DOM head mutations.
 * No external package required - works in any Vite/React SPA.
 * Drop-in compatible: if react-helmet-async is later installed, 
 * this component can be swapped without changing any page imports.
 */
const setMeta = (selector: string, attr: string, content: string) => {
  if (!content) return;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  el.setAttribute(attr === "name" ? "name" : "property", selector.match(/\[name="([^"]+)"\]/)?.[1] || selector.match(/\[property="([^"]+)"\]/)?.[1] || "");
  el.setAttribute("content", content);
};

const SEO = ({ title, description, image, url }: SEOProps) => {
  const defaultTitle = `${portfolioData?.personal?.name ?? "Portfolio"} | ${portfolioData?.personal?.title ?? "Developer"}`;
  const defaultDesc = portfolioData?.hero?.description || portfolioData?.about?.description || "";
  const defaultImage = portfolioData?.personal?.profileImage?.value || "";

  const seoTitle = title ? `${title} | ${portfolioData?.personal?.name ?? "Portfolio"}` : defaultTitle;
  const seoDesc = description || defaultDesc;
  const seoImage = image || defaultImage;
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  useEffect(() => {
    // Page title
    document.title = seoTitle;

    // Standard meta description
    let descEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!descEl) { descEl = document.createElement("meta"); descEl.setAttribute("name", "description"); document.head.appendChild(descEl); }
    descEl.setAttribute("content", seoDesc);

    // OG tags helper
    const setOG = (prop: string, content: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    const setTw = (name: string, content: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };

    setOG("og:type", "website");
    setOG("og:url", currentUrl);
    setOG("og:title", seoTitle);
    setOG("og:description", seoDesc);
    if (seoImage) setOG("og:image", seoImage);

    setTw("twitter:card", "summary_large_image");
    setTw("twitter:url", currentUrl);
    setTw("twitter:title", seoTitle);
    setTw("twitter:description", seoDesc);
    if (seoImage) setTw("twitter:image", seoImage);

    if (import.meta.env.DEV) {
      console.info(`🛡️ SEO: <title> → "${seoTitle}"`);
    }
  }, [seoTitle, seoDesc, seoImage, currentUrl]);

  return null; // No JSX needed - all mutations go directly to document.head
};

export default SEO;
