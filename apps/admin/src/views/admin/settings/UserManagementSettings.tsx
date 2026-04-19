import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  KeyRound, Trash2, UserPlus, Mail, X, Loader2, AlertOctagon, Eye, EyeOff, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthContext as useAuth } from "@/contexts/AuthContext";

type ProfileWithRole = {
  id: string;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
  roles: string[];
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  accepted_at: string | null;
  expires_at: string | null;
  resent_at: string | null;
};

const APP_ROLES = ["admin", "moderator", "super_admin", "sponsor", "media"];

const UserManagementSettings = () => {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();

  // State
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedInvites, setSelectedInvites] = useState<Set<string>>(new Set());
  const [bulkInviteOpen, setBulkInviteOpen] = useState(false);
  const [bulkEmails, setBulkEmails] = useState("");
  const [bulkRole, setBulkRole] = useState("admin");
  const [bulkInviting, setBulkInviting] = useState(false);

  // Email connect modal
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTargetUser, setEmailTargetUser] = useState<ProfileWithRole | null>(null);
  const [emailAddress, setEmailAddress] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailConnecting, setEmailConnecting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showEmailPw, setShowEmailPw] = useState(false);

  // Fetch profiles + roles
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-all-profiles"],
    queryFn: async () => {
      const { data: profs, error: profErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, is_active")
        .order("full_name");
      if (profErr) throw profErr;

      const { data: allRoles, error: roleErr } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (roleErr) throw roleErr;

      const roleMap: Record<string, string[]> = {};
      for (const r of (allRoles ?? [])) {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      }

      return (profs ?? []).map((p: any) => ({
        ...p,
        roles: roleMap[p.id] ?? [],
      })) as ProfileWithRole[];
    },
  });

  // Fetch invitations
  const { data: invitations = [], isLoading: invLoading } = useQuery({
    queryKey: ["admin-invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invitations")
        .select("id, email, role, created_at, accepted_at, expires_at, resent_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Invitation[];
    },
  });

  const pendingInvites = invitations.filter(i => !i.accepted_at);

  const isExpired = (inv: Invitation) =>
    !inv.accepted_at && !!inv.expires_at && new Date(inv.expires_at) < new Date();

  // Mutations
  const updateRole = useMutation({
    mutationFn: async ({ userId, newRole, oldRoles }: { userId: string; newRole: string; oldRoles: string[] }) => {
      // Remove old non-super_admin roles, add new one
      for (const old of oldRoles) {
        if (old === "super_admin") continue;
        await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", old);
      }
      if (newRole) {
        await supabase.from("user_roles").upsert(
          { user_id: userId, role: newRole },
          { onConflict: "user_id,role" }
        );
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-all-profiles"] }); toast.success("Role updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-all-profiles"] }); toast.success("Status updated"); },
  });

  const sendReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) toast.error(error.message);
    else toast.success(`Reset email sent to ${email}`);
  };

  // Delete users
  const deleteUsers = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} user(s)? This cannot be undone.`)) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("delete-user", {
        body: { user_ids: ids },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const results = res.data?.results ?? [];
      const failed = results.filter((r: any) => !r.success);
      if (failed.length > 0) {
        toast.error(`${failed.length} deletion(s) failed`);
      } else {
        toast.success(`${ids.length} user(s) deleted`);
      }
      setSelectedUsers(new Set());
      qc.invalidateQueries({ queryKey: ["admin-all-profiles"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Delete invitations
  const deleteInvitations = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} invitation(s)?`)) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("delete-invite", {
        body: { invitation_ids: ids },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error || data?.error) throw new Error(error?.message ?? data?.error);
      setSelectedInvites(new Set());
      qc.invalidateQueries({ queryKey: ["admin-invitations"] });
      toast.success(`${ids.length} invitation(s) deleted`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Resend invitation
  const resendInvite = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("resend-invite", {
        body: { invitation_id: id },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error || data?.error) throw new Error(error?.message ?? data?.error);
      toast.success("Invitation resent successfully");
      qc.invalidateQueries({ queryKey: ["admin-invitations"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Bulk invite
  const handleBulkInvite = async () => {
    const emailList = bulkEmails.split(/[,;\n]+/).map(e => e.trim()).filter(Boolean);
    if (emailList.length === 0) return;
    setBulkInviting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("bulk-invite", {
        body: { emails: emailList, role: bulkRole },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const results = res.data?.results ?? [];
      const success = results.filter((r: any) => r.success).length;
      const failed = results.filter((r: any) => !r.success);
      if (success > 0) toast.success(`${success} invitation(s) sent`);
      if (failed.length > 0) toast.error(`${failed.length} failed: ${failed.map((f: any) => f.error).join(", ")}`);
      setBulkInviteOpen(false);
      setBulkEmails("");
      qc.invalidateQueries({ queryKey: ["admin-invitations"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBulkInviting(false);
    }
  };

  // Admin email connect for another user
  const openEmailModal = (profile: ProfileWithRole) => {
    setEmailTargetUser(profile);
    setEmailAddress(profile.email ?? "");
    setEmailPassword("");
    setEmailError("");
    setEmailModalOpen(true);
  };

  const handleAdminEmailConnect = async () => {
    if (!emailAddress.trim() || !emailPassword.trim() || !emailTargetUser) return;
    setEmailConnecting(true);
    setEmailError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("validate-email-credentials", {
        body: { email: emailAddress.trim(), password: emailPassword, target_user_id: emailTargetUser.id },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const data = res.data as { valid: boolean; error?: string };
      if (!data.valid) {
        setEmailError(data.error ?? "Invalid credentials");
        return;
      }
      toast.success(`Email connected for ${emailTargetUser.full_name ?? emailTargetUser.email}`);
      setEmailModalOpen(false);
    } catch (e: any) {
      setEmailError(e.message);
    } finally {
      setEmailConnecting(false);
    }
  };

  const toggleUserSelect = (id: string) => {
    const next = new Set(selectedUsers);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedUsers(next);
  };

  const toggleInviteSelect = (id: string) => {
    const next = new Set(selectedInvites);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedInvites(next);
  };

  const getPrimaryRole = (roles: string[]) => {
    if (roles.includes("super_admin")) return "super_admin";
    return roles[0] ?? "";
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users ({profiles.length})</TabsTrigger>
          <TabsTrigger value="invitations">Invitations ({pendingInvites.length})</TabsTrigger>
        </TabsList>

        {/* ── Users Tab ── */}
        <TabsContent value="users" className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setBulkInviteOpen(true)}>
              <UserPlus size={14} className="mr-1.5" /> Bulk Invite
            </Button>
            {selectedUsers.size > 0 && (
              <Button size="sm" variant="destructive" onClick={() => deleteUsers(Array.from(selectedUsers))}>
                <Trash2 size={14} className="mr-1.5" /> Delete Selected ({selectedUsers.size})
              </Button>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 w-10">
                    <Checkbox
                      checked={profiles.length > 0 && selectedUsers.size === profiles.length}
                      onCheckedChange={() => {
                        if (selectedUsers.size === profiles.length) setSelectedUsers(new Set());
                        else setSelectedUsers(new Set(profiles.map(p => p.id)));
                      }}
                    />
                  </th>
                  {["User", "Role", "Active", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-border">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : (
                  profiles.map((p) => {
                    const isSelf = p.id === currentUser?.id;
                    const isSuperAdmin = p.roles.includes("super_admin");
                    const primaryRole = getPrimaryRole(p.roles);
                    return (
                      <tr key={p.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-3">
                          <Checkbox
                            checked={selectedUsers.has(p.id)}
                            onCheckedChange={() => toggleUserSelect(p.id)}
                            disabled={isSelf || isSuperAdmin}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-foreground">{p.full_name ?? "—"}</p>
                            <p className="text-xs text-muted-foreground">{p.email ?? "—"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {isSuperAdmin ? (
                            <Badge variant="secondary" className="text-primary bg-primary/10">super_admin</Badge>
                          ) : (
                            <Select
                              value={primaryRole}
                              onValueChange={(v) => updateRole.mutate({ userId: p.id, newRole: v, oldRoles: p.roles })}
                              disabled={isSelf}
                            >
                              <SelectTrigger className="h-7 w-44 text-xs">
                                <SelectValue placeholder="No role" />
                              </SelectTrigger>
                              <SelectContent>
                                {APP_ROLES.filter(r => r !== "super_admin").map((r) => (
                                  <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Switch
                            checked={p.is_active !== false}
                            onCheckedChange={(v) => toggleActive.mutate({ id: p.id, is_active: v })}
                            disabled={isSelf || isSuperAdmin}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1.5 text-xs"
                              onClick={() => p.email && sendReset(p.email)}
                              disabled={!p.email}
                              title="Reset Password"
                            >
                              <KeyRound size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1.5 text-xs"
                              onClick={() => openEmailModal(p)}
                              title="Connect Email"
                            >
                              <Mail size={12} />
                            </Button>
                            {!isSelf && !isSuperAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
                                onClick={() => deleteUsers([p.id])}
                                title="Delete User"
                              >
                                <Trash2 size={12} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── Invitations Tab ── */}
        <TabsContent value="invitations" className="space-y-3">
          <div className="flex items-center gap-2">
            {selectedInvites.size > 0 && (
              <Button size="sm" variant="destructive" onClick={() => deleteInvitations(Array.from(selectedInvites))}>
                <Trash2 size={14} className="mr-1.5" /> Delete Selected ({selectedInvites.size})
              </Button>
            )}
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 w-10">
                    <Checkbox
                      checked={pendingInvites.length > 0 && selectedInvites.size === pendingInvites.length}
                      onCheckedChange={() => {
                        if (selectedInvites.size === pendingInvites.length) setSelectedInvites(new Set());
                        else setSelectedInvites(new Set(pendingInvites.map(i => i.id)));
                      }}
                    />
                  </th>
                  {["Email", "Role", "Sent", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-t border-border">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : invitations.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No invitations</td></tr>
                ) : (
                  invitations.map(inv => {
                    const expired = isExpired(inv);
                    return (
                      <tr key={inv.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-3">
                          <Checkbox
                            checked={selectedInvites.has(inv.id)}
                            onCheckedChange={() => toggleInviteSelect(inv.id)}
                            disabled={!!inv.accepted_at}
                          />
                        </td>
                        <td className="px-4 py-3 text-foreground">{inv.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">{inv.role}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(inv.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {inv.accepted_at ? (
                            <Badge className="bg-emerald-500/15 text-emerald-600 border-0 text-xs">Accepted</Badge>
                          ) : expired ? (
                            <Badge className="bg-destructive/15 text-destructive border-0 text-xs">Expired</Badge>
                          ) : (
                            <Badge className="bg-amber-500/15 text-amber-600 border-0 text-xs">Invite Sent</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {inv.accepted_at ? null : (
                            <div className="flex items-center gap-1">
                              {expired && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => resendInvite(inv.id)}
                                  title="Resend Invite"
                                >
                                  <RefreshCw size={12} className="mr-1" /> Resend
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive"
                                onClick={() => deleteInvitations([inv.id])}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Bulk Invite Modal ── */}
      {bulkInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Bulk Invite Users</h3>
              <button onClick={() => setBulkInviteOpen(false)}><X size={16} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Emails (comma or newline separated)</Label>
                <Textarea
                  value={bulkEmails}
                  onChange={e => setBulkEmails(e.target.value)}
                  placeholder="user1@example.com, user2@example.com"
                  rows={4}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={bulkRole} onValueChange={setBulkRole}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APP_ROLES.filter(r => r !== "super_admin").map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setBulkInviteOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleBulkInvite} disabled={bulkInviting || !bulkEmails.trim()} className="flex-1">
                {bulkInviting ? <><Loader2 size={14} className="animate-spin mr-1.5" />Sending…</> : <><UserPlus size={14} className="mr-1.5" />Send Invites</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Email Connect Modal ── */}
      {emailModalOpen && emailTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Connect Email for {emailTargetUser.full_name ?? emailTargetUser.email}</h3>
              <button onClick={() => setEmailModalOpen(false)}><X size={16} className="text-muted-foreground" /></button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the Zoho email credentials for this user. The IMAP/SMTP server settings come from the global email config.
            </p>
            {emailError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <AlertOctagon size={13} className="text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{emailError}</p>
              </div>
            )}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={emailAddress}
                  onChange={e => { setEmailAddress(e.target.value); setEmailError(""); }}
                  placeholder="user@ecowas.int"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showEmailPw ? "text" : "password"}
                    value={emailPassword}
                    onChange={e => { setEmailPassword(e.target.value); setEmailError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleAdminEmailConnect()}
                    placeholder="Email password"
                    className="pr-9"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowEmailPw(!showEmailPw)}
                  >
                    {showEmailPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setEmailModalOpen(false)} className="flex-1">Cancel</Button>
              <Button
                onClick={handleAdminEmailConnect}
                disabled={emailConnecting || !emailAddress.trim() || !emailPassword.trim()}
                className="flex-1"
              >
                {emailConnecting ? <><Loader2 size={14} className="animate-spin mr-1.5" />Verifying…</> : <><Mail size={14} className="mr-1.5" />Connect</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementSettings;
