import { useEffect } from "react";
import { portfolioData as initialData } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

/**
 * Zero-dependency SEO manager using native DOM head mutations.
 * Fully reactive to CMS preview updates.
 */
const SEO = ({ title, description, image, url }: SEOProps) => {
  // Selector-based data consumption for SEO metadata
  const personal = useCMSData(d => d.personal) || initialData.personal;
  const heroDescription = useCMSData(d => d.hero?.description) || initialData.hero.description;
  const aboutDescription = useCMSData(d => d.about?.description) || initialData.about.description;

  const defaultTitle = `${personal?.name ?? "Portfolio"} | ${personal?.title ?? "Developer"}`;
  const defaultDesc = heroDescription || aboutDescription || "";
  const defaultImage = personal?.profileImage?.value || "";

  const seoTitle = title ? `${title} | ${personal?.name ?? "Portfolio"}` : defaultTitle;
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

    // Helpers for OG/Twitter tags
    const setMeta = (property: boolean, name: string, content: string) => {
      if (!content) return;
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };

    setMeta(true, "og:type", "website");
    setMeta(true, "og:url", currentUrl);
    setMeta(true, "og:title", seoTitle);
    setMeta(true, "og:description", seoDesc);
    if (seoImage) setMeta(true, "og:image", seoImage);

    setMeta(false, "twitter:card", "summary_large_image");
    setMeta(false, "twitter:url", currentUrl);
    setMeta(false, "twitter:title", seoTitle);
    setMeta(false, "twitter:description", seoDesc);
    if (seoImage) setMeta(false, "twitter:image", seoImage);

  }, [seoTitle, seoDesc, seoImage, currentUrl]);

  return null;
};

export default SEO;
