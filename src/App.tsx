import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "./components/AppSidebar";
import Index from "./pages/Index";
import LiveScores from "./pages/LiveScores";
import News from "./pages/News";
import Predictions from "./pages/Predictions";
import Quizzes from "./pages/Quizzes";
import Chat from "./pages/Chat";
import Leagues from "./pages/Leagues";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <main className="flex-1">
              <header className="h-12 flex items-center border-b border-border bg-card/50 backdrop-blur">
                <SidebarTrigger className="ml-4" />
              </header>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/live-scores" element={<LiveScores />} />
                <Route path="/news" element={<News />} />
                <Route path="/predictions" element={<Predictions />} />
                <Route path="/quizzes" element={<Quizzes />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/leagues" element={<Leagues />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
