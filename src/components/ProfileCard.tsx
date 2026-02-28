import type { Profile } from "@/lib/supabase-helpers";
import { User } from "lucide-react";

interface ProfileCardProps {
  profile: Profile;
  onClick: () => void;
}

const ProfileCard = ({ profile, onClick }: ProfileCardProps) => {
  return (
    <button
      onClick={onClick}
      className="glass-card rounded-xl overflow-hidden text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group w-full animate-scale-in"
    >
      {/* Green top band */}
      <div className="gradient-header py-1.5 px-3 text-center">
        <p className="text-primary-foreground text-[10px] tracking-widest uppercase font-sans">RÉNAMCI</p>
      </div>

      {/* Photo */}
      <div className="px-4 pt-3 pb-2 flex justify-center">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-3 border-primary/30 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={`${profile.prenoms} ${profile.nom}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-muted-foreground/40" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pb-4 text-center">
        <h3 className="font-serif font-semibold text-foreground text-sm truncate">
          {profile.prenoms} {profile.nom}
        </h3>
        {profile.fonction && (
          <p className="text-xs text-accent mt-0.5 font-medium truncate">{profile.fonction}</p>
        )}
        {profile.ministere && (
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{profile.ministere}</p>
        )}
      </div>
    </button>
  );
};

export default ProfileCard;
