import { useState, useRef, useEffect } from "react";
import { Send, Lock, Loader2, Bot, CheckCircle2, ShieldAlert } from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  type?: "password" | "category" | "title" | "content" | "link" | "success" | "error";
  options?: string[];
}

export function AddBlogChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "bot",
      text: "Welcome to the Antigravity CMS! Please enter the global Admin Password to authenticate.",
      type: "password"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Collected CMS Payload State
  const [password, setPassword] = useState("");
  const [blogData, setBlogData] = useState({ title: "", content: "", category: "", link: "" });

  const currentExpectedType = messages[messages.length - 1]?.sender === "bot" 
    ? messages[messages.length - 1].type 
    : undefined;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addBotMessage = (text: string, type?: Message["type"], options?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Math.random().toString(), sender: "bot", text, type, options }]);
      setIsTyping(false);
    }, 600);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Display user message
    setMessages(prev => [
      ...prev, 
      { id: Math.random().toString(), sender: "user", text: currentExpectedType === "password" ? "••••••••" : text }
    ]);
    setInputValue("");

    // Process State Machine Response
    switch (currentExpectedType) {
      case "password":
        setIsSubmitting(true);
        // Call the backend just to verify auth. If it's valid, it passes 401 and hits 400 (missing blog fields), which is acceptable for verification!
        try {
          const checkRes = await fetch("/.netlify/functions/save-blog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: text.trim(), blogData: null }),
          });
          
          setIsSubmitting(false);

          if (checkRes.status === 401) {
            addBotMessage("Invalid Password. Access denied.", "error");
            return; // stop execution, do not proceed!
          }
          
          // Password passed the 401 check!
          setPassword(text.trim());
          addBotMessage("Authentication provisionally accepted. What type of post are you adding?", "category", ["Notes", "Thoughts", "Books", "Links"]);
        } catch (err) {
          setIsSubmitting(false);
          addBotMessage("Network Error: Could not reach the authentication server.", "error");
        }
        break;

      case "category":
        setBlogData(prev => ({ ...prev, category: text.trim() }));
        addBotMessage(`Selected ${text}. What is the title of the post?`, "title");
        break;

      case "title":
        setBlogData(prev => ({ ...prev, title: text.trim() }));
        addBotMessage("Great title. Please enter the main content/text for this post.", "content");
        break;

      case "content":
        setBlogData(prev => ({ ...prev, content: text.trim() }));
        addBotMessage("Content formatted. Finally, do you have an optional URL link to attach? (If no, type 'none')", "link");
        break;

      case "link":
        const linkVal = text.toLowerCase() === "none" ? "" : text.trim();
        const payloadPost = { ...blogData, link: linkVal };
        setBlogData(payloadPost);
        
        // Initiate Pipeline Upload
        await triggerPipelineUpload(password, payloadPost);
        break;

      default:
        break;
    }
  };

  const triggerPipelineUpload = async (authPass: string, finalData: any) => {
    setIsSubmitting(true);
    setMessages(prev => [...prev, { 
      id: "loading", 
      sender: "bot", 
      text: "Initiating Antigravity Pipeline... Committing to GitHub & Deploying to Netlify." 
    }]);

    try {
      const response = await fetch("/.netlify/functions/save-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: authPass, blogData: finalData }),
      });

      const result = await response.json();

      setMessages(prev => prev.filter(m => m.id !== "loading")); // remove load message

      if (response.ok) {
        setMessages(prev => [...prev, { 
          id: "success", 
          sender: "bot", 
          text: "Success! The code was successfully committed. Netlify is currently redeploying the site and the changes will be live shortly.",
          type: "success" 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          id: "fail", 
          sender: "bot", 
          text: `Upload Failed: ${result.error}`,
          type: "error" 
        }]);
      }
    } catch (err: any) {
      setMessages(prev => prev.filter(m => m.id !== "loading"));
      setMessages(prev => [...prev, { 
        id: "fail", 
        sender: "bot", 
        text: `Network Error: Could not reach the Netlify Function. Ensure local dev server is running properly or check your connection.`,
        type: "error" 
      }]);
    }

    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-lg h-[500px] border border-border/50 bg-card rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="text-primary w-5 h-5" />
          <h3 className="font-heading font-medium text-sm">CMS Antigravity Engine</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
          <Lock className="w-3 h-3 text-primary" /> Protected Node
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
              msg.sender === "user" 
                ? "bg-primary text-primary-foreground rounded-tr-sm" 
                : "bg-muted text-foreground rounded-tl-sm border border-border/50"
            }`}>
              
              {msg.type === "success" && <CheckCircle2 className="w-4 h-4 mb-2 text-green-500" />}
              {msg.type === "error" && <ShieldAlert className="w-4 h-4 mb-2 text-destructive" />}

              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              
              {/* Render quick options if bot provides them */}
              {msg.options && msg.sender === "bot" && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {msg.options.map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleSend(opt)}
                      className="text-xs px-3 py-1.5 rounded-full border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm px-4 py-3 border border-border/50">
               <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50 bg-muted/10">
        <div className="flex items-end gap-2 px-3 py-2 bg-background border border-border/50 rounded-xl focus-within:border-primary/50 transition-colors">
          {currentExpectedType === "content" ? (
             <textarea
              className="flex-1 bg-transparent border-none text-sm focus:outline-none resize-none max-h-[120px]"
              rows={3}
              placeholder="Type markdown or text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting || isTyping}
             />
          ) : (
             <input
              type={currentExpectedType === "password" ? "password" : "text"}
              className="flex-1 bg-transparent border-none text-sm focus:outline-none min-h-[40px]"
              placeholder="Type your response..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting || isTyping}
            />
          )}
          
          <button 
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim() || isSubmitting || isTyping}
            className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors mb-0.5"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
