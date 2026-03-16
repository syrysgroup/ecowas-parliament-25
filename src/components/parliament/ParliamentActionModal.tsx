import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { COUNTRIES } from "./HemicycleChart";

type ModalTab = "apply" | "nominate";

interface CandidateProfile {
  id: string;
  full_name: string;
  country: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  country: string;
}

interface ParliamentActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: ModalTab;
}

const ParliamentActionModal = ({ open, onOpenChange, initialTab = "apply" }: ParliamentActionModalProps) => {
  const { toast } = useToast();
  const [tab, setTab] = useState<ModalTab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [applyCountry, setApplyCountry] = useState("");
  const [motivation, setMotivation] = useState("");
  const [selectedNomineeId, setSelectedNomineeId] = useState("");
  const [existingApplicationId, setExistingApplicationId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
    }
  }, [initialTab, open]);

  useEffect(() => {
    const loadAuthContext = async () => {
      if (!open) return;

      setCheckingAuth(true);
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        setUserId(null);
        setProfile(null);
        setCandidates([]);
        setApplyCountry("");
        setExistingApplicationId(null);
        setCheckingAuth(false);
        return;
      }

      setUserId(user.id);

      const [{ data: profileData }, { data: appData }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, country")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("applications")
          .select("id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle(),
      ]);

      const nextProfile = profileData ?? null;
      setProfile(nextProfile);
      setApplyCountry(nextProfile?.country || "");
      setExistingApplicationId(appData?.id ?? null);

      if (nextProfile?.country) {
        const { data: candidateData } = await supabase
          .from("profiles")
          .select("id, full_name, country")
          .eq("country", nextProfile.country)
          .neq("id", user.id)
          .order("full_name");

        setCandidates(candidateData ?? []);
      } else {
        setCandidates([]);
      }

      setCheckingAuth(false);
    };

    loadAuthContext();
  }, [open]);

  const selectedNominee = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedNomineeId) ?? null,
    [candidates, selectedNomineeId]
  );

  const handleApply = async () => {
    if (!userId || !applyCountry || !motivation.trim()) return;

    setLoading(true);
    const { error, data } = await supabase
      .from("applications")
      .insert({
        user_id: userId,
        country: applyCountry,
        motivation: motivation.trim(),
      })
      .select("id")
      .single();

    setLoading(false);

    if (error) {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setExistingApplicationId(data.id);
    toast({
      title: "Application submitted",
      description: "Your application has been recorded successfully.",
    });
  };

  const handleNominate = async () => {
    if (!userId || !selectedNominee) return;

    setLoading(true);
    const { error } = await supabase.from("nominations").insert({
      nominator_user_id: userId,
      nominee_user_id: selectedNominee.id,
      country: selectedNominee.country,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Nomination failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSelectedNomineeId("");
    toast({
      title: "Nomination submitted",
      description: `${selectedNominee.full_name} has been nominated successfully.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border bg-background p-0 overflow-hidden">
        <div className="bg-gradient-hero px-6 py-5 text-primary-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Youth Parliament Access Desk</DialogTitle>
            <DialogDescription className="text-primary-foreground/75">
              Apply to represent your country or nominate another registered youth from your member state.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setTab("apply")}
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                tab === "apply" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Self Application
            </button>
            <button
              type="button"
              onClick={() => setTab("nominate")}
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                tab === "nominate" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Nominate a Youth
            </button>
          </div>

          {checkingAuth ? (
            <div className="rounded-2xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              Checking authentication status…
            </div>
          ) : !userId ? (
            <div className="rounded-2xl border border-border bg-muted/40 p-6 space-y-3">
              <p className="font-semibold text-foreground">You need to sign in to continue.</p>
              <p className="text-sm text-muted-foreground">
                The database is connected and ready, but this preview currently needs an authenticated session before applications and nominations can be submitted.
              </p>
            </div>
          ) : tab === "apply" ? (
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Full name</label>
                <Input value={profile?.full_name ?? ""} disabled />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Country</label>
                <Select value={applyCountry} onValueChange={setApplyCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Why should you represent your country?</label>
                <Textarea
                  value={motivation}
                  onChange={(event) => setMotivation(event.target.value)}
                  placeholder="Share your vision for youth leadership, regional cooperation, and parliamentary engagement."
                  className="min-h-36"
                />
              </div>

              {existingApplicationId ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
                  You already have an application on record. You can still review the current page, but duplicate submissions are disabled here.
                </div>
              ) : null}

              <DialogFooter>
                <Button
                  type="button"
                  onClick={handleApply}
                  disabled={loading || !!existingApplicationId || !applyCountry || !motivation.trim()}
                >
                  {loading ? "Submitting…" : "Submit Application"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                {profile?.country
                  ? `Showing registered youth profiles from ${profile.country}.`
                  : "Complete your profile country to nominate from your delegation."}
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Select registered youth</label>
                <Select value={selectedNomineeId} onValueChange={setSelectedNomineeId}>
                  <SelectTrigger>
                    <SelectValue placeholder={candidates.length ? "Choose a nominee" : "No eligible profiles found"} />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedNominee ? (
                <div className="rounded-xl border border-border bg-card p-4 text-sm">
                  <p className="font-semibold text-foreground">Selected nominee</p>
                  <p className="mt-1 text-muted-foreground">
                    {selectedNominee.full_name} · {selectedNominee.country}
                  </p>
                </div>
              ) : null}

              <DialogFooter>
                <Button type="button" onClick={handleNominate} disabled={loading || !selectedNomineeId}>
                  {loading ? "Submitting…" : "Submit Nomination"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParliamentActionModal;
