import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import OfflineBanner from "@/components/OfflineBanner";
import Index from "./pages/Index";
import GradePage from "./pages/GradePage";
import CorpsMetierPage from "./pages/CorpsMetierPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PendingRequestPage from "./pages/PendingRequestPage";
import AnnoncesPage from "./pages/AnnoncesPage";
import AnnonceDetailPage from "./pages/AnnonceDetailPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminSetupPage from "./pages/admin/AdminSetupPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminAdhesions from "./pages/admin/AdminAdhesions";
import AdminAnnonces from "./pages/admin/AdminAnnonces";
import AdminRoute from "./components/AdminRoute";
import NotFound from "./pages/NotFound";
import { initOfflineSync } from "@/lib/offline-sync";
import { toast } from "@/hooks/use-toast";

const queryClient = new QueryClient();

const ConditionalNavbar = () => {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;
  return <Navbar />;
};

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
          <ConditionalNavbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/grade/:grade" element={<GradePage />} />
            <Route path="/corps/:corpsId" element={<CorpsMetierPage />} />
            <Route path="/corps/:corpsId/:grade" element={<CorpsMetierPage />} />
            <Route path="/inscription" element={<RegisterPage />} />
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
            <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
            <Route path="/demande-en-cours" element={<PendingRequestPage />} />
            <Route path="/annonces" element={<AnnoncesPage />} />
            <Route path="/annonces/:id" element={<AnnonceDetailPage />} />

            {/* Admin */}
            <Route path="/admin/connexion" element={<AdminLoginPage />} />
            <Route path="/admin/setup" element={<AdminSetupPage />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminAdhesions />} />
              <Route path="adhesions" element={<AdminAdhesions />} />
              <Route path="annonces" element={<AdminAnnonces />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
