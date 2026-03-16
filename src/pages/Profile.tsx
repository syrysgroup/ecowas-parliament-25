import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, FileText, Award, LogOut } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const ECOWAS_COUNTRIES = [
  "Benin", "Burkina Faso", "Cabo Verde", "Côte d'Ivoire", "The Gambia",
  "Ghana", "Guinea", "Guinea-Bissau", "Liberia", "Mali",
  "Niger", "Nigeria", "Senegal", "Sierra Leone", "Togo",
];

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [applications, setApplications] = useState<Tables<"applications">[]>([]);
  const [nominationCount, setNominationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [dob, setDob] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const userId = session.user.id;

      const [profileRes, appsRes, nomRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("applications").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.rpc("get_nomination_count", { nominee_id: userId }),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setFullName(profileRes.data.full_name);
        setCountry(profileRes.data.country);
        setDob(profileRes.data.date_of_birth || "");
      }
      if (appsRes.data) setApplications(appsRes.data);
      if (nomRes.data !== null) setNominationCount(nomRes.data);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/auth");
    });
    load();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSave = async () => {
    if (!profile) return;
    const { error } = await supabase.from("profiles").update({
      full_name: fullName,
      country,
      date_of_birth: dob || null,
    }).eq("id", profile.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
      setProfile({ ...profile, full_name: fullName, country, date_of_birth: dob || null });
      setEditing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const statusColor = (s: string) => {
    if (s === "approved") return "default";
    if (s === "rejected") return "destructive";
    return "secondary";
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="relative py-20 bg-gradient-hero text-primary-foreground">
        <div className="container relative">
          <h1 className="text-3xl md:text-4xl font-black">My Profile</h1>
          <p className="mt-2 text-primary-foreground/70">Manage your account, applications and nominations.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-4xl space-y-10">
          {/* Profile Info */}
          <AnimatedSection>
            <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary"><User className="h-5 w-5" /></div>
                  <h2 className="text-xl font-bold text-card-foreground">Personal Information</h2>
                </div>
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleSave}>Save</Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
                  )}
                </div>
              </div>
              {editing ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ECOWAS_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={dob} onChange={e => setDob(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile?.email || ""} disabled />
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{profile?.full_name}</span></div>
                  <div><span className="text-muted-foreground">Email:</span> <span className="font-medium text-foreground">{profile?.email}</span></div>
                  <div><span className="text-muted-foreground">Country:</span> <span className="font-medium text-foreground">{profile?.country}</span></div>
                  <div><span className="text-muted-foreground">Date of Birth:</span> <span className="font-medium text-foreground">{profile?.date_of_birth || "Not set"}</span></div>
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* Stats Row */}
          <AnimatedSection delay={100}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-xl bg-card border border-border shadow-sm flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-ecowas-gold/20 text-ecowas-gold"><FileText className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-black text-card-foreground">{applications.length}</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border shadow-sm flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-ecowas-red/20 text-ecowas-red"><Award className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-black text-card-foreground">{nominationCount}</p>
                  <p className="text-sm text-muted-foreground">Nominations Received</p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Applications */}
          <AnimatedSection delay={200}>
            <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
              <h2 className="text-xl font-bold text-card-foreground mb-4">My Applications</h2>
              {applications.length === 0 ? (
                <p className="text-muted-foreground text-sm">You haven't submitted any applications yet.</p>
              ) : (
                <div className="space-y-3">
                  {applications.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                      <div>
                        <p className="font-medium text-foreground text-sm">{app.country}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={statusColor(app.status)}>{app.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* Logout */}
          <AnimatedSection delay={300}>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
