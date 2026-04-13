import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchProfilesByCorps,
  getCorpsById,
  GRADE_COLORS,
  type Grade,
  type Profile,
} from "@/lib/supabase-helpers";
import ProfileCard from "@/components/ProfileCard";
import ProfileModal from "@/components/ProfileModal";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

const CorpsMetierPage = () => {
  const { corpsId } = useParams<{ corpsId: string }>();
  const queryClient = useQueryClient();
  const corps = getCorpsById(corpsId || "");

  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<Grade | "all">("all");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [page, setPage] = useState(1);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["corps-profiles", corpsId],
    queryFn: () => fetchProfilesByCorps(corpsId || ""),
    enabled: !!corpsId,
  });

  const filtered = useMemo(() => {
    if (!profiles) return [];
    let result = profiles;

    if (selectedGrade !== "all") {
      result = result.filter((p) => p.grade === selectedGrade);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.nom.toLowerCase().includes(q) ||
          p.prenoms.toLowerCase().includes(q) ||
          p.contact?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.fonction?.toLowerCase().includes(q) ||
          p.profession?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [profiles, search, selectedGrade]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useMemo(() => setPage(1), [search, selectedGrade]);

  if (!corps) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Corps de métier introuvable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-header py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-primary-foreground">
            {corps.label}
          </h1>
          {corps.abbrev && (
            <span className="text-primary-foreground/60 text-sm font-sans">
              ({corps.abbrev})
            </span>
          )}
          <p className="text-primary-foreground/70 text-sm mt-1 font-sans">
            {profiles?.length ?? 0} membre{(profiles?.length ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto px-4 -mt-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, prénom, téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 text-base glass-card border-border shadow-md"
            />
          </div>

          {/* Grade filter */}
          <div className="flex gap-1.5 flex-wrap items-center">
            <button
              onClick={() => setSelectedGrade("all")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold font-sans transition-all ${
                selectedGrade === "all"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              Tous
            </button>
            {corps.grades.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold font-sans transition-all ${
                  selectedGrade === g
                    ? `${GRADE_COLORS[g]} text-white shadow-md`
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
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
              {search || selectedGrade !== "all"
                ? "Aucun résultat trouvé."
                : "Aucun membre dans ce corps de métier."}
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

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-sans text-muted-foreground px-3">
                  Page {page} / {totalPages}
                </span>
                <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
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
          queryClient.invalidateQueries({ queryKey: ["corps-profiles", corpsId] });
          queryClient.invalidateQueries({ queryKey: ["stats"] });
          queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
        }}
      />
    </div>
  );
};

export default CorpsMetierPage;
