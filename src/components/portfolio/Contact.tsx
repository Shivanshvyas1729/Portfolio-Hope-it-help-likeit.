import { portfolioData as initialData } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import AnimatedSection from "./AnimatedSection";
import { Mail, Phone, Linkedin, Github, Send, Loader2, CheckCircle } from "lucide-react";
import { useState, FormEvent, useRef, useMemo } from "react";

const Contact = () => {
  const personal = useCMSData(d => d.personal) || initialData.personal;
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message
        })
      });

      if (response.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const links = useMemo(() => {
    const p = personal || initialData.personal;
    return [
      p.email && { icon: Mail, label: p.email, href: `mailto:${p.email}` },
      p.phone && { icon: Phone, label: p.phone, href: `tel:${p.phone}` },
      p.linkedin && { icon: Linkedin, label: "LinkedIn", href: p.linkedin },
      p.github && { icon: Github, label: "GitHub", href: p.github },
    ].filter(Boolean) as { icon: typeof Mail; label: string; href: string }[];
  }, [personal]);

  return (
    <section id="contact" className="section-padding">
      <div className="container mx-auto">
        <AnimatedSection>
          <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-2">Contact</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Let's <span className="gradient-text">Connect</span>
          </h3>
          <p className="text-muted-foreground max-w-xl mb-12">
            Let's build something impactful together.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <AnimatedSection>
            <div className="space-y-3 md:space-y-4">
              {links.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card-hover p-3 md:p-4 flex items-center gap-3 md:gap-4 group"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm truncate">{label}</span>
                </a>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <form ref={formRef} onSubmit={handleSubmit} className="glass-card p-4 md:p-6 space-y-4">
              {(["name", "email"] as const).map((field) => (
                <div key={field}>
                  <label className="text-sm text-muted-foreground capitalize mb-1 block">{field}</label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    required
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100"
              >
                {status === "sending" && <><Loader2 size={16} className="animate-spin" /> Sending...</>}
                {status === "sent" && <><CheckCircle size={16} /> Sent Successfully!</>}
                {status === "error" && <>Failed to send. Try again.</>}
                {status === "idle" && <>Send Message <Send size={16} /></>}
              </button>
            </form>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Contact;
