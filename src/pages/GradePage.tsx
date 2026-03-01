import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProfiles, GRADE_LABELS, type Grade, type Profile } from "@/lib/supabase-helpers";
import ProfileCard from "@/components/ProfileCard";
import ProfileModal from "@/components/ProfileModal";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

const GradePage = () => {
  const { grade } = useParams<{ grade: string }>();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [page, setPage] = useState(1);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles", grade],
    queryFn: () => fetchProfiles(grade as Grade),
    enabled: !!grade,
  });

  const filtered = useMemo(() => {
    if (!profiles) return [];
    if (!search.trim()) return profiles;
    const q = search.toLowerCase();
    return profiles.filter(
      (p) =>
        p.nom.toLowerCase().includes(q) ||
        p.prenoms.toLowerCase().includes(q) ||
        p.contact?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.fonction?.toLowerCase().includes(q) ||
        p.profession?.toLowerCase().includes(q)
    );
  }, [profiles, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when search changes
  useMemo(() => setPage(1), [search]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-header py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-primary-foreground">
            {GRADE_LABELS[grade as Grade] || grade}
          </h1>
          <p className="text-primary-foreground/70 text-sm mt-1 font-sans">
            {profiles?.length ?? 0} membre{(profiles?.length ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-3xl mx-auto px-4 -mt-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, prénom, téléphone, email, fonction..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 text-base glass-card border-border shadow-md"
          />
        </div>
      </div>

      {/* Profiles grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground font-sans">
              {search ? "Aucun résultat trouvé." : "Aucun membre dans ce grade."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {paged.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onClick={() => setSelectedProfile(profile)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-sans text-muted-foreground px-3">
                  Page {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <ProfileModal
        profile={selectedProfile}
        open={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onProfileChanged={() => {
          setSelectedProfile(null);
          queryClient.invalidateQueries({ queryKey: ["profiles", grade] });
          queryClient.invalidateQueries({ queryKey: ["stats"] });
          queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
        }}
      />
    </div>
  );
};

export default GradePage;
