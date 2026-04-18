import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import AllProjects from "./pages/AllProjects.tsx";
import ProjectDetail from "./pages/ProjectDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import Blog from "./pages/Blog.tsx";
import ChatAssistant from "./components/portfolio/ChatAssistant.tsx";
import CursorGlow from "./components/ui/CursorGlow";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "./hooks/useAuth";
import { CMSProvider } from "./context/CMSContext";
import { AdminAuth } from "./components/blog/AdminAuth.tsx";
import EdgeRopeLight from "./components/portfolio/EdgeRopeLight";
import GlobalTextEffector from "./components/portfolio/GlobalTextEffector";
import GlobalScrollReveal from "./components/portfolio/GlobalScrollReveal";
import { useState } from "react";

const queryClient = new QueryClient();

// Global wrapper that provides the auth lock button available on every page
function AppShell() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <BrowserRouter>
      {/* Global Cursor Ambient Glow */}
      <CursorGlow />

      {/* Global Dynamic Text Interaction */}
      <GlobalTextEffector />

      {/* Global Scroll Reveal Animation */}
      <GlobalScrollReveal />

      {/* Global Seamless Rope Light Layer */}
      <EdgeRopeLight />

      {/* Global floating lock — visible on every page */}
      <AdminAuth isAdmin={isAdmin} setIsAdmin={setIsAdmin} />

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/projects" element={<AllProjects />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ChatAssistant />
    </BrowserRouter>
  );
}

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <AuthProvider>
      <CMSProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppShell />
          </TooltipProvider>
        </QueryClientProvider>
      </CMSProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
