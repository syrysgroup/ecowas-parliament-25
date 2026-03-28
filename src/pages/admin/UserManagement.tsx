import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Mail, ShieldCheck, Users, Send, Loader2, UserPlus, Crown, Shield, Eye } from "lucide-react";

type AppRole = "super_admin" | "admin" | "moderator" | "sponsor";

const ROLE_CONFIG: Record<AppRole, { label: string; icon: React.ElementType; colour: string; desc: string }> = {
  super_admin: { label: "Super Admin", icon: Crown, colour: "bg-amber-100 text-amber-800", desc: "Full access — manages all users, roles, and system settings" },
  admin: { label: "Admin", icon: ShieldCheck, colour: "bg-primary/10 text-primary", desc: "Manages content, applications, nominations, and representatives" },
  moderator: { label: "Moderator", icon: Eye, colour: "bg-blue-100 text-blue-700", desc: "Reviews applications, nominations, and publishes verified delegates" },
  sponsor: { label: "Sponsor", icon: Shield, colour: "bg-violet-100 text-violet-700", desc: "Access to sponsor dashboard with visibility metrics" },
};

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
  country: string;
  roles: AppRole[];
}

interface Invitation {
  id: string;
  email: string;
  role: AppRole;
  created_at: string;
  accepted_at: string | null;
}

export default function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("moderator");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    // Check if current user is super_admin
    const { data: roleData } = await (supabase as any)
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const roles = (roleData ?? []).map((r: any) => r.role);
    setIsSuperAdmin(roles.includes("super_admin"));

    // Load all users with roles
    const { data: profilesData } = await (supabase as any)
      .from("profiles")
      .select("id, email, full_name, country")
      .order("created_at", { ascending: false });

    const { data: allRoles } = await (supabase as any)
      .from("user_roles")
      .select("user_id, role");

    const rolesMap = new Map<string, AppRole[]>();
    (allRoles ?? []).forEach((r: any) => {
      const existing = rolesMap.get(r.user_id) || [];
      existing.push(r.role);
      rolesMap.set(r.user_id, existing);
    });

    setUsers(
      (profilesData ?? []).map((p: any) => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        country: p.country,
        roles: rolesMap.get(p.id) || [],
      }))
    );

    // Load invitations
    const { data: invData } = await (supabase as any)
      .from("invitations")
      .select("*")
      .order("created_at", { ascending: false });

    setInvitations(invData ?? []);
    setLoading(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSending(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const res = await supabase.functions.invoke("invite-user", {
        body: { email: inviteEmail.trim(), role: inviteRole },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.error) throw res.error;

      toast({ title: "Invitation sent", description: `${inviteEmail} invited as ${inviteRole}` });
      setInviteEmail("");
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send invitation", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleRoleChange = async (userId: string, role: AppRole, action: "add" | "remove") => {
    try {
      if (action === "add") {
        await (supabase as any).from("user_roles").insert({ user_id: userId, role });
      } else {
        await (supabase as any).from("user_roles").delete().eq("user_id", userId).eq("role", role);
      }
      toast({ title: `Role ${action === "add" ? "added" : "removed"}` });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="py-24">
          <div className="container flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container">
          <AnimatedSection>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">
              Super Admin
            </Badge>
            <h1 className="text-3xl md:text-4xl font-black">User & Role Management</h1>
            <p className="mt-3 text-primary-foreground/70 max-w-2xl">
              Invite team members, assign roles, and manage access to the ECOWAS Parliament 25th Anniversary platform.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-10">
        <div className="container space-y-8">
          {/* Role definitions */}
          <AnimatedSection>
            <h2 className="text-xl font-bold mb-4">Role Definitions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.entries(ROLE_CONFIG) as [AppRole, typeof ROLE_CONFIG[AppRole]][]).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <Card key={key}>
                    <CardContent className="pt-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${cfg.colour}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="font-bold text-sm">{cfg.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{cfg.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </AnimatedSection>

          {/* Invite form */}
          {isSuperAdmin && (
            <AnimatedSection>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    Invite User by Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Label className="sr-only">Email</Label>
                      <Input
                        type="email"
                        required
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        maxLength={255}
                      />
                    </div>
                    <div className="w-full sm:w-40">
                      <Select value={inviteRole} onValueChange={v => setInviteRole(v as AppRole)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="sponsor">Sponsor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={sending} className="gap-2">
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send Invite
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </AnimatedSection>
          )}

          {/* Pending invitations */}
          {invitations.length > 0 && (
            <AnimatedSection>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Invitations ({invitations.filter(i => !i.accepted_at).length} pending)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {invitations.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{inv.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Invited {new Date(inv.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={ROLE_CONFIG[inv.role]?.colour || ""} variant="secondary">
                          {ROLE_CONFIG[inv.role]?.label || inv.role}
                        </Badge>
                        <Badge variant={inv.accepted_at ? "default" : "outline"}>
                          {inv.accepted_at ? "Accepted" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedSection>
          )}

          {/* Current users */}
          <AnimatedSection>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  All Users ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No users found.</p>
                ) : (
                  users.map(u => (
                    <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-semibold">{u.full_name || "No name"}</p>
                        <p className="text-xs text-muted-foreground">{u.email} · {u.country}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {u.roles.length === 0 && (
                          <span className="text-xs text-muted-foreground">No roles</span>
                        )}
                        {u.roles.map(role => (
                          <Badge key={role} className={`${ROLE_CONFIG[role]?.colour || ""} gap-1`} variant="secondary">
                            {ROLE_CONFIG[role]?.label || role}
                            {isSuperAdmin && u.id !== user?.id && (
                              <button
                                onClick={() => handleRoleChange(u.id, role, "remove")}
                                className="ml-1 text-xs hover:text-destructive"
                                title="Remove role"
                              >
                                ×
                              </button>
                            )}
                          </Badge>
                        ))}
                        {isSuperAdmin && u.id !== user?.id && (
                          <Select onValueChange={v => handleRoleChange(u.id, v as AppRole, "add")}>
                            <SelectTrigger className="h-7 w-28 text-xs">
                              <SelectValue placeholder="+ Role" />
                            </SelectTrigger>
                            <SelectContent>
                              {(["admin", "moderator", "sponsor"] as AppRole[])
                                .filter(r => !u.roles.includes(r))
                                .map(r => (
                                  <SelectItem key={r} value={r}>{ROLE_CONFIG[r].label}</SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
