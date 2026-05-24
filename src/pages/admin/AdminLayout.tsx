import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Shield, Users, Megaphone, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLayout() {
  const navigate = useNavigate();
  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/admin/connexion"); };

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md font-sans text-sm transition ${
      isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-header py-6 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-primary-foreground flex items-center gap-2">
            <Shield className="w-6 h-6" /> Console Admin
          </h1>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="w-4 h-4 mr-1" /> Déconnexion
          </Button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <nav className="flex gap-2 mb-6 border-b border-border pb-3 flex-wrap">
          <NavLink to="/admin/adhesions" className={linkCls}><Users className="w-4 h-4" /> Demandes d'adhésion</NavLink>
          <NavLink to="/admin/annonces" className={linkCls}><Megaphone className="w-4 h-4" /> Annonces</NavLink>
        </nav>
        <Outlet />
      </div>
    </div>
  );
}
