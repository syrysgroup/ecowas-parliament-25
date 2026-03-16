import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Users, ClipboardList } from "lucide-react";

const COUNTRIES = [
  "Nigeria", "Ghana", "Côte d'Ivoire", "Guinea", "Guinea-Bissau",
  "Senegal", "Benin", "Cape Verde", "Gambia", "Liberia", "Sierra Leone", "Togo",
];

interface ApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApplicationModal = ({ open, onOpenChange }: ApplicationModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Apply tab state
  const [country, setCountry] = useState("");
  const [motivation, setMotivation] = useState("");
  const [applySubmitting, setApplySubmitting] = useState(false);

  // Nominate tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; full_name: string; email: string; country: string }[]>([]);
  const [selectedNominee, setSelectedNominee] = useState<typeof searchResults[0] | null>(null);
  const [nominationCount, setNominationCount] = useState<number | null>(null);
  const [nominateSubmitting, setNominateSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/auth"); return; }
    if (!country || !motivation.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setApplySubmitting(true);
    try {
      const { error } = await supabase.from("applications").insert({
        user_id: user.id,
        country,
        motivation: motivation.trim(),
      });
      if (error) throw error;
      toast({ title: "Application submitted!", description: "Your application is now pending review." });
      onOpenChange(false);
      setCountry("");
      setMotivation("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, country")
        .or(`full_name.ilike.%${searchQuery.trim()}%,email.ilike.%${searchQuery.trim()}%`)
        .neq("id", user?.id ?? "")
        .limit(10);
      if (error) throw error;
      setSearchResults(data || []);
      setSelectedNominee(null);
      setNominationCount(null);
    } catch (err: any) {
      toast({ title: "Search failed", description: err.message, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const selectNominee = async (profile: typeof searchResults[0]) => {
    setSelectedNominee(profile);
    const { data } = await supabase.rpc("get_nomination_count", { nominee_id: profile.id });
    setNominationCount(typeof data === "number" ? data : 0);
  };

  const handleNominate = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!selectedNominee) return;
    setNominateSubmitting(true);
    try {
      const { error } = await supabase.from("nominations").insert({
        nominee_user_id: selectedNominee.id,
        nominator_user_id: user.id,
        country: selectedNominee.country,
      });
      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already nominated", description: "You've already nominated this person.", variant: "destructive" });
        } else {
          throw error;
        }
      } else {
        toast({ title: "Nomination submitted!", description: `You nominated ${selectedNominee.full_name}.` });
        setNominationCount((prev) => (prev ?? 0) + 1);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setNominateSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Sign In Required</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You need to create an account and verify your email before applying or nominating.
          </p>
          <Button onClick={() => { onOpenChange(false); navigate("/auth"); }} className="w-full mt-2">
            Go to Sign Up / Sign In
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Youth Representative</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="apply" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="apply" className="flex-1 gap-1.5">
              <ClipboardList className="h-4 w-4" /> Apply
            </TabsTrigger>
            <TabsTrigger value="nominate" className="flex-1 gap-1.5">
              <Users className="h-4 w-4" /> Nominate
            </TabsTrigger>
          </TabsList>

          {/* Apply Tab */}
          <TabsContent value="apply">
            <form onSubmit={handleApply} className="space-y-4 pt-2">
              <div>
                <Label>Country Delegation</Label>
                <Select value={country} onValueChange={setCountry} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Motivation</Label>
                <Textarea
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Why do you want to represent your country in the ECOWAS Youth Parliament?"
                  className="mt-1 min-h-[120px]"
                  required
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground mt-1">{motivation.length}/2000</p>
              </div>
              <Button type="submit" className="w-full" disabled={applySubmitting}>
                {applySubmitting ? "Submitting…" : "Submit Application"}
              </Button>
            </form>
          </TabsContent>

          {/* Nominate Tab */}
          <TabsContent value="nominate">
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Nominate a registered user. A nominee needs at least <strong>200 nominations</strong> to qualify.
              </p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search by name or email"
                    className="pl-10"
                  />
                </div>
                <Button type="button" variant="secondary" onClick={handleSearch} disabled={searching}>
                  Search
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {searchResults.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => selectNominee(profile)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedNominee?.id === profile.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <p className="font-medium text-sm text-foreground">{profile.full_name}</p>
                      <p className="text-xs text-muted-foreground">{profile.email} · {profile.country}</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedNominee && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-foreground">{selectedNominee.full_name}</p>
                    <Badge variant="outline" className="text-xs">
                      {nominationCount ?? "…"} / 200 nominations
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-3">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(((nominationCount ?? 0) / 200) * 100, 100)}%` }}
                    />
                  </div>
                  <Button
                    onClick={handleNominate}
                    disabled={nominateSubmitting}
                    className="w-full gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {nominateSubmitting ? "Submitting…" : "Nominate"}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;
