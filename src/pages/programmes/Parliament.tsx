import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Users, FileText, Award } from "lucide-react";
import ProgrammePageTemplate from "@/components/shared/ProgrammePageTemplate";
import HemicycleChart from "@/components/parliament/HemicycleChart";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ECOWAS_COUNTRIES = [
  "Benin", "Burkina Faso", "Cabo Verde", "Côte d'Ivoire", "The Gambia",
  "Ghana", "Guinea", "Guinea-Bissau", "Liberia", "Mali",
  "Niger", "Nigeria", "Senegal", "Sierra Leone", "Togo",
];

const Parliament = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [country, setCountry] = useState("");
  const [motivation, setMotivation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleApplyClick = () => {
    setDialogOpen(true);
    setSubmitted(false);
    setCountry("");
    setMotivation("");
  };

  const handleSubmit = async () => {
    if (!userId) return;
    if (!country || !motivation.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("applications").insert({
      user_id: userId,
      country,
      motivation: motivation.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Application submitted!" });
    }
  };

  return (
    <>
      <ProgrammePageTemplate
        title="Simulated Youth Parliament"
        subtitle="Giving young people a seat at the table — launching the ECOWAS Youth Parliament vision."
        description="In May, the story reaches the parliamentary chamber itself. A Simulated ECOWAS Parliament gives young people a seat at the table, launching the Rt. Hon. Speaker's vision of a future ECOWAS Youth Parliament. What begins as simulation becomes aspiration, documented through youth reports in Abidjan and carried forward to Abuja. This initiative represents a cornerstone of the Parliament's commitment to intergenerational leadership."
        objectives={[
          "Organise a Simulated ECOWAS Parliament session for young people",
          "Launch the Rt. Hon. Speaker's vision of a future ECOWAS Youth Parliament",
          "Document proceedings through youth reports and publications",
          "Build parliamentary skills and civic knowledge among young participants",
          "Create a pathway from simulation to institutional youth engagement",
        ]}
        countries={["Côte d'Ivoire", "Nigeria"]}
        accentColor="bg-ecowas-red/20 text-ecowas-red"
        icon={<Building2 className="h-6 w-6" />}
        heroImage="/announcement/15.jpg"
        galleryImages={["/announcement/15.jpg", "/announcement/31.jpg", "/announcement/50.jpg"]}
        highlights={[
          { icon: <Building2 className="h-5 w-5" />, title: "Simulated Parliament", description: "Youth experience real parliamentary debate and procedure." },
          { icon: <Users className="h-5 w-5" />, title: "Youth Parliament Vision", description: "Launching the pathway to an institutional ECOWAS Youth Parliament." },
          { icon: <FileText className="h-5 w-5" />, title: "Youth Reports", description: "Documenting proceedings and recommendations from young delegates." },
          { icon: <Award className="h-5 w-5" />, title: "Civic Leadership", description: "Building parliamentary skills for the next generation." },
        ]}
      >
        {/* Hemicycle Section */}
        <AnimatedSection>
          <h2 className="text-2xl font-bold text-foreground mb-4">ECOWAS Member States</h2>
          <p className="text-muted-foreground mb-6">Hover over each seat to see the represented country.</p>
          <HemicycleChart />
        </AnimatedSection>

        {/* Apply CTA */}
        <AnimatedSection delay={100}>
          <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Become a Youth Representative</h3>
            <p className="text-muted-foreground mb-6">Submit your application to represent your country in the Simulated Youth Parliament.</p>
            <Button size="lg" className="font-semibold" onClick={handleApplyClick}>
              Apply as Youth Representative
            </Button>
          </div>
        </AnimatedSection>
      </ProgrammePageTemplate>

      {/* Application Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply as Youth Representative</DialogTitle>
            <DialogDescription>
              {!userId
                ? "You need to sign in before applying."
                : submitted
                  ? "Your application has been submitted successfully!"
                  : "Tell us which country you'd like to represent and why."}
            </DialogDescription>
          </DialogHeader>

          {!userId ? (
            <Button className="w-full font-semibold" onClick={() => { setDialogOpen(false); navigate("/auth"); }}>
              Sign In / Create Account
            </Button>
          ) : submitted ? (
            <Button variant="outline" className="w-full" onClick={() => { setDialogOpen(false); navigate("/profile"); }}>
              View My Applications
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    {ECOWAS_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Motivation</Label>
                <Textarea
                  placeholder="Why do you want to represent this country?"
                  value={motivation}
                  onChange={e => setMotivation(e.target.value)}
                  rows={4}
                />
              </div>
              <Button className="w-full font-semibold" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Application"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Parliament;
