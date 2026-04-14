import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchProfilesByCorps,
  getCorpsById,
  CORPS_COLORS,
  GRADE_COLORS_HEX,
  type Grade,
  type Profile,
} from "@/lib/supabase-helpers";
import ProfileCard from "@/components/ProfileCard";
import ProfileModal from "@/components/ProfileModal";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

const CorpsMetierPage = () => {
  const { corpsId, grade } = useParams<{ corpsId: string; grade?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const corps = getCorpsById(corpsId || "");
  const corpsColor = CORPS_COLORS[corpsId || ""] || { bg: "#2d6a4f", text: "#ffffff" };

  const [search, setSearch] = useState("");
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

    if (grade) {
      result = result.filter((p) => p.grade === grade);
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
  }, [profiles, search, grade]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useMemo(() => setPage(1), [search, grade]);

  if (!corps) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Corps de métier introuvable.</p>
      </div>
    );
  }

  // If no grade selected, show grade selection screen
  if (!grade) {
    return (
      <div className="min-h-screen bg-background">
        <div
          className="py-8 px-4"
          style={{
            background: `linear-gradient(135deg, ${corpsColor.bg}, ${corpsColor.bg}dd)`,
          }}
        >
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 text-white/70 hover:text-white text-sm font-sans mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <h1 className="text-3xl font-serif font-bold text-white uppercase">
              {corps.label}
            </h1>
            {corps.abbrev && (
              <span className="text-white/60 text-sm font-sans">
                ({corps.abbrev})
              </span>
            )}
            <p className="text-white/70 text-sm mt-1 font-sans">
              {profiles?.length ?? 0} membre{(profiles?.length ?? 0) > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-xl font-serif font-bold text-foreground text-center mb-8">
            Sélectionnez un <span className="gold-accent">Grade</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {corps.grades.map((g) => {
              const gc = GRADE_COLORS_HEX[g];
              const count = profiles?.filter((p) => p.grade === g).length ?? 0;
              return (
                <button
                  key={g}
                  onClick={() => navigate(`/corps/${corpsId}/${g}`)}
                  className="corps-grade-btn"
                  style={{
                    background: `linear-gradient(145deg, ${gc.light}, ${gc.main})`,
                    boxShadow: `0 6px 10px ${gc.main}40, 0 2px 0 ${gc.light}, inset 0 -3px 0 ${gc.dark}`,
                    color: "#fff",
                  }}
                >
                  {g}
                  <span className="block text-[10px] font-normal opacity-80 mt-1">
                    {count} membre{count > 1 ? "s" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="py-8 px-4"
        style={{
          background: `linear-gradient(135deg, ${corpsColor.bg}, ${corpsColor.bg}dd)`,
        }}
      >
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(`/corps/${corpsId}`)}
            className="flex items-center gap-1 text-white/70 hover:text-white text-sm font-sans mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {corps.label}
          </button>
          <h1 className="text-3xl font-serif font-bold text-white uppercase">
            {corps.label} — {grade}
          </h1>
          <p className="text-white/70 text-sm mt-1 font-sans">
            {filtered.length} membre{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-5xl mx-auto px-4 -mt-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, prénom, téléphone..."
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
