import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, UserPlus, Home, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchProfiles, type Profile } from "@/lib/supabase-helpers";
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
