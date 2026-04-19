import { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { inviteUser } from "@/services/inviteUser";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Mail, Users, Loader2, Plus, Pencil, Trash2, RefreshCw,
  ShieldOff, KeyRound, Search, Crown, ShieldCheck, Eye, Shield,
  CheckCircle2, XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type PermissionTier = "tier1" | "tier2" | "tier3";
type UserStatus = "active" | "suspended";

const PERMISSION_TIERS: Record<PermissionTier, { label: string; colour: string; bg: string }> = {
  tier1: { label: "Tier 1 — Admin",     colour: "text-[#008244]", bg: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  tier2: { label: "Tier 2 — Manager",   colour: "text-[#e4ca00]", bg: "bg-yellow-50 border-yellow-200 text-yellow-800"   },
  tier3: { label: "Tier 3 — Read Only", colour: "text-gray-500",  bg: "bg-gray-100 border-gray-200 text-gray-600"         },
};

const DEPARTMENTS = [
  "Civic Education",
  "Youth Parliament",
  "Youth Innovation",
  "Women's Forum",
  "Trade & SME",
  "Communications",
  "Finance",
  "Logistics",
  "Marketing",
  "Operations",
];

const APP_ROLES = [
  "super_admin", "admin", "moderator", "project_director", "programme_lead",
  "website_editor", "marketing_manager", "communications_officer",
  "finance_coordinator", "logistics_coordinator", "sponsor_manager", "consultant", "sponsor",
] as const;

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  job_title: string | null;
  phone: string | null;
  country: string | null;
  avatar_url: string | null;
  permission_tier: PermissionTier | null;
  departments: string[];
  status: UserStatus;
  has_email_account: boolean;
  email_address: string | null;
  roles: string[];
  created_at: string;
}

// ─── User Form Dialog ─────────────────────────────────────────────────────────
interface UserFormProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function UserFormDialog({ user, open, onClose, onSaved }: UserFormProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const isEdit = !!user;
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName]           = useState(user?.full_name ?? "");
  const [jobTitle, setJobTitle]           = useState(user?.job_title ?? "");
  const [email, setEmail]                 = useState(user?.email ?? "");
  const [phone, setPhone]                 = useState(user?.phone ?? "");
  const [permTier, setPermTier]           = useState<PermissionTier>(user?.permission_tier ?? "tier3");
  const [departments, setDepts]           = useState<string[]>(user?.departments ?? []);
  const [assignEmail, setAssignEmail]     = useState(user?.has_email_account ?? false);
  const [emailPrefix, setEmailPrefix]     = useState<string>(() => {
    if (user?.email_address) return user.email_address.split("@")[0];
    return fullName.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
  });
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url ?? null);
  const [saving, setSaving]               = useState(false);

  useEffect(() => {
    if (!isEdit && fullName && !emailPrefix) {
      setEmailPrefix(fullName.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, ""));
    }
  }, [fullName]);

  const toggleDept = (d: string) =>
    setDepts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token;
  };

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      toast({ title: "Required fields missing", description: "Full name and email are required.", variant: "destructive" });
      return;
    }
    setSaving(true);

    try {
      const token = await getToken();
      let avatarUrl = user?.avatar_url ?? null;

      // Upload avatar if changed
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${isEdit ? user!.id : "new"}-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("profile-photos")
          .upload(path, avatarFile, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("profile-photos").getPublicUrl(path);
          avatarUrl = urlData.publicUrl;
        }
      }

      if (isEdit) {
        // Update profile
        await supabase.from("profiles").update({
          full_name: fullName.trim(),
          job_title: jobTitle.trim() || null,
          phone: phone.trim() || null,
          permission_tier: permTier,
          departments,
          avatar_url: avatarUrl,
        }).eq("id", user!.id);

        // Handle email account changes
        if (assignEmail && !user!.has_email_account) {
          await supabase.functions.invoke("create-email-account", {
            body: { userId: user!.id, emailPrefix, displayName: fullName.trim() },
            headers: { Authorization: `Bearer ${token}` },
          });
          toast({ title: "Email account created", description: `${emailPrefix}@ecowasparliamentinitiatives.org` });
        } else if (!assignEmail && user!.has_email_account) {
          await supabase.functions.invoke("delete-email-account", {
            body: { userId: user!.id, emailAddress: user!.email_address },
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } else {
        // New user — send invite via centralized service
        await inviteUser({
          email: email.trim(),
          role: permTier === "tier1" ? "admin" : "moderator",
          metadata: { full_name: fullName.trim() },
        });

        // Wait briefly then update profile with extra fields
        setTimeout(async () => {
          const { data: profile } = await supabase.from("profiles").select("id").eq("email", email.trim()).single();
          if (profile?.id) {
            await supabase.from("profiles").update({
              full_name: fullName.trim(),
              job_title: jobTitle.trim() || null,
              phone: phone.trim() || null,
              permission_tier: permTier,
              departments,
              avatar_url: avatarUrl,
            }).eq("id", profile.id);

            if (assignEmail && emailPrefix) {
              await supabase.functions.invoke("create-email-account", {
                body: { userId: profile.id, emailPrefix, displayName: fullName.trim() },
                headers: { Authorization: `Bearer ${token}` },
              });
            }
          }
        }, 2000);
      }

      toast({ title: isEdit ? "User updated" : "Invitation sent", description: isEdit ? `${fullName} has been updated.` : `Invite sent to ${email}.` });
      onSaved();
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save user", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">{isEdit ? "Edit User" : "Invite New User"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this user's profile and access settings."
              : "Send an invitation email. The user will set their password via the link."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Avatar upload */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary transition-colors flex-shrink-0"
            >
              {avatarPreview
                ? <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar" />
                : <span className="text-2xl font-bold text-primary">{(fullName || "?").charAt(0).toUpperCase()}</span>
              }
            </div>
            <div>
              <button onClick={() => fileRef.current?.click()} className="text-xs text-primary hover:underline font-medium">
                Upload photo
              </button>
              <p className="text-[11px] text-muted-foreground mt-0.5">JPG or PNG, max 2MB. Stored in profile-photos bucket.</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>

          {/* Core fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full Name *</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ibrahim Al-Hassan" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Role / Job Title</Label>
              <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Finance Coordinator" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {!isEdit && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Email Address *</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phone Number</Label>
              <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000" />
            </div>
          </div>

          {/* Permission tier */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Permission Level</Label>
            <Select value={permTier} onValueChange={v => setPermTier(v as PermissionTier)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(PERMISSION_TIERS) as [PermissionTier, typeof PERMISSION_TIERS[PermissionTier]][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    <span className={`font-medium ${v.colour}`}>{v.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Departments */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Department / Programme Assignment</Label>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDept(d)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    departments.includes(d)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Email account */}
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Assign Email Account</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Creates a Zoho mailbox at <span className="font-mono text-primary">ecowasparliamentinitiatives.org</span>
                </p>
              </div>
              <Switch checked={assignEmail} onCheckedChange={setAssignEmail} />
            </div>
            {assignEmail && (
              <div className="flex items-center gap-2">
                <Input
                  value={emailPrefix}
                  onChange={e => setEmailPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                  placeholder="firstname.lastname"
                  className="max-w-[200px] font-mono text-sm"
                />
                <span className="text-sm text-muted-foreground font-mono">@ecowasparliamentinitiatives.org</span>
              </div>
            )}
          </div>

          {!isEdit && (
            <div className="rounded-lg bg-muted/40 border border-border p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Password flow:</strong> An invitation email will be sent to the user. They click the link to set their own password privately. The link expires in 24 hours. You will never see their password.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={saving || !fullName.trim()} onClick={handleSave} className="gap-2">
            {saving && <Loader2 size={13} className="animate-spin" />}
            {isEdit ? "Save Changes" : "Create & Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({
  open, title, description, confirmLabel, variant = "destructive", onConfirm, onClose,
}: {
  open: boolean; title: string; description: string; confirmLabel: string;
  variant?: "destructive" | "default"; onConfirm: () => Promise<void>; onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            variant={variant}
            disabled={loading}
            onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); onClose(); }}
            className="gap-1"
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers]         = useState<AdminUser[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [formOpen, setFormOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "suspend" | "delete" | "reset";
    user: AdminUser;
  } | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdminUser, setIsAdminUser]   = useState(false);

  useEffect(() => { loadData(); }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);

    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", currentUser.id);
    const myRoles = (roleData ?? []).map((r: any) => r.role);
    setIsSuperAdmin(myRoles.includes("super_admin"));
    setIsAdminUser(myRoles.includes("super_admin") || myRoles.includes("admin"));

    const [profilesRes, allRolesRes, emailAcctsRes] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, job_title, phone, country, avatar_url, permission_tier, departments, status, has_email_account, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("email_accounts").select("user_id, email_address, is_active").eq("is_active", true),
    ]);

    const rolesMap = new Map<string, string[]>();
    (allRolesRes.data ?? []).forEach((r: any) => {
      const existing = rolesMap.get(r.user_id) || [];
      existing.push(r.role);
      rolesMap.set(r.user_id, existing);
    });

    const emailMap = new Map<string, string>();
    (emailAcctsRes.data ?? []).forEach((a: any) => emailMap.set(a.user_id, a.email_address));

    setUsers((profilesRes.data ?? []).map((p: any) => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      job_title: p.job_title,
      phone: p.phone,
      country: p.country,
      avatar_url: p.avatar_url,
      permission_tier: p.permission_tier ?? null,
      departments: p.departments ?? [],
      status: p.status ?? "active",
      has_email_account: p.has_email_account ?? false,
      email_address: emailMap.get(p.id) ?? null,
      roles: rolesMap.get(p.id) ?? [],
      created_at: p.created_at,
    })));

    setLoading(false);
  };

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token;
  };

  const handleSuspend = async (u: AdminUser) => {
    const newStatus = u.status === "active" ? "suspended" : "active";
    await supabase.from("profiles").update({ status: newStatus }).eq("id", u.id);
    if (newStatus === "suspended") {
      // Sign out all sessions
      await supabase.auth.admin?.signOut?.(u.id, "others");
    }
    toast({ title: newStatus === "suspended" ? "User suspended" : "User reactivated" });
    loadData();
  };

  const handleDelete = async (u: AdminUser) => {
    const token = await getToken();
    // Remove email account if exists
    if (u.has_email_account) {
      await supabase.functions.invoke("delete-email-account", {
        body: { userId: u.id, emailAddress: u.email_address },
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    await supabase.from("user_roles").delete().eq("user_id", u.id);
    await supabase.from("profiles").delete().eq("id", u.id);
    toast({ title: "User deleted" });
    loadData();
  };

  const handleForceReset = async (u: AdminUser) => {
    const token = await getToken();
    const emailAddr = u.has_email_account && u.email_address ? u.email_address : u.email;
    const res = await supabase.functions.invoke("send-invite", {
      body: { userId: u.id, emailAddress: emailAddr },
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.error) {
      toast({ title: "Error", description: res.error.message, variant: "destructive" });
    } else {
      toast({ title: "Password reset link sent", description: `Sent to ${emailAddr}` });
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.full_name ?? "").toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q) ||
      (u.job_title ?? "").toLowerCase().includes(q)
    );
  });

  const initials = (name: string | null) =>
    (name ?? "?").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container">
          <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">
            Admin Panel
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black">User Configuration</h1>
          <p className="mt-3 text-primary-foreground/70 max-w-2xl">
            Create and manage user accounts, assign roles, configure email access, and control platform permissions.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container space-y-6">
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total users",    value: users.length,                                          icon: Users,        colour: "bg-primary/10 text-primary"          },
              { label: "Active",         value: users.filter(u => u.status === "active").length,       icon: CheckCircle2, colour: "bg-emerald-50 text-emerald-700"       },
              { label: "Suspended",      value: users.filter(u => u.status === "suspended").length,    icon: XCircle,      colour: "bg-red-50 text-red-700"               },
              { label: "Email accounts", value: users.filter(u => u.has_email_account).length,         icon: Mail,         colour: "bg-blue-50 text-blue-700"             },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="border border-border rounded-xl p-4 flex items-center gap-3 bg-card">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.colour}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                    <p className="text-xl font-bold">{loading ? "…" : s.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, role…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5">
                <RefreshCw size={13} /> Refresh
              </Button>
              {isAdminUser && (
                <Button size="sm" onClick={() => { setEditTarget(null); setFormOpen(true); }} className="gap-1.5">
                  <Plus size={13} /> New User
                </Button>
              )}
            </div>
          </div>

          {/* User table */}
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <Users size={28} className="text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      {["User", "Permission", "Email Account", "Departments", "Status", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map(u => {
                      const tierCfg = u.permission_tier ? PERMISSION_TIERS[u.permission_tier] : null;
                      return (
                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                          {/* User */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {u.avatar_url
                                  ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" width={32} height={32} loading="lazy" decoding="async" />
                                  : <span className="text-[11px] font-bold text-primary">{initials(u.full_name)}</span>
                                }
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{u.full_name || "—"}</p>
                                <p className="text-[11px] text-muted-foreground">{u.email}</p>
                                {u.job_title && <p className="text-[10px] text-muted-foreground/70">{u.job_title}</p>}
                              </div>
                            </div>
                          </td>

                          {/* Permission */}
                          <td className="px-4 py-3">
                            {tierCfg
                              ? <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${tierCfg.bg}`}>{tierCfg.label.split(" — ")[1]}</span>
                              : <span className="text-xs text-muted-foreground">—</span>
                            }
                          </td>

                          {/* Email */}
                          <td className="px-4 py-3">
                            {u.has_email_account && u.email_address
                              ? <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 w-fit">
                                  <Mail size={10} /> Email Active
                                </span>
                              : <span className="text-[11px] text-muted-foreground">No Email</span>
                            }
                          </td>

                          {/* Departments */}
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                              {u.departments.slice(0, 2).map(d => (
                                <span key={d} className="text-[10px] bg-muted border border-border rounded px-1.5 py-0.5">{d}</span>
                              ))}
                              {u.departments.length > 2 && (
                                <span className="text-[10px] text-muted-foreground">+{u.departments.length - 2}</span>
                              )}
                              {u.departments.length === 0 && <span className="text-[10px] text-muted-foreground">—</span>}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            {u.status === "active"
                              ? <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700"><CheckCircle2 size={12} /> Active</span>
                              : <span className="flex items-center gap-1 text-[11px] font-medium text-red-600"><XCircle size={12} /> Suspended</span>
                            }
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            {isAdminUser && u.id !== currentUser?.id && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => { setEditTarget(u); setFormOpen(true); }}
                                  className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => setConfirmAction({ type: "reset", user: u })}
                                  className="p-1.5 rounded text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                  title="Force password reset"
                                >
                                  <KeyRound size={13} />
                                </button>
                                <button
                                  onClick={() => setConfirmAction({ type: "suspend", user: u })}
                                  className="p-1.5 rounded text-muted-foreground hover:text-orange-600 hover:bg-orange-50 transition-colors"
                                  title={u.status === "active" ? "Suspend" : "Reactivate"}
                                >
                                  <ShieldOff size={13} />
                                </button>
                                {isSuperAdmin && (
                                  <button
                                    onClick={() => setConfirmAction({ type: "delete", user: u })}
                                    className="p-1.5 rounded text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Delete user"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Create / Edit dialog */}
      <UserFormDialog
        user={editTarget}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSaved={loadData}
      />

      {/* Confirm dialogs */}
      {confirmAction && (
        <ConfirmDialog
          open
          title={
            confirmAction.type === "delete" ? "Delete User" :
            confirmAction.type === "suspend" ? (confirmAction.user.status === "active" ? "Suspend User" : "Reactivate User") :
            "Force Password Reset"
          }
          description={
            confirmAction.type === "delete"
              ? `Permanently delete ${confirmAction.user.full_name || confirmAction.user.email}? This will remove all their data and deactivate their email account.`
              : confirmAction.type === "suspend"
              ? confirmAction.user.status === "active"
                ? `Suspend ${confirmAction.user.full_name || confirmAction.user.email}? They will be signed out immediately and cannot log in.`
                : `Reactivate ${confirmAction.user.full_name || confirmAction.user.email}? They will be able to log in again.`
              : `Send a password reset link to ${confirmAction.user.full_name || confirmAction.user.email}? Their current password will be invalidated.`
          }
          confirmLabel={
            confirmAction.type === "delete" ? "Delete" :
            confirmAction.type === "suspend" ? (confirmAction.user.status === "active" ? "Suspend" : "Reactivate") :
            "Send Reset Link"
          }
          variant={confirmAction.type === "delete" ? "destructive" : "default"}
          onConfirm={async () => {
            if (confirmAction.type === "delete")  await handleDelete(confirmAction.user);
            if (confirmAction.type === "suspend") await handleSuspend(confirmAction.user);
            if (confirmAction.type === "reset")   await handleForceReset(confirmAction.user);
          }}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </Layout>
  );
}
