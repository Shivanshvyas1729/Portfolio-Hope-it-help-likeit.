import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, ExternalLink, Trash2 } from "lucide-react";
import { getChatResponse } from "@/services/chatService";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

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

const renderContent = (text: string) => {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const renderInline = (str: string) => {
      const parts = str.split(/(\[.+?\]\(.+?\)|https?:\/\/[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}|\*\*.+?\*\*)/g);
      
      return parts.map((part, j) => {
        if (!part) return null;
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
        }
        const markdownLinkMatch = part.match(/^\[(.+?)\]\((.+?)\)$/);
        if (markdownLinkMatch) {
          return (
            <a key={j} href={markdownLinkMatch[2]} target="_blank" rel="noopener noreferrer"
              className="text-primary font-medium hover:underline inline-flex items-center gap-0.5 transition-all">
              {markdownLinkMatch[1]}<ExternalLink size={10} className="shrink-0" />
            </a>
          );
        }
        if (/^https?:\/\//.test(part)) {
          const cleanUrl = part.replace(/[.,!?;:]$/, "");
          const displayUrl = cleanUrl.replace(/^https?:\/\/(www\.)?/, "");
          return (
            <a key={j} href={cleanUrl} target="_blank" rel="noopener noreferrer"
              className="text-primary font-medium hover:underline inline-flex items-center gap-0.5 transition-all break-all">
              {displayUrl}<ExternalLink size={10} className="shrink-0 opacity-70" />
            </a>
          );
        }
        if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(part)) {
          return (
            <a key={j} href={`mailto:${part}`}
              className="text-primary font-medium hover:underline transition-all underline-offset-4">
              {part}
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
  const initialMessage: Message = { role: "bot", content: "Hi! I'm an AI assistant for this portfolio. Ask me about projects, skills, experience, or anything else!" };
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dimensions, setDimensions] = useState({ w: 360, h: 520 });
  const [isResizing, setIsResizing] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef({ active: false, startW: 0, startH: 0, startX: 0, startY: 0 });
  const dragControls = useDragControls();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const onResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsResizing(true);
    resizeRef.current = {
      active: true,
      startW: dimensions.w,
      startH: dimensions.h,
      startX: e.clientX,
      startY: e.clientY
    };
  };

  const onResizeMove = (e: React.PointerEvent) => {
    if (!resizeRef.current.active) return;
    const dx = resizeRef.current.startX - e.clientX;
    const dy = resizeRef.current.startY - e.clientY;
    const newW = Math.max(300, Math.min(600, resizeRef.current.startW + dx));
    const newH = Math.max(400, Math.min(800, resizeRef.current.startH + dy));
    setDimensions({ w: newW, h: newH });
  };

  const onResizeEnd = () => {
    resizeRef.current.active = false;
    setIsResizing(false);
  };

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

  const clearChat = () => {
    setMessages([initialMessage]);
  };

  const lastMessage = messages[messages.length - 1];
  const showSuggestions = !isTyping && lastMessage?.role === 'bot';

  return (
    <>
      {/* Drag Constraints Layer */}
      <div ref={constraintsRef} className="fixed inset-4 sm:inset-10 pointer-events-none z-[100]" />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={constraintsRef}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            style={{ 
              width: dimensions.w, 
              height: dimensions.h,
              position: 'fixed',
              bottom: 80,
              right: 24,
              zIndex: 101,
              originX: "calc(100% - 24px)",
              originY: "bottom"
            }}
            className="max-w-[calc(100vw-48px)] max-h-[calc(100vh-140px)] bg-background/95 backdrop-blur-3xl border border-border/60 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden pointer-events-auto select-none"
          >
            {/* Header - Drag Handle */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
              className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-primary/5 cursor-grab active:cursor-grabbing hover:bg-primary/10 transition-colors shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-primary/20 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                  <Bot size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground tracking-tight">AI Assistant</p>
                  <p className="text-[10px] text-green-500 font-medium flex items-center gap-1.5 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={clearChat}
                  title="Clear Chat"
                  className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-xl hover:bg-destructive/5"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-xl hover:bg-destructive/5"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className={`flex-1 flex flex-col overflow-hidden relative ${isResizing ? 'pointer-events-none' : ''}`}>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 scroll-smooth select-text">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary border border-primary/20"}`}>
                      {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed relative ${
                      m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted/40 text-foreground rounded-tl-sm border border-border/30"
                    }`}>
                      {m.role === "bot" ? renderContent(m.content) : m.content}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-8 h-8 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                      <Loader2 size={14} className="animate-spin" />
                    </div>
                    <div className="bg-muted/40 border border-border/30 px-4 py-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                      {[0, 1, 2].map(d => (
                        <span key={d} className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions nested inside scrollable area for better UX */}
                {showSuggestions && (
                  <div className="mt-2 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-1">
                    {QUICK_BUTTONS.map(btn => (
                      <button key={btn} onClick={() => handleSend(btn)}
                        className="text-[11px] px-3 py-1.5 rounded-xl border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 transition-all hover:scale-105 active:scale-95">
                        {btn}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border/40 bg-background/50">
                <form onSubmit={e => { e.preventDefault(); handleSend(input); }} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Message AI Assistant..."
                    className="flex-1 bg-muted/30 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                  />
                  <button type="submit" disabled={!input.trim() || isTyping}
                    className="w-11 h-11 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center disabled:opacity-30 hover:shadow-[0_8px_20px_rgba(59,130,246,0.3)] transition-all shrink-0 active:scale-90">
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>

            {/* Resize Indicator */}
            <div 
              onPointerDown={onResizeStart}
              onPointerMove={onResizeMove}
              onPointerUp={onResizeEnd}
              onPointerLeave={onResizeEnd}
              className="absolute top-0 left-0 w-8 h-8 cursor-nwse-resize z-20 group"
            >
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-primary/20 group-hover:border-primary group-hover:scale-110 transition-all rounded-tl-sm" />
              <div className="absolute top-3.5 left-3.5 w-1.5 h-1.5 bg-primary/10 rounded-full group-hover:bg-primary group-hover:scale-125 transition-all" />
              <div className="bg-primary/5 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-br-3xl" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-[0_10px_30px_rgba(59,130,246,0.5)] flex items-center justify-center z-[110] transition-shadow hover:shadow-[0_15px_40px_rgba(59,130,246,0.6)]"
      >
        <AnimatePresence mode="wait">
          <motion.div key={isOpen ? "o" : "c"} initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 45 }} transition={{ duration: 0.2 }}>
            {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default ChatAssistant;
;
