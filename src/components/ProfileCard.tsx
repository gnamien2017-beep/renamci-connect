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
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {profile.photo_url ? (
          <img
            src={profile.photo_url}
            alt={`${profile.prenoms} ${profile.nom}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <User className="w-16 h-16 text-muted-foreground/40" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif font-semibold text-foreground truncate">
          {profile.nom}
        </h3>
        <p className="text-sm text-muted-foreground truncate">
          {profile.prenoms}
        </p>
        {profile.fonction && (
          <p className="text-xs text-accent mt-1 font-medium truncate">
            {profile.fonction}
          </p>
        )}
      </div>
    </button>
  );
};

export default ProfileCard;
