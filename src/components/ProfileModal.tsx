import { useState } from "react";
import type { Profile } from "@/lib/supabase-helpers";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User, Phone, Mail, MapPin, Briefcase, GraduationCap, Building2, Pencil, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EditProfileModal from "@/components/EditProfileModal";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProfileModalProps {
  profile: Profile | null;
  open: boolean;
  onClose: () => void;
  onProfileChanged?: () => void;
}

const InfoRow = ({ icon: Icon, label, value, isPhone }: { icon: any; label: string; value: string | null; isPhone?: boolean }) => {
  if (!value) return null;

  const formatPhone = (phone: string) => phone.replace(/\s+/g, "").replace(/^0/, "+225");

  if (isPhone) {
    const cleanPhone = formatPhone(value);
    return (
      <div className="flex items-start gap-2 py-1.5">
        <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1">
          <span className="text-xs text-muted-foreground font-sans font-semibold">{label} :</span>
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-sm text-primary font-sans ml-1 underline underline-offset-2 hover:text-primary/80 cursor-pointer">
                {value}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 space-y-1">
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm font-sans transition-colors"
              >
                <Phone className="w-4 h-4 text-primary" />
                Appeler
              </a>
              <a
                href={`https://wa.me/${cleanPhone.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm font-sans transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-green-500" />
                WhatsApp
              </a>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  }

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

const ValeursBadges = ({ valeurs }: { valeurs: string }) => {
  const items = valeurs.split(/[,\n]/).map(v => v.trim()).filter(Boolean);
  return (
    <div className="space-y-2">
      <h3 className="font-serif text-base font-bold text-destructive uppercase tracking-wide">Valeurs :</h3>
      <div className="flex flex-col gap-1.5">
        {items.map((v, i) => (
          <Badge key={i} variant="secondary" className="text-xs font-sans w-fit">
            {v}
          </Badge>
        ))}
      </div>
    </div>
  );
};

const ProfileModal = ({ profile, open, onClose, onProfileChanged }: ProfileModalProps) => {
  const { toast } = useToast();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordAction, setPasswordAction] = useState<"edit" | "delete">("edit");
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  if (!profile) return null;

  const handleAction = (action: "edit" | "delete") => {
    setPasswordAction(action);
    setPassword("");
    setShowPasswordDialog(true);
  };

  const handleVerifyPassword = async () => {
    if (!password.trim()) return;
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-profile", {
        body: {
          action: passwordAction === "delete" ? "delete" : "verify",
          profile_id: profile.id,
          password,
        },
      });

      if (error || data?.error) {
        toast({ title: "Erreur", description: data?.error || "Mot de passe incorrect", variant: "destructive" });
        setVerifying(false);
        return;
      }

      if (passwordAction === "delete") {
        toast({ title: "Profil supprimé", description: "Le profil a été supprimé avec succès." });
        setShowPasswordDialog(false);
        onClose();
        onProfileChanged?.();
      } else {
        setShowPasswordDialog(false);
        setShowEditModal(true);
      }
    } catch {
      toast({ title: "Erreur", description: "Erreur de connexion", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto border-none">
          {/* Green header band */}
          <div className="gradient-header text-center py-3 px-4 relative">
            <p className="text-primary-foreground font-serif text-sm tracking-widest uppercase">RÉNAMCI</p>
            {profile.fonction && (
              <p className="text-primary-foreground font-serif text-lg font-bold mt-0.5">{profile.fonction}</p>
            )}
          </div>

          {/* Photo + Info */}
          <div className="relative px-6 pt-2 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/30 shrink-0 bg-muted flex items-center justify-center shadow-lg">
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-serif text-xl font-bold text-foreground leading-tight">
                  <span className="uppercase">{profile.nom}</span>{" "}
                  <span className="capitalize">{profile.prenoms}</span>
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

          {/* Two-column layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 pb-6">
            {profile.valeurs && <ValeursBadges valeurs={profile.valeurs} />}
            <div className="space-y-0.5">
              <InfoRow icon={Building2} label="Direction" value={profile.direction} />
              <InfoRow icon={Briefcase} label="Fonction" value={profile.fonction} />
              <InfoRow icon={Briefcase} label="Profession" value={profile.profession} />
              <InfoRow icon={Phone} label="Contact" value={profile.contact} isPhone />
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              <InfoRow icon={MapPin} label="Adresse" value={profile.adresse} />
              <InfoRow icon={GraduationCap} label="Spécialisation à l'ENA" value={profile.specialisation_ena} />
              <InfoRow icon={GraduationCap} label="Promotion à l'ENA" value={profile.promotion_ena} />
              <InfoRow icon={GraduationCap} label="Formation initiale" value={profile.formation_initiale} />
              <InfoRow icon={Briefcase} label="Domaines d'expertise" value={profile.domaines_expertise} />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 px-6 pb-6">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => handleAction("edit")}>
              <Pencil className="w-4 h-4" /> Modifier
            </Button>
            <Button variant="destructive" className="flex-1 gap-2" onClick={() => handleAction("delete")}>
              <Trash2 className="w-4 h-4" /> Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password verification dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {passwordAction === "delete" ? "Confirmer la suppression" : "Vérification"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Entrez le mot de passe utilisé lors de l'inscription pour{" "}
              {passwordAction === "delete" ? "supprimer ce profil" : "modifier ce profil"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerifyPassword()}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <Button
              variant={passwordAction === "delete" ? "destructive" : "default"}
              onClick={handleVerifyPassword}
              disabled={verifying || !password.trim()}
            >
              {verifying ? "Vérification..." : passwordAction === "delete" ? "Supprimer" : "Continuer"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit modal */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          password={password}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            setShowEditModal(false);
            onClose();
            onProfileChanged?.();
          }}
        />
      )}
    </>
  );
};

export default ProfileModal;
