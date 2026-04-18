import { portfolioData as initialData } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";

const Footer = () => {
  const personal = useCMSData(d => d.personal) || initialData.personal;
  
  return (
    <footer className="border-t border-border py-8 px-4">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} {personal?.name || initialData.personal.name}. All rights reserved.
        </p>
        <div className="flex gap-4">
          {(personal?.github || initialData.personal.github) && (
            <a href={personal?.github || initialData.personal.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground text-sm transition-colors cursor-pointer">
              GitHub
            </a>
          )}
          {(personal?.linkedin || initialData.personal.linkedin) && (
            <a href={personal?.linkedin || initialData.personal.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground text-sm transition-colors cursor-pointer">
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
