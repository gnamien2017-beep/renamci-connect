import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import OfflineBanner from "@/components/OfflineBanner";
import Index from "./pages/Index";
import GradePage from "./pages/GradePage";
import CorpsMetierPage from "./pages/CorpsMetierPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import { initOfflineSync } from "@/lib/offline-sync";
import { toast } from "@/hooks/use-toast";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initOfflineSync({
      onSuccess: (count) => {
        toast({
          title: "Synchronisation terminée",
          description: `${count} profil${count > 1 ? "s" : ""} publié${count > 1 ? "s" : ""} en ligne.`,
        });
      },
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <OfflineBanner />
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/grade/:grade" element={<GradePage />} />
            <Route path="/corps/:corpsId" element={<CorpsMetierPage />} />
            <Route path="/corps/:corpsId/:grade" element={<CorpsMetierPage />} />
            <Route path="/inscription" element={<RegisterPage />} />
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
            <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
