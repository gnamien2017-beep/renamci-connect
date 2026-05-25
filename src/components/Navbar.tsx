import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, UserPlus, Home, X, LogIn, LogOut, MessageCircle, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchProfiles, type Profile } from "@/lib/supabase-helpers";
import { getSession, clearSession, useSessionListener, type MemberSession } from "@/lib/auth-session";
import { supabase } from "@/integrations/supabase/client";
import logoRenamci from "@/assets/logo-renamci.png";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import ProfileModal from "@/components/ProfileModal";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [session, setSessionState] = useState<MemberSession | null>(() => getSession());
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => useSessionListener(() => setSessionState(getSession())), []);

  // Compute unread messages for the logged-in member
  useEffect(() => {
    if (!session) { setUnreadCount(0); return; }
    let cancelled = false;
    const refresh = async () => {
      const { data: msgs } = await supabase.from("messages").select("id, profile_id");
      const { data: reads } = await supabase
        .from("message_reads").select("message_id").eq("profile_id", session.profileId);
      const readSet = new Set(((reads as any[]) ?? []).map((r) => r.message_id));
      const count = ((msgs as any[]) ?? []).filter((m) => m.profile_id !== session.profileId && !readSet.has(m.id)).length;
      if (!cancelled) setUnreadCount(count);
    };
    refresh();
    const channel = supabase
      .channel("nav-unread")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "message_reads" }, refresh)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [session]);

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  const { data: allProfiles } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: () => fetchProfiles(),
    enabled: searchOpen,
  });

  const results = useMemo(() => {
    if (!allProfiles || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allProfiles
      .filter(
        (p) =>
          p.nom.toLowerCase().includes(q) ||
          p.prenoms.toLowerCase().includes(q) ||
          p.contact?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.fonction?.toLowerCase().includes(q) ||
          p.ministere?.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [allProfiles, searchQuery]);

  return (
    <>
      <nav className="gradient-header sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo + title */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 shrink-0"
          >
            <img src={logoRenamci} alt="RENAMCI" className="w-8 h-8 object-contain" />
            <span className="font-serif font-bold text-primary-foreground text-lg hidden sm:inline">
              RENAMCI
            </span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </Button>

            {location.pathname !== "/" && (
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate("/")}
              >
                <Home className="w-5 h-5" />
              </Button>
            )}

            {session ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => navigate("/messagerie")}
                  title="Messagerie"
                >
                  <MessageCircle className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
                {session.is_admin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary-foreground hover:bg-primary-foreground/10"
                    onClick={() => navigate("/admin/demandes")}
                    title="Demandes d'adhésion"
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </Button>
                )}
                <span className="hidden md:inline text-primary-foreground/90 text-xs font-sans">
                  {session.prenoms}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={handleLogout}
                  title="Se déconnecter"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate("/connexion")}
                title="Se connecter"
              >
                <LogIn className="w-5 h-5" />
              </Button>
            )}

            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans gap-1.5 hidden sm:flex"
              onClick={() => navigate("/inscription")}
            >
              <UserPlus className="w-4 h-4" />
              S'inscrire
            </Button>
            <Button
              size="icon"
              className="bg-accent text-accent-foreground hover:bg-accent/90 sm:hidden"
              onClick={() => navigate("/inscription")}
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Global search dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-lg p-0 gap-0">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre (nom, prénom, fonction...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {searchQuery.trim() && results.length === 0 && (
              <p className="text-center text-muted-foreground py-8 font-sans text-sm">
                Aucun résultat trouvé.
              </p>
            )}
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                  setSelectedProfile(p);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-muted border-2 border-primary/20 overflow-hidden shrink-0 flex items-center justify-center">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">
                      {p.prenoms[0]}{p.nom[0]}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif font-semibold text-sm text-foreground truncate">
                    {p.prenoms} {p.nom}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.grade} {p.fonction ? `· ${p.fonction}` : ""}
                  </p>
                </div>
              </button>
            ))}
            {!searchQuery.trim() && (
              <p className="text-center text-muted-foreground py-8 font-sans text-sm">
                Tapez pour rechercher parmi tous les membres.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile modal from search */}
      <ProfileModal
        profile={selectedProfile}
        open={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onProfileChanged={() => setSelectedProfile(null)}
      />
    </>
  );
};

export default Navbar;
