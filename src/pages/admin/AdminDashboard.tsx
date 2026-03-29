import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileClock, FolderKanban, ShieldCheck, Trophy, UserPlus, Users, Vote } from "lucide-react";

type QueueItem = {
  id: string;
  full_name: string;
  country: string;
  created_at: string;
  status?: string;
  vote_count?: number;
};

const AdminDashboard = () => {
  const [applications, setApplications] = useState<QueueItem[]>([]);
  const [nominations, setNominations] = useState<QueueItem[]>([]);
  const [representatives, setRepresentatives] = useState<QueueItem[]>([]);
  const [roleLabel, setRoleLabel] = useState("Moderator");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const [applicationsRes, nominationsRes, representativesRes, rolesRes] = await Promise.all([
        (supabase as any)
          .from("applications")
          .select("id, country, created_at, status, profiles!inner(full_name)")
          .order("created_at", { ascending: false })
          .limit(8),
        (supabase as any)
          .from("public_nominee_leaderboard")
          .select("id, full_name, country, created_at, vote_count")
          .order("vote_count", { ascending: false })
          .limit(8),
        (supabase as any)
          .from("public_representatives")
          .select("id, full_name, country, verified_at")
          .order("verified_at", { ascending: false })
          .limit(8),
        user
          ? supabase.from("user_roles").select("role").eq("user_id", user.id)
          : Promise.resolve({ data: [] }),
      ]);

      setApplications(
        (applicationsRes.data ?? []).map((item: any) => ({
          id: item.id,
          full_name: item.profiles?.full_name ?? "Applicant",
          country: item.country,
          created_at: item.created_at,
          status: item.status,
        })),
      );

      setNominations(
        (nominationsRes.data ?? []).map((item: any) => ({
          id: item.id,
          full_name: item.full_name,
          country: item.country,
          created_at: item.created_at,
          vote_count: item.vote_count,
        })),
      );

      setRepresentatives(
        (representativesRes.data ?? []).map((item: any) => ({
          id: item.id,
          full_name: item.full_name,
          country: item.country,
          created_at: item.verified_at,
        })),
      );

      const roles = (rolesRes.data ?? []).map((item: any) => item.role);
      if (roles.includes("super_admin")) {
        setRoleLabel("Super Admin");
        setIsSuperAdmin(true);
      } else if (roles.includes("admin")) {
        setRoleLabel("Admin");
        setIsSuperAdmin(true);
      } else {
        setRoleLabel("Moderator");
      }
    };

    void loadDashboard();
  }, []);

  const stats = useMemo(
    () => [
      { label: "Pending applications", value: applications.filter((item) => item.status === "pending").length, icon: FileClock },
      { label: "Qualified nominees", value: nominations.length, icon: Vote },
      { label: "Verified delegates", value: representatives.length, icon: Trophy },
      { label: "Access level", value: roleLabel, icon: ShieldCheck },
    ],
    [applications, nominations, representatives, roleLabel],
  );

  return (
    <Layout>
      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="container">
          <AnimatedSection>
            <Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">Admin Surface</Badge>
            <h1 className="mt-4 text-4xl font-black md:text-5xl">Parliament Operations Dashboard</h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/75">
              Review applications, track nominee momentum, and verify public delegates for each ECOWAS delegation.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container space-y-10">
          {/* Quick Navigation for Admin/Super Admin */}
          {isSuperAdmin && (
            <AnimatedSection>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to="/admin/users" className="group">
                  <Card className="border-border bg-card shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <UserPlus className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-card-foreground">User Management</p>
                        <p className="text-sm text-muted-foreground">Invite users, assign roles</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/admin/project" className="group">
                  <Card className="border-border bg-card shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-card-foreground">Project Dashboard</p>
                        <p className="text-sm text-muted-foreground">Programme tracking, milestones</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/events" className="group">
                  <Card className="border-border bg-card shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-card-foreground">Events</p>
                        <p className="text-sm text-muted-foreground">Manage events, registrations</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </AnimatedSection>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <AnimatedSection key={stat.label} delay={index * 60}>
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-muted-foreground">{stat.label}</CardTitle>
                      <div className="rounded-xl bg-primary/10 p-2 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-black text-card-foreground">{stat.value}</div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            {[
              { title: "Application review queue", items: applications, cta: "Approve in Supabase" },
              { title: "Nomination leaderboard", items: nominations, cta: "Review top nominees" },
              { title: "Published delegates", items: representatives, cta: "Verify public bios" },
            ].map((group, index) => (
              <AnimatedSection key={group.title} delay={index * 80}>
                <Card className="h-full border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-card-foreground">{group.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {group.items.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-sm text-muted-foreground">
                        No records yet — once people apply or moderators verify profiles, they will appear here.
                      </div>
                    ) : (
                      group.items.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-border bg-background p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-foreground">{item.full_name}</p>
                              <p className="text-sm text-muted-foreground">{item.country}</p>
                            </div>
                            {item.status && <Badge variant="outline">{item.status}</Badge>}
                            {typeof item.vote_count === "number" && <Badge className="bg-primary/10 text-primary">{item.vote_count} votes</Badge>}
                            {!item.status && typeof item.vote_count !== "number" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </div>
                        </div>
                      ))
                    )}
                    <Button variant="outline" className="w-full">{group.cta}</Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection>
            <Card className="border-border bg-muted/40 shadow-sm">
              <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-foreground">Country-level delegation management</h2>
                  <p className="mt-2 max-w-2xl text-muted-foreground">
                    Seat allocations now come from the secure `countries` table, while applications, nominations, votes, and representative publishing are protected by RLS and role checks.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-card-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Admins can manage everything; moderators can review queues and publish verified delegates.
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;
