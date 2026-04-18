import { portfolioData as initialData } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";

const SeoHead = () => {
  const personal = useCMSData(d => d.personal) || initialData.personal;
  // Metadata is handled by SEO.tsx which reacts to the same context.
  return null;
};

export default SeoHead;
