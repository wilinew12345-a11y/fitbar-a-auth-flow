import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfileDialog = ({ open, onOpenChange }: UserProfileDialogProps) => {
  const { t, isRtl } = useLanguage();
  const { profile, saving, updateProfile } = useUserProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Sync form state with profile data when dialog opens
  useEffect(() => {
    if (open && profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
    }
  }, [open, profile]);

  const handleSave = async () => {
    const { error } = await updateProfile(firstName, lastName);

    if (error) {
      toast({
        title: "שגיאה",
        description: String(error),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("profileUpdated"),
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[#0a1628]/95 backdrop-blur-xl border-blue-800/50 text-white max-w-md"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-blue-400" />
            {t("userProfile") || "פרטי משתמש"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-blue-200">
              {t("firstName") || "שם פרטי"}
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-[#021024] border-blue-800 text-white focus:border-blue-500 focus:ring-blue-500"
              placeholder={t("firstName") || "שם פרטי"}
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-blue-200">
              {t("lastName") || "שם משפחה"}
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-[#021024] border-blue-800 text-white focus:border-blue-500 focus:ring-blue-500"
              placeholder={t("lastName") || "שם משפחה"}
            />
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-blue-200">
              {t("emailLabel")}
            </Label>
            <Input
              id="email"
              value={profile?.email || ""}
              disabled
              className="bg-[#021024]/50 border-blue-800/50 text-white/60 cursor-not-allowed"
            />
            <p className="text-xs text-blue-400/60">{t("emailReadOnly")}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-blue-800/30">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-blue-800 text-blue-200 hover:bg-blue-900/30"
          >
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t("saving")}
              </>
            ) : (
              t("save") || "שמור"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
