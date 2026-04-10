import { useState, useCallback, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { AppRole } from "@/contexts/AuthContext";
import { CRM_ROLE_META } from "../crmRoles";
import {
  Send, Trash2, CheckCircle2, Clock, UserPlus, RefreshCw, X,
  Eye, Pencil, UserMinus, EyeOff, AlertTriangle, Globe, Plus, ExternalLink,
  Users, UserCheck, Mail, Shield, Loader2, Copy, Check,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploadOrUrl from "@/components/shared/ImageUploadOrUrl";

interface UserWithRoles {
  id: string; email: string; full_name: string; country: string;
  created_at: string; roles: AppRole[]; show_on_website: boolean;
}
interface Invitation {
  id: string; email: string; role: AppRole; created_at: string; accepted_at: string | null;
}
interface UserEmailSettings {
  smtp_host: string; smtp_port: number; smtp_user: string; smtp_password: string;
  imap_host: string; imap_port: number; auto_connect: boolean;
}
const EMPTY_EMAIL_SETTINGS: UserEmailSettings = {
  smtp_host: "", smtp_port: 587, smtp_user: "", smtp_password: "",
  imap_host: "", imap_port: 993, auto_connect: true,
};

const ADMIN_ASSIGNABLE_ROLES: AppRole[] = [
  "admin", "moderator", "project_director", "programme_lead",
  "website_editor", "marketing_manager", "communications_officer",
  "finance_coordinator", "logistics_coordinator", "sponsor_manager",
  "consultant", "sponsor",
];
const SUPER_ADMIN_ASSIGNABLE_ROLES: AppRole[] = ["super_admin", ...ADMIN_ASSIGNABLE_ROLES];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: number | string; color: string;
}) {
  return (
    <div className="bg-crm-card border border-crm-border rounded-xl p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xl font-bold text-crm-text">{value}</p>
        <p className="text-[11px] text-crm-text-muted">{label}</p>
      </div>
    </div>
  );
}

