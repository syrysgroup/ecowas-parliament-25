import { useEffect, useState } from "react";
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
import { Search, Send, Vote, UserPlus } from "lucide-react";
import { fallbackNominees } from "@/lib/parliament";

const COUNTRIES = [
  "Benin", "Cape Verde", "Gambia", "Ghana", "Guinea", "Guinea-Bissau",
  "Côte d'Ivoire", "Liberia", "Nigeria", "Senegal", "Sierra Leone", "Togo",
];

interface ApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApplicationModal = ({ open, onOpenChange }: ApplicationModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [country, setCountry] = useState("");
  const [motivation, setMotivation] = useState("");
  const [manifesto, setManifesto] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedNominee, setSelectedNominee] = useState<any | null>(null);
  const [approvedNominees, setApprovedNominees] = useState<any[]>([]);
  const [selectedVoteNominee, setSelectedVoteNominee] = useState<any | null>(null);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [nominateSubmitting, setNominateSubmitting] = useState(false);
  const [voteSubmitting, setVoteSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const loadNominees = async () => {
      const { data } = await (supabase as any)
        .from("public_nominee_leaderboard")
        .select("id, full_name, country, bio, avatar_url, title, organisation, vote_count")
        .order("vote_count", { ascending: false })
        .limit(12);

      setApprovedNominees((data ?? []).length > 0 ? data : fallbackNominees);
    };

    if (open) void loadNominees();
  }, [open]);

  const requireAuth = () => {
    onOpenChange(false);
    navigate("/auth");
  };

  const handleApply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return requireAuth();
    if (!country || !motivation.trim()) return;

    setApplySubmitting(true);
    const { error } = await (supabase as any).from("applications").insert({
      user_id: user.id,
      country,
      motivation: motivation.trim(),
      manifesto: manifesto.trim() || null,
    });

    setApplySubmitting(false);
    if (error) {
      toast({ title: "Application failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Application submitted", description: "Your representative application is now in the review queue." });
    setCountry("");
    setMotivation("");
    setManifesto("");
    onOpenChange(false);
  };

  const handleSearch = async () => {
    if (!user) return requireAuth();
    if (!searchQuery.trim()) return;

    setSearching(true);
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("id, full_name, country, avatar_url, bio, title, organisation")
      .eq("is_public", true)
      .ilike("full_name", `%${searchQuery.trim()}%`)
      .neq("id", user.id)
      .limit(8);

    setSearching(false);
    if (error) {
      toast({ title: "Search failed", description: error.message, variant: "destructive" });
      return;
    }

    setSearchResults(data ?? []);
  };

  const handleNominate = async () => {
    if (!user) return requireAuth();
    if (!selectedNominee) return;

    setNominateSubmitting(true);
    const { error } = await (supabase as any).from("nominations").insert({
      nominee_user_id: selectedNominee.id,
      nominator_user_id: user.id,
      country: selectedNominee.country,
      statement: `Community nomination for ${selectedNominee.full_name}`,
    });
    setNominateSubmitting(false);

    if (error) {
      toast({
        title: error.code === "23505" ? "Already nominated" : "Nomination failed",
        description: error.code === "23505" ? "Duplicate nominations are blocked for the same person." : error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Nomination submitted", description: `${selectedNominee.full_name} has been added to the review queue.` });
  };

  const handleVote = async () => {
    if (!user) return requireAuth();
    if (!selectedVoteNominee) return;

    setVoteSubmitting(true);
    const { error } = await (supabase as any).from("nomination_votes").insert({
      nomination_id: selectedVoteNominee.id,
      voter_user_id: user.id,
    });
    setVoteSubmitting(false);

    if (error) {
      toast({
        title: error.code === "23505" ? "Vote already recorded" : "Vote failed",
        description: error.code === "23505" ? "You can only vote once per nominee." : error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Vote counted", description: `Your support for ${selectedVoteNominee.full_name} has been recorded.` });
    setApprovedNominees((current) => current.map((nominee) => nominee.id === selectedVoteNominee.id ? { ...nominee, vote_count: (nominee.vote_count ?? 0) + 1 } : nominee));
  };

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Sign in required</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">You need an account before you can apply, nominate, or vote for a representative.</p>
          <Button onClick={requireAuth} className="w-full">Go to Sign In / Sign Up</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Participate in the Youth Parliament selection</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="apply" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="apply">Apply</TabsTrigger>
            <TabsTrigger value="nominate">Nominate</TabsTrigger>
            <TabsTrigger value="vote">Vote</TabsTrigger>
          </TabsList>

          <TabsContent value="apply" className="pt-4">
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <Label>Country delegation</Label>
                <Select value={country} onValueChange={setCountry} required>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Why should your people trust you to represent them?</Label>
                <Textarea value={motivation} onChange={(e) => setMotivation(e.target.value)} className="mt-1 min-h-[120px]" maxLength={1800} />
              </div>
              <div>
                <Label>Your manifesto summary</Label>
                <Textarea value={manifesto} onChange={(e) => setManifesto(e.target.value)} className="mt-1 min-h-[100px]" maxLength={1200} />
              </div>
              <Button type="submit" className="w-full" disabled={applySubmitting}>{applySubmitting ? "Submitting…" : "Submit application"}</Button>
            </form>
          </TabsContent>

          <TabsContent value="nominate" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">Nominate a public youth profile so moderators can review and publish them on the national ballot.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" placeholder="Search public profiles by name" />
              </div>
              <Button type="button" variant="secondary" onClick={handleSearch} disabled={searching}>{searching ? "Searching…" : "Search"}</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {searchResults.map((profile) => (
                <button key={profile.id} type="button" onClick={() => setSelectedNominee(profile)} className={`rounded-2xl border p-4 text-left transition-colors ${selectedNominee?.id === profile.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}>
                  <p className="font-semibold text-foreground">{profile.full_name}</p>
                  <p className="text-sm text-muted-foreground">{profile.country}</p>
                  {profile.title && <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{profile.title}</p>}
                </button>
              ))}
            </div>
            {selectedNominee && <Button onClick={handleNominate} disabled={nominateSubmitting} className="w-full gap-2"><UserPlus className="h-4 w-4" />{nominateSubmitting ? "Submitting…" : `Nominate ${selectedNominee.full_name}`}</Button>}
          </TabsContent>

          <TabsContent value="vote" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">Vote once per approved nominee and help push credible young leaders to the top of the country leaderboard.</p>
            <div className="grid gap-4 md:grid-cols-2">
              {approvedNominees.map((nominee) => (
                <button key={nominee.id} type="button" onClick={() => setSelectedVoteNominee(nominee)} className={`overflow-hidden rounded-3xl border text-left transition-colors ${selectedVoteNominee?.id === nominee.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}>
                  <div className="flex gap-4 p-4">
                    <img src={nominee.avatar_url} alt={nominee.full_name} className="h-20 w-20 rounded-2xl object-cover" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{nominee.full_name}</p>
                        <Badge variant="outline">{nominee.vote_count ?? 0} votes</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{nominee.country}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{nominee.bio}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {selectedVoteNominee && <Button onClick={handleVote} disabled={voteSubmitting} className="w-full gap-2"><Vote className="h-4 w-4" />{voteSubmitting ? "Recording vote…" : `Vote for ${selectedVoteNominee.full_name}`}</Button>}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;
