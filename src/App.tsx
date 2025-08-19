import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { EnhancedNavigation } from "./components/EnhancedNavigation";
import SmartNotifications from "./components/SmartNotifications";
import Index from "./pages/Index";
import LiveScores from "./pages/LiveScores";
import News from "./pages/News";
import Predictions from "./pages/Predictions";
import Quizzes from "./pages/Quizzes";
import Chat from "./pages/Chat";
import Community from "./pages/Community";
import Leagues from "./pages/Leagues";
import Affiliates from "./pages/Affiliates";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <EnhancedNavigation />
            <SmartNotifications />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/live-scores" element={<LiveScores />} />
                <Route path="/news" element={<News />} />
                <Route path="/predictions" element={<Predictions />} />
                <Route path="/quizzes" element={<Quizzes />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/community" element={<Community />} />
                <Route path="/leagues" element={<Leagues />} />
                <Route path="/affiliates" element={<Affiliates />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/auth" element={<Auth />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