// ─── Add User Sheet ───────────────────────────────────────────────────────────
function AddUserSheet({ open, onClose, assignableRoles, onInvited, isSuperAdmin }: {
  open: boolean; onClose: () => void;
  assignableRoles: AppRole[]; onInvited: () => void; isSuperAdmin: boolean;
}) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("admin");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("invite-user", {
        body: { email: email.trim(), role, redirectUrl: `${window.location.origin}/set-password` },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const body = res.data as any;
      if (body?.error) throw new Error(body.error);
      toast({ title: "Invitation sent", description: `${email} — ${CRM_ROLE_META[role]?.label ?? role}` });
      setEmail("");
      onInvited();
      onClose();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="bg-crm-card border-crm-border text-crm-text w-[380px]">
        <SheetHeader>
          <SheetTitle className="text-sm font-semibold text-crm-text">Add User</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Email *</Label>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="john.doe@example.com" type="email"
              className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm" />
          </div>
          {isSuperAdmin && (
            <div className="space-y-1.5">
              <Label className="text-[11px] text-crm-text-muted">User Role</Label>
              <Select value={role} onValueChange={v => setRole(v as AppRole)}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border text-crm-text">
                  {assignableRoles.map(r => (
                    <SelectItem key={r} value={r}>{CRM_ROLE_META[r]?.label ?? r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleSubmit} disabled={sending || !email.trim()}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs flex-1">
              {sending ? "Sending…" : "Submit"}
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}
              className="border-crm-border text-crm-text-muted text-xs">Cancel</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── View User Dialog ────────────────────────────────────────────────────────
function ViewUserDialog({ target, onClose, isSuperAdmin }: { target: UserWithRoles; onClose: () => void; isSuperAdmin: boolean }) {
  const initials = target.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-crm-border flex items-center justify-center text-lg font-bold text-emerald-400 uppercase flex-shrink-0">{initials}</div>
            <div>
              <p className="text-[15px] font-bold text-crm-text">{target.full_name || "—"}</p>
              <p className="text-xs text-crm-text-muted mt-0.5">{target.email}</p>
              <p className="text-[11px] text-crm-text-dim mt-0.5">{target.country || "No country"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="bg-crm-surface border border-crm-border rounded-lg px-3 py-2">
              <p className="text-crm-text-dim mb-0.5">Joined</p>
              <p className="text-crm-text-secondary font-medium">{format(parseISO(target.created_at), "d MMM yyyy")}</p>
            </div>
            <div className="bg-crm-surface border border-crm-border rounded-lg px-3 py-2">
              <p className="text-crm-text-dim mb-0.5">Roles</p>
              <p className="text-crm-text-secondary font-medium">{target.roles.length} assigned</p>
            </div>
          </div>
          {isSuperAdmin && target.roles.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {target.roles.map(role => {
                const m = CRM_ROLE_META[role];
                return m ? (
                  <span key={role} className={`text-[10px] font-mono border rounded px-2 py-0.5 ${m.bgColour} ${m.colour} ${m.borderColour}`}>{m.label}</span>
                ) : null;
              })}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit User Dialog ────────────────────────────────────────────────────────
function EditUserDialog({ target, isSuperAdmin, onClose, onSaved }: {
  target: UserWithRoles; isSuperAdmin: boolean; onClose: () => void; onSaved: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [fullName, setFullName] = useState(target.full_name);
  const [country, setCountry] = useState(target.country);
  const [title, setTitle] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showOnWebsite, setShowOnWebsite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [emailCfg, setEmailCfg] = useState<UserEmailSettings>(EMPTY_EMAIL_SETTINGS);
  const [loadingEmail, setLoadingEmail] = useState(isSuperAdmin);
  const [showPass, setShowPass] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; error?: string } | null>(null);

  // Load global SMTP settings to auto-fill host/port
  const { data: globalSmtp } = useQuery({
    queryKey: ["site-settings-smtp"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("site_settings").select("value").eq("key", "smtp").single();
      return (data?.value as Record<string, any>) ?? {};
    },
  });

  useEffect(() => {
    setLoadingProfile(true);
    (supabase as any).from("profiles").select("title, organisation, bio, avatar_url, show_on_website")
      .eq("id", target.id).maybeSingle().then(({ data }: any) => {
        if (data) {
          setTitle(data.title ?? ""); setOrganisation(data.organisation ?? "");
          setBio(data.bio ?? ""); setAvatarUrl(data.avatar_url ?? "");
          setShowOnWebsite(data.show_on_website ?? false);
        }
        setLoadingProfile(false);
      });
  }, [target.id]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    setLoadingEmail(true);
    (supabase as any).from("user_email_settings").select("*").eq("user_id", target.id)
      .maybeSingle().then(({ data }: any) => {
        if (data) setEmailCfg({
          smtp_host: data.smtp_host ?? "", smtp_port: data.smtp_port ?? 587,
          smtp_user: data.smtp_user ?? "", smtp_password: data.smtp_password ?? "",
          imap_host: data.imap_host ?? "", imap_port: data.imap_port ?? 993,
          auto_connect: data.auto_connect ?? true,
        });
        setLoadingEmail(false);
      });
  }, [target.id, isSuperAdmin]);

  // Auto-fill from global settings
  useEffect(() => {
    if (globalSmtp && !loadingEmail) {
      setEmailCfg(c => ({
        ...c,
        smtp_host: (globalSmtp.host ?? c.smtp_host) || "smtppro.zoho.eu",
        smtp_port: Number((globalSmtp.port ?? c.smtp_port) || 465),
        imap_host: (globalSmtp.imap_host ?? c.imap_host) || "imappro.zoho.eu",
        imap_port: Number((globalSmtp.imap_port ?? c.imap_port) || 993),
      }));
    }
  }, [globalSmtp, loadingEmail]);

  const handleTestConnection = async () => {
    if (!emailCfg.smtp_user || !emailCfg.smtp_password) return;
    setTesting(true);
    setTestResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("validate-email-credentials", {
        body: { email: emailCfg.smtp_user, password: emailCfg.smtp_password, target_user_id: target.id },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const result = res.data as { valid: boolean; error?: string };
      setTestResult(result);
      if (result.valid) {
        toast({ title: "Connection successful", description: `${emailCfg.smtp_user} authenticated` });
      } else {
        toast({ title: "Connection failed", description: result.error ?? "Unknown error", variant: "destructive" });
      }
    } catch (err: any) {
      setTestResult({ valid: false, error: err.message });
      toast({ title: "Test failed", description: err.message, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error: profileErr } = await (supabase as any).from("profiles").update({
        full_name: fullName.trim(), country: country.trim(),
        title: title.trim() || null, organisation: organisation.trim() || null,
        bio: bio.trim() || null, avatar_url: avatarUrl || null, show_on_website: showOnWebsite,
      }).eq("id", target.id);
      if (profileErr) throw profileErr;

      if (isSuperAdmin) {
        await (supabase as any).from("user_email_settings").upsert({
          user_id: target.id, smtp_host: emailCfg.smtp_host.trim(),
          smtp_port: Number(emailCfg.smtp_port) || 587, smtp_user: emailCfg.smtp_user.trim(),
          smtp_password: emailCfg.smtp_password, imap_host: emailCfg.imap_host.trim(),
          imap_port: Number(emailCfg.imap_port) || 993, auto_connect: emailCfg.auto_connect,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      }
      qc.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "User updated" });
      onSaved();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">Edit — {target.full_name || target.email}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          {/* Avatar */}
          <ImageUploadOrUrl
            label="Profile Photo"
            value={avatarUrl}
            onChange={setAvatarUrl}
            bucket="team-avatars"
            pathPrefix={`${target.id}_`}
            previewClassName="w-16 h-16 object-cover rounded-full border border-crm-border"
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-[11px] text-crm-text-dim">Full Name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" /></div>
            <div className="space-y-1"><Label className="text-[11px] text-crm-text-dim">Country</Label>
              <Input value={country} onChange={e => setCountry(e.target.value)} className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" /></div>
            <div className="space-y-1"><Label className="text-[11px] text-crm-text-dim">Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" /></div>
            <div className="space-y-1"><Label className="text-[11px] text-crm-text-dim">Organisation</Label>
              <Input value={organisation} onChange={e => setOrganisation(e.target.value)} className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" /></div>
          </div>
          <div className="space-y-1"><Label className="text-[11px] text-crm-text-dim">Bio</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" /></div>

          <div className="flex items-center justify-between bg-crm-surface border border-crm-border rounded-lg px-3 py-2">
            <p className="text-[11px] text-crm-text">Show on Team page</p>
            <Switch checked={showOnWebsite} onCheckedChange={setShowOnWebsite} />
          </div>

          {isSuperAdmin && !loadingEmail && (
            <div className="space-y-3 border-t border-crm-border pt-3">
              <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Email Credentials</p>
              <p className="text-[10px] text-crm-text-dim">
                Server settings (SMTP/IMAP host &amp; port) are auto-configured from global email settings.
              </p>
              <div className="space-y-1"><Label className="text-[11px] text-crm-text-dim">Email Address (SMTP User)</Label>
                <Input value={emailCfg.smtp_user} onChange={e => setEmailCfg(c => ({ ...c, smtp_user: e.target.value }))} placeholder="user@domain.com" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" /></div>
              <div className="space-y-1"><Label className="text-[11px] text-crm-text-dim">Password</Label>
                <div className="relative">
                  <Input type={showPass ? "text" : "password"} value={emailCfg.smtp_password}
                    onChange={e => setEmailCfg(c => ({ ...c, smtp_password: e.target.value }))} className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 pr-8" />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-crm-text-dim hover:text-crm-text-secondary">
                    {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
              </div>
              {testResult && (
                <div className={`flex items-center gap-2 text-[11px] px-3 py-2 rounded-lg border ${testResult.valid ? "bg-emerald-950/50 border-emerald-800 text-emerald-400" : "bg-red-950/50 border-red-800 text-red-400"}`}>
                  {testResult.valid ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                  {testResult.valid ? "Connection verified" : testResult.error}
                </div>
              )}
              <Button type="button" size="sm" variant="outline" onClick={handleTestConnection}
                disabled={testing || !emailCfg.smtp_user || !emailCfg.smtp_password}
                className="border-crm-border text-crm-text-muted text-xs gap-1.5">
                {testing ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                {testing ? "Testing…" : "Test Connection"}
              </Button>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Website Team Tab ────────────────────────────────────────────────────────
const TEAM_CATEGORIES = ["leadership", "implementing_team", "consultant", "volunteer"] as const;
const TEAM_CATEGORY_LABELS: Record<string, string> = {
  leadership: "Leadership", implementing_team: "Implementing Team",
  consultant: "Consultants", volunteer: "Volunteers",
};

interface TeamMemberRow {
  id: string; full_name: string; title: string | null; organisation: string | null;
  avatar_url: string | null; bio: string | null; display_order: number;
  is_active: boolean; category: string; created_at: string;
}

function TeamMemberDialog({ open, onClose, member }: {
  open: boolean; onClose: () => void; member?: TeamMemberRow;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const isEdit = !!member;

  const [fullName, setFullName] = useState(member?.full_name ?? "");
  const [title, setTitle] = useState(member?.title ?? "");
  const [organisation, setOrganisation] = useState(member?.organisation ?? "");
  const [bio, setBio] = useState(member?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(member?.avatar_url ?? "");
  const [displayOrder, setDisplayOrder] = useState(member?.display_order?.toString() ?? "0");
  const [isActive, setIsActive] = useState(member?.is_active ?? true);
  const [category, setCategory] = useState(member?.category ?? "implementing_team");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        full_name: fullName.trim(), title: title.trim() || null,
        organisation: organisation.trim() || null, bio: bio.trim() || null,
        avatar_url: avatarUrl || null, display_order: parseInt(displayOrder) || 0,
        is_active: isActive, category,
      };
      if (isEdit) {
        const { error } = await (supabase as any).from("team_members").update(payload).eq("id", member.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("team_members").insert(payload);
        if (error) throw error;
      }
      qc.invalidateQueries({ queryKey: ["team-members-manual"] });
      toast({ title: isEdit ? "Member updated" : "Member added" });
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">{isEdit ? "Edit" : "Add"} Team Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <ImageUploadOrUrl
            label="Photo"
            value={avatarUrl}
            onChange={setAvatarUrl}
            bucket="team-avatars"
            pathPrefix="team-members/"
            previewClassName="w-16 h-16 object-cover rounded-full border border-crm-border"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[11px] text-crm-text-muted">Full Name *</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm" />
            </div>
            <div className="space-y-1.5"><Label className="text-[11px] text-crm-text-muted">Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm" /></div>
            <div className="space-y-1.5"><Label className="text-[11px] text-crm-text-muted">Organisation</Label>
              <Input value={organisation} onChange={e => setOrganisation(e.target.value)} className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm" /></div>
          </div>
          <div className="space-y-1.5"><Label className="text-[11px] text-crm-text-muted">Bio</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm resize-none" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label className="text-[11px] text-crm-text-muted">Category</Label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-crm-surface border border-crm-border text-crm-text-secondary text-sm rounded-lg px-3 py-1.5">
                {TEAM_CATEGORIES.map(c => <option key={c} value={c}>{TEAM_CATEGORY_LABELS[c]}</option>)}
              </select></div>
            <div className="space-y-1.5"><Label className="text-[11px] text-crm-text-muted">Order</Label>
              <Input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm" /></div>
            <div className="flex items-center justify-between pt-5">
              <Label className="text-[11px] text-crm-text-muted">Active</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-emerald-600" />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !fullName.trim()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {saving ? "Saving…" : isEdit ? "Save" : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Convert Team Member to User Dialog ──────────────────────────────────────
function ConvertTeamMemberDialog({ open, onClose, member, assignableRoles }: {
  open: boolean; onClose: () => void; member: TeamMemberRow; assignableRoles: AppRole[];
}) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>(assignableRoles[0] ?? "admin");
  const [converting, setConverting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    setEmail(""); setRole(assignableRoles[0] ?? "admin");
    setConverting(false); setGeneratedLink(null); setCopied(false);
    onClose();
  };

  const handleConvert = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast({ title: "Enter a valid email address", variant: "destructive" }); return;
    }
    setConverting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("invite-user", {
        body: {
          email: email.trim(),
          role,
          redirectUrl: `${window.location.origin}/set-password`,
          metadata: {
            full_name: member.full_name || undefined,
            title: member.title ?? undefined,
            organisation: member.organisation ?? undefined,
            bio: member.bio ?? undefined,
            avatar_url: member.avatar_url ?? undefined,
          },
        },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const body = res.data as any;
      if (body?.error) throw new Error(body.error);
      setGeneratedLink(body?.actionLink ?? null);
      toast({ title: "Invitation sent", description: `${email} has been invited as ${role}` });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setConverting(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text flex items-center gap-2">
            <UserPlus size={14} className="text-emerald-400" />
            Convert to System User
          </DialogTitle>
        </DialogHeader>

        {!generatedLink ? (
          <div className="space-y-4 py-1">
            <p className="text-[11px] text-crm-text-muted">
              Converting <span className="font-semibold text-crm-text">{member.full_name}</span> will send them an invitation to create an account. They will set their password on first sign-in.
            </p>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-crm-text-muted">Email Address *</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email"
                placeholder="member@example.com"
                className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-crm-text-muted">Assign Role</Label>
              <Select value={role} onValueChange={v => setRole(v as AppRole)}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border text-crm-text">
                  {assignableRoles.map(r => (
                    <SelectItem key={r} value={r}>{CRM_ROLE_META[r]?.label ?? r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={handleClose}
                className="border-crm-border text-crm-text-muted text-xs">Cancel</Button>
              <Button size="sm" onClick={handleConvert} disabled={converting || !email.trim()}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
                {converting ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                {converting ? "Sending…" : "Send Invitation"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-1">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
              <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
              <p className="text-[11px] text-emerald-300">
                Invitation sent to <span className="font-semibold">{email}</span>. Share the link below for their first sign-in.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-crm-text-muted">Invitation Link</Label>
              <div className="flex items-center gap-2">
                <input readOnly value={generatedLink}
                  className="flex-1 bg-crm-surface border border-crm-border rounded-lg px-3 py-1.5 text-[11px] text-crm-text-secondary font-mono truncate outline-none" />
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-crm-border text-[11px] text-crm-text-muted hover:text-crm-text transition-colors flex-shrink-0">
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-[10px] text-crm-text-faint">The user must create a password on their first visit to this link.</p>
            </div>
            <DialogFooter>
              <Button size="sm" onClick={handleClose}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function WebsiteTeamTab({ qc, toast, isSuperAdmin, assignableRoles }: {
  qc: ReturnType<typeof useQueryClient>;
  toast: ReturnType<typeof useToast>["toast"];
  isSuperAdmin: boolean;
  assignableRoles: AppRole[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamMemberRow | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [convertTarget, setConvertTarget] = useState<TeamMemberRow | null>(null);

  const { data: teamMembers = [], isLoading } = useQuery<TeamMemberRow[]>({
    queryKey: ["team-members-manual"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("team_members").select("*").order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await (supabase as any).from("team_members").update({ is_active: !current }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    qc.invalidateQueries({ queryKey: ["team-members-manual"] });
  };

  const deleteRow = async (id: string) => {
    const { error } = await (supabase as any).from("team_members").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    qc.invalidateQueries({ queryKey: ["team-members-manual"] });
    setDeleteId(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-crm-text flex items-center gap-1.5">
          <Globe size={13} className="text-emerald-400" /> Website Team Members
        </p>
        <Button size="sm" onClick={() => { setEditTarget(undefined); setDialogOpen(true); }}
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
          <Plus size={12} /> Add Member
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden divide-y divide-crm-border">
          {teamMembers.length === 0 ? (
            <p className="text-center text-xs text-crm-text-faint py-8">No team members added yet.</p>
          ) : teamMembers.map(m => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-crm-surface transition-colors">
              <div className="w-9 h-9 rounded-full bg-crm-border flex items-center justify-center text-xs font-bold text-emerald-400 overflow-hidden flex-shrink-0 uppercase">
                {m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" /> :
                  m.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-crm-text truncate">{m.full_name}</p>
                <div className="flex items-center gap-2 text-[10px] text-crm-text-dim">
                  {m.title && <span>{m.title}</span>}
                  <span className="px-1.5 py-0.5 rounded bg-crm-surface border border-crm-border text-[9px]">
                    {TEAM_CATEGORY_LABELS[m.category] ?? m.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleActive(m.id, m.is_active)}
                  className={`p-1.5 rounded transition-colors ${m.is_active ? "text-emerald-400" : "text-crm-text-dim"}`}>
                  {m.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button onClick={() => { setEditTarget(m); setDialogOpen(true); }}
                  className="p-1.5 text-crm-text-dim hover:text-crm-text-secondary rounded"><Pencil size={13} /></button>
                {isSuperAdmin && (
                  <button onClick={() => setConvertTarget(m)} title="Convert to system user"
                    className="p-1.5 text-crm-text-dim hover:text-emerald-400 rounded">
                    <UserPlus size={13} />
                  </button>
                )}
                {deleteId === m.id ? (
                  <span className="flex items-center gap-1 text-[9px]">
                    <button onClick={() => deleteRow(m.id)} className="text-red-400">Yes</button>
                    <button onClick={() => setDeleteId(null)} className="text-crm-text-dim">No</button>
                  </span>
                ) : (
                  <button onClick={() => setDeleteId(m.id)} className="p-1.5 text-crm-text-dim hover:text-red-400 rounded">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <TeamMemberDialog
        key={editTarget?.id ?? "new"}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        member={editTarget}
      />
      {convertTarget && (
        <ConvertTeamMemberDialog
          open={!!convertTarget}
          onClose={() => setConvertTarget(null)}
          member={convertTarget}
          assignableRoles={assignableRoles}
        />
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PeopleModule() {
  const { user, roles, isAdmin, refreshRoles } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();

  const isSuperAdmin = roles.includes("super_admin" as AppRole);
  const assignableRoles = isSuperAdmin ? SUPER_ADMIN_ASSIGNABLE_ROLES : ADMIN_ASSIGNABLE_ROLES;

  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"users" | "invitations" | "website-team">("users");
  const [roleFilter, setRoleFilter] = useState("all");

  const [viewOpen, setViewOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<UserWithRoles | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserWithRoles | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [profilesRes, rolesRes, invRes] = await Promise.all([
        (supabase as any).from("profiles").select("id, email, full_name, country, created_at, show_on_website")
          .order("created_at", { ascending: false }),
        (supabase as any).from("user_roles").select("user_id, role"),
        (supabase as any).from("invitations").select("id, email, role, created_at, accepted_at")
          .order("created_at", { ascending: false }),
      ]);
      const rolesMap = new Map<string, AppRole[]>();
      (rolesRes.data ?? []).forEach((r: any) => {
        const arr = rolesMap.get(r.user_id) || [];
        arr.push(r.role as AppRole);
        rolesMap.set(r.user_id, arr);
      });
      let userList: UserWithRoles[] = (profilesRes.data ?? []).map((p: any) => ({
        id: p.id, email: p.email ?? "", full_name: p.full_name ?? "",
        country: p.country ?? "", created_at: p.created_at,
        roles: rolesMap.get(p.id) ?? [], show_on_website: p.show_on_website ?? false,
      }));
      if (!isSuperAdmin) userList = userList.filter(u => !u.roles.includes("super_admin"));
      setUsers(userList);
      setInvitations(invRes.data ?? []);
    } finally { setLoading(false); }
  }, [user, isSuperAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRoleChange = async (targetId: string, role: AppRole, action: "add" | "remove") => {
    if (targetId === user?.id && action === "remove" && role === "super_admin") {
      toast({ title: "Cannot remove your own super_admin role", variant: "destructive" }); return;
    }
    try {
      if (action === "add") await (supabase as any).from("user_roles").insert({ user_id: targetId, role });
      else await (supabase as any).from("user_roles").delete().eq("user_id", targetId).eq("role", role);
      toast({ title: `Role ${action === "add" ? "granted" : "revoked"}` });
      loadData();
      if (targetId === user?.id) refreshRoles();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const revokeInvitation = async (invId: string) => {
    await (supabase as any).from("invitations").delete().eq("id", invId);
    toast({ title: "Invitation revoked" }); loadData();
  };

  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleResend = async (inv: Invitation) => {
    setResendingId(inv.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("invite-user", {
        body: { email: inv.email, role: inv.role, redirectUrl: `${window.location.origin}/set-password` },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const body = res.data as any;
      if (body?.error) throw new Error(body.error);
      toast({ title: "Invitation resent", description: inv.email });
    } catch (err: any) {
      toast({ title: "Failed to resend", description: err.message, variant: "destructive" });
    } finally {
      setResendingId(null);
    }
  };

  const handleToggleWebsite = async (userId: string, current: boolean) => {
    await (supabase as any).from("profiles").update({ show_on_website: !current }).eq("id", userId);
    toast({ title: !current ? "Now visible on Team page" : "Hidden" });
    qc.invalidateQueries({ queryKey: ["team-members"] }); loadData();
  };

  const deleteUser = async (userId: string) => {
    await (supabase as any).from("user_roles").delete().eq("user_id", userId);
    await (supabase as any).from("profiles").delete().eq("id", userId);
    toast({ title: "User removed" }); setConfirmDeleteId(null); loadData();
  };

  const pending = invitations.filter(i => !i.accepted_at).length;
  const uniqueRoles = new Set<string>();
  users.forEach(u => u.roles.forEach(r => uniqueRoles.add(r)));

  const filteredUsers = users.filter(u => {
    if (search) {
      const q = search.toLowerCase();
      if (!u.full_name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.country.toLowerCase().includes(q)) return false;
    }
    if (roleFilter !== "all" && !u.roles.includes(roleFilter as AppRole)) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Users" value={users.length} color="bg-violet-950 text-violet-400" />
        <StatCard icon={UserCheck} label="Active Users" value={users.filter(u => u.roles.length > 0).length} color="bg-emerald-950 text-emerald-400" />
        <StatCard icon={Mail} label="Pending Invites" value={pending} color="bg-amber-950 text-amber-400" />
        <StatCard icon={Shield} label="Total Roles" value={uniqueRoles.size} color="bg-blue-950 text-blue-400" />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="bg-crm-surface border border-crm-border text-crm-text-secondary text-xs rounded-lg px-3 py-2">
              <option value="all">All Roles</option>
              {Array.from(uniqueRoles).map(r => (
                <option key={r} value={r}>{CRM_ROLE_META[r as keyof typeof CRM_ROLE_META]?.label ?? r}</option>
              ))}
            </select>
          )}
          <input type="text" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
            className="bg-crm-surface border border-crm-border text-crm-text-secondary text-xs rounded-lg px-3 py-2 w-60 focus:outline-none focus:border-emerald-700 placeholder:text-crm-text-faint" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-crm-text-dim hover:text-crm-text-secondary transition-colors">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <Button size="sm" onClick={() => setAddSheetOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
            <UserPlus size={12} /> Add User
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-crm-border">
        {[
          { id: "users" as const, label: `Users (${filteredUsers.length})` },
          { id: "invitations" as const, label: `Invitations${pending > 0 ? ` · ${pending}` : ""}` },
          { id: "website-team" as const, label: "Website Team" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === t.id ? "border-emerald-500 text-emerald-400" : "border-transparent text-crm-text-muted hover:text-crm-text-secondary"
            }`}>{t.label}</button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center h-32">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Users Table */}
      {!loading && tab === "users" && (
        <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-crm-border">
                  {["User", ...(isSuperAdmin ? ["Role"] : []), "Country", "Joined", "Actions"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-[10px] font-semibold text-crm-text-dim uppercase tracking-wider text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-crm-border">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-xs text-crm-text-faint py-8">No users found.</td></tr>
                ) : filteredUsers.map(u => {
                  const initials = u.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
                  const addableRoles = assignableRoles.filter(r => !u.roles.includes(r));
                  return (
                    <tr key={u.id} className="hover:bg-crm-surface transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-crm-border flex items-center justify-center text-[10px] font-bold text-emerald-400 uppercase flex-shrink-0">{initials}</div>
                          <div>
                            <p className="text-[12px] font-semibold text-crm-text">{u.full_name || "—"}</p>
                            <p className="text-[10px] text-crm-text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.map(role => {
                              const m = CRM_ROLE_META[role];
                              if (!m) return null;
                              return (
                                <span key={role} className={`flex items-center gap-1 text-[9px] font-mono border rounded px-1.5 py-0.5 ${m.bgColour} ${m.colour} ${m.borderColour}`}>
                                  {m.shortLabel}
                                  {(assignableRoles.includes(role) || isSuperAdmin) && (
                                    <button onClick={() => handleRoleChange(u.id, role, "remove")} className="hover:opacity-70"><X size={8} /></button>
                                  )}
                                </span>
                              );
                            })}
                            {addableRoles.length > 0 && (
                              <select defaultValue="" onChange={e => { if (e.target.value) { handleRoleChange(u.id, e.target.value as AppRole, "add"); e.target.value = ""; }}}
                                className="text-[9px] font-mono bg-crm-surface border border-crm-border text-crm-text-dim rounded px-1 py-0.5 cursor-pointer">
                                <option value="">+</option>
                                {addableRoles.map(r => <option key={r} value={r}>{CRM_ROLE_META[r]?.shortLabel ?? r}</option>)}
                              </select>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3 text-[11px] text-crm-text-muted">{u.country || "—"}</td>
                      <td className="px-4 py-3 text-[10px] text-crm-text-faint">{format(parseISO(u.created_at), "d MMM yyyy")}</td>
                      <td className="px-4 py-3">
                        {isAdmin && (
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => { setViewTarget(u); setViewOpen(true); }} title="View" className="p-1.5 text-crm-text-dim hover:text-crm-text-secondary rounded"><Eye size={13} /></button>
                            <button onClick={() => { setEditTarget(u); setEditOpen(true); }} title="Edit" className="p-1.5 text-crm-text-dim hover:text-crm-text-secondary rounded"><Pencil size={13} /></button>
                            <button onClick={() => handleToggleWebsite(u.id, u.show_on_website)}
                              className={`p-1.5 rounded ${u.show_on_website ? "text-emerald-400" : "text-crm-text-dim"}`}>
                              {u.show_on_website ? <Eye size={13} /> : <EyeOff size={13} />}
                            </button>
                            {isSuperAdmin && u.id !== user?.id && (
                              confirmDeleteId === u.id ? (
                                <span className="flex items-center gap-1 text-[9px] ml-1">
                                  <button onClick={() => deleteUser(u.id)} className="text-red-400">Yes</button>
                                  <button onClick={() => setConfirmDeleteId(null)} className="text-crm-text-dim">No</button>
                                </span>
                              ) : (
                                <button onClick={() => setConfirmDeleteId(u.id)} className="p-1.5 text-crm-text-dim hover:text-red-400 rounded"><UserMinus size={13} /></button>
                              )
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
        </div>
      )}

      {/* Invitations tab */}
      {!loading && tab === "invitations" && (
        <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
          {invitations.length === 0 ? (
            <p className="text-center text-xs text-crm-text-faint py-8">No invitations sent yet.</p>
          ) : (
            <div className="divide-y divide-crm-border">
              {invitations.map(inv => {
                const m = CRM_ROLE_META[inv.role];
                const accepted = !!inv.accepted_at;
                return (
                  <div key={inv.id} className="flex items-center gap-3 px-4 py-3 hover:bg-crm-surface transition-colors">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${accepted ? "bg-emerald-950" : "bg-crm-border"}`}>
                      {accepted ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Clock size={13} className="text-crm-text-dim" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-crm-text truncate">{inv.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {m && <span className={`text-[9px] font-mono border rounded px-1.5 py-0.5 ${m.bgColour} ${m.colour} ${m.borderColour}`}>{m.shortLabel}</span>}
                        <span className={`text-[10px] font-mono ${accepted ? "text-emerald-500" : "text-amber-500"}`}>
                          {accepted ? `Accepted` : "Pending"}
                        </span>
                      </div>
                    </div>
                    {!accepted && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleResend(inv)}
                          disabled={resendingId === inv.id}
                          title="Resend invitation"
                          className="text-crm-text-faint hover:text-emerald-400 p-1 disabled:opacity-50"
                        >
                          {resendingId === inv.id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <RefreshCw size={13} />}
                        </button>
                        <button onClick={() => revokeInvitation(inv.id)} className="text-crm-text-faint hover:text-red-400 p-1"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Website Team tab */}
      {tab === "website-team" && <WebsiteTeamTab qc={qc} toast={toast} isSuperAdmin={isSuperAdmin} assignableRoles={assignableRoles} />}

      {/* Dialogs */}
      {viewOpen && viewTarget && <ViewUserDialog target={viewTarget} isSuperAdmin={isSuperAdmin} onClose={() => { setViewOpen(false); setViewTarget(null); }} />}
      {editOpen && editTarget && (
        <EditUserDialog target={editTarget} isSuperAdmin={isSuperAdmin}
          onClose={() => { setEditOpen(false); setEditTarget(null); }}
          onSaved={() => { setEditOpen(false); setEditTarget(null); loadData(); }} />
      )}
      <AddUserSheet open={addSheetOpen} onClose={() => setAddSheetOpen(false)}
        assignableRoles={assignableRoles} onInvited={loadData} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}