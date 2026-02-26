import type { Profile } from "@/lib/supabase-helpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Phone, Mail, MapPin, Briefcase, GraduationCap, Building2, Heart } from "lucide-react";

interface ProfileModalProps {
  profile: Profile | null;
  open: boolean;
  onClose: () => void;
}

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-4 h-4 text-accent mt-1 shrink-0" />
      <div>
        <span className="text-xs text-muted-foreground font-sans">{label}</span>
        <p className="text-sm text-foreground font-sans">{value}</p>
      </div>
    </div>
  );
};

const ProfileModal = ({ profile, open, onClose }: ProfileModalProps) => {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border-2 border-accent/30">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground/40" />
              )}
            </div>
            <div>
              <DialogTitle className="font-serif text-xl">
                {profile.prenoms} {profile.nom}
              </DialogTitle>
              <p className="text-sm text-accent font-medium">{profile.grade}</p>
              <p className="text-xs text-muted-foreground">{profile.sexe}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="divide-y divide-border mt-4">
          <InfoRow icon={Briefcase} label="Fonction" value={profile.fonction} />
          <InfoRow icon={Briefcase} label="Profession" value={profile.profession} />
          <InfoRow icon={Building2} label="Direction" value={profile.direction} />
          <InfoRow icon={Building2} label="Ministère" value={profile.ministere} />
          <InfoRow icon={Phone} label="Contact" value={profile.contact} />
          <InfoRow icon={Mail} label="Email" value={profile.email} />
          <InfoRow icon={MapPin} label="Adresse" value={profile.adresse} />
          <InfoRow icon={GraduationCap} label="Spécialisation ENA" value={profile.specialisation_ena} />
          <InfoRow icon={GraduationCap} label="Promotion ENA" value={profile.promotion_ena} />
          <InfoRow icon={GraduationCap} label="Formation initiale" value={profile.formation_initiale} />
          <InfoRow icon={Briefcase} label="Domaines d'expertise" value={profile.domaines_expertise} />
          <InfoRow icon={Heart} label="Valeurs" value={profile.valeurs} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
