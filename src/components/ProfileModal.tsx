import type { Profile } from "@/lib/supabase-helpers";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User, Phone, Mail, MapPin, Briefcase, GraduationCap, Building2, Heart } from "lucide-react";
import logoRenamci from "@/assets/logo-renamci.png";

interface ProfileModalProps {
  profile: Profile | null;
  open: boolean;
  onClose: () => void;
}

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 py-1.5">
      <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <div>
        <span className="text-xs text-muted-foreground font-sans font-semibold">{label} :</span>
        <span className="text-sm text-foreground font-sans ml-1">{value}</span>
      </div>
    </div>
  );
};

const ProfileModal = ({ profile, open, onClose }: ProfileModalProps) => {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto border-none">
        {/* Green header band */}
        <div className="gradient-header text-center py-3 px-4">
          <p className="text-primary-foreground font-serif text-sm tracking-widest uppercase">RÉNAMCI</p>
          {profile.fonction && (
            <p className="text-primary-foreground font-serif text-lg font-bold mt-0.5">{profile.fonction}</p>
          )}
        </div>

        {/* Photo + Ministry banner */}
        <div className="relative px-6 pt-2 pb-4">
          <div className="flex items-center gap-4">
            {/* Photo circle */}
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/30 shrink-0 bg-muted flex items-center justify-center shadow-lg">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground/40" />
              )}
            </div>

            {/* Name + Ministry */}
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-xl font-bold text-foreground leading-tight">
                {profile.prenoms} {profile.nom}
              </h2>
              <p className="text-sm text-accent font-semibold mt-1">{profile.grade}</p>
              {profile.ministere && (
                <div className="gradient-header rounded-md px-3 py-2 mt-2">
                  <p className="text-primary-foreground text-xs font-sans font-medium leading-tight">{profile.ministere}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Two-column layout: Values | Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 pb-6">
          {/* Left: Values */}
          {profile.valeurs && (
            <div className="space-y-2">
              <h3 className="font-serif text-base font-bold text-destructive uppercase tracking-wide">Valeurs :</h3>
              <div className="space-y-1">
                {profile.valeurs.split(/[,\n]/).map((v, i) => (
                  <p key={i} className="text-sm text-foreground font-sans">{v.trim()}</p>
                ))}
              </div>
            </div>
          )}

          {/* Right: Details */}
          <div className="space-y-0.5">
            <InfoRow icon={Building2} label="Direction" value={profile.direction} />
            <InfoRow icon={Briefcase} label="Fonction" value={profile.fonction} />
            <InfoRow icon={Briefcase} label="Profession" value={profile.profession} />
            <InfoRow icon={Phone} label="Contact" value={profile.contact} />
            <InfoRow icon={Mail} label="Email" value={profile.email} />
            <InfoRow icon={MapPin} label="Adresse" value={profile.adresse} />
            <InfoRow icon={GraduationCap} label="Spécialisation à l'ENA" value={profile.specialisation_ena} />
            <InfoRow icon={GraduationCap} label="Promotion à l'ENA" value={profile.promotion_ena} />
            <InfoRow icon={GraduationCap} label="Formation initiale" value={profile.formation_initiale} />
            <InfoRow icon={Briefcase} label="Domaines d'expertise" value={profile.domaines_expertise} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
