import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, ExternalLink } from "lucide-react";
import { getChatResponse } from "@/services/chatService";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "bot";
  content: string;
}

const QUICK_BUTTONS = [
  "Show me your projects",
  "What skills do you have?",
  "Tell me about your experience",
  "How can I contact you?",
];

/** Renders markdown-style **bold**, bullet points, and [text](url) links */
const renderContent = (text: string) => {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Render inline: bold + links
    const renderInline = (str: string) => {
      const parts = str.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
      return parts.map((part, j) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          return (
            <a key={j} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5 hover:opacity-80">
              {linkMatch[1]}<ExternalLink size={10} />
            </a>
          );
        }
        return <span key={j}>{part}</span>;
      });
    };

    if (line.startsWith("• ") || line.startsWith("- ")) {
      return <li key={i} className="ml-3 list-disc">{renderInline(line.slice(2))}</li>;
    }
    if (line.trim() === "") return <br key={i} />;
    return <p key={i}>{renderInline(line)}</p>;
  });
};

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hi! I'm an AI assistant for this portfolio. Ask me about projects, skills, experience, or anything else!" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsTyping(true);
    try {
      const response = await getChatResponse(text);
      setMessages(prev => [...prev, { role: "bot", content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", content: "Sorry, I'm having trouble right now. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-[360px] max-w-[calc(100vw-32px)] h-[520px] max-h-[calc(100vh-120px)] bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-primary/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI Portfolio Assistant</p>
                  <p className="text-[10px] text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary border border-primary/20"}`}>
                    {m.role === "user" ? <User size={13} /> : <Bot size={13} />}
                  </div>
                  <div className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed space-y-1 ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted/60 text-foreground rounded-tl-none border border-border/40"
                  }`}>
                    {m.role === "bot" ? renderContent(m.content) : m.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 flex-row">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <Loader2 size={13} className="animate-spin" />
                  </div>
                  <div className="bg-muted/60 border border-border/40 px-3 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                    {[0, 1, 2].map(d => (
                      <span key={d} className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick suggestions — visible only at the start */}
            {messages.length === 1 && !isTyping && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_BUTTONS.map(btn => (
                  <button key={btn} onClick={() => handleSend(btn)}
                    className="text-[10px] px-2.5 py-1 rounded-full border border-primary/25 text-primary bg-primary/5 hover:bg-primary/15 transition-colors">
                    {btn}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border/50">
              <form onSubmit={e => { e.preventDefault(); handleSend(input); }} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about projects, skills..."
                  className="flex-1 bg-muted/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/60 transition-all"
                />
                <button type="submit" disabled={!input.trim() || isTyping}
                  className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center disabled:opacity-40 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all shrink-0">
                  <Send size={15} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-[0_0_30px_rgba(59,130,246,0.45)] flex items-center justify-center z-50 transition-shadow hover:shadow-[0_0_45px_rgba(59,130,246,0.65)]"
        aria-label="Toggle AI Chat"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={isOpen ? "x" : "chat"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default ChatAssistant;
