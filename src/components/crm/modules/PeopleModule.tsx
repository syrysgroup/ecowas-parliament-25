import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { AppRole } from "@/contexts/AuthContext";
import { CRM_ROLE_META } from "../crmRoles";
import {
  Send, Trash2, CheckCircle2, Clock, UserPlus, RefreshCw, X,
  Eye, Pencil, UserMinus, EyeOff, AlertTriangle, Camera,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
  country: string;
  created_at: string;
  roles: AppRole[];
}

interface Invitation {
  id: string;
  email: string;
  role: AppRole;
  created_at: string;
  accepted_at: string | null;
}

interface UserEmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  imap_host: string;
  imap_port: number;
  auto_connect: boolean;
}

const EMPTY_EMAIL_SETTINGS: UserEmailSettings = {
  smtp_host: "", smtp_port: 587, smtp_user: "", smtp_password: "",
  imap_host: "", imap_port: 993, auto_connect: true,
};

// Roles an admin can assign (not super_admin — only super_admin can grant that)
const ADMIN_ASSIGNABLE_ROLES: AppRole[] = [
  "admin", "moderator", "project_director", "programme_lead",
  "website_editor", "marketing_manager", "communications_officer",
  "finance_coordinator", "logistics_coordinator", "sponsor_manager",
  "consultant", "sponsor",
];

const SUPER_ADMIN_ASSIGNABLE_ROLES: AppRole[] = ["super_admin", ...ADMIN_ASSIGNABLE_ROLES];

// ─── View User Dialog ────────────────────────────────────────────────────────
function ViewUserDialog({ target, onClose }: { target: UserWithRoles; onClose: () => void }) {
  const [emailCfg, setEmailCfg] = useState<UserEmailSettings | null>(null);
  const [loadingCfg, setLoadingCfg] = useState(true);

  useEffect(() => {
    setLoadingCfg(true);
    (supabase as any)
      .from("user_email_settings")
      .select("*")
      .eq("user_id", target.id)
      .maybeSingle()
      .then(({ data }: any) => {
        setEmailCfg(data ?? null);
        setLoadingCfg(false);
      });
  }, [target.id]);

  const initials = target.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-crm-border flex items-center justify-center text-lg font-bold text-emerald-400 uppercase flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-[15px] font-bold text-crm-text">{target.full_name || "—"}</p>
              <p className="text-xs text-crm-text-muted mt-0.5">{target.email}</p>
              <p className="text-[11px] text-crm-text-dim mt-0.5">{target.country || "No country set"}</p>
            </div>
          </div>

          {/* Meta */}
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

          {/* Role chips */}
          {target.roles.length > 0 && (
            <div>
              <p className="text-[11px] text-crm-text-dim mb-2">Assigned Roles</p>
              <div className="flex flex-wrap gap-1.5">
                {target.roles.map(role => {
                  const m = CRM_ROLE_META[role];
                  if (!m) return null;
                  return (
                    <span key={role}
                      className={`text-[10px] font-mono border rounded px-2 py-0.5 ${m.bgColour} ${m.colour} ${m.borderColour}`}>
                      {m.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Email config */}
          <div>
            <p className="text-[11px] text-crm-text-dim mb-2">Email Configuration</p>
            {loadingCfg ? (
              <div className="h-8 bg-crm-surface rounded-lg animate-pulse" />
            ) : emailCfg ? (
              <div className="bg-crm-surface border border-crm-border rounded-lg px-3 py-3 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-crm-text-dim">Status</span>
                  <span className={`font-mono rounded px-1.5 py-0.5 text-[9px] border ${
                    emailCfg.auto_connect
                      ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                      : "bg-crm-border text-crm-text-dim border-crm-border-hover"
                  }`}>
                    {emailCfg.auto_connect ? "● Auto-connect ON" : "● Manual"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-crm-text-dim">SMTP</span>
                  <span className="text-crm-text-secondary">{emailCfg.smtp_host}:{emailCfg.smtp_port}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-crm-text-dim">IMAP</span>
                  <span className="text-crm-text-secondary">{emailCfg.imap_host}:{emailCfg.imap_port}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-crm-text-dim">Login</span>
                  <span className="text-crm-text-secondary">{emailCfg.smtp_user}</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-crm-text-faint italic">No email credentials configured.</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}
            className="border-crm-border text-crm-text-muted hover:text-crm-text-secondary text-xs">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit User Dialog ────────────────────────────────────────────────────────
function EditUserDialog({
  target, isSuperAdmin, onClose, onSaved,
}: {
  target: UserWithRoles;
  isSuperAdmin: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName,   setFullName]   = useState(target.full_name);
  const [country,    setCountry]    = useState(target.country);
  const [title,      setTitle]      = useState("");
  const [organisation, setOrganisation] = useState("");
  const [bio,        setBio]        = useState("");
  const [avatarUrl,  setAvatarUrl]  = useState("");
  const [showOnWebsite, setShowOnWebsite] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [showPass,   setShowPass]   = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Email settings state
  const [emailCfg,     setEmailCfg]     = useState<UserEmailSettings>(EMPTY_EMAIL_SETTINGS);
  const [loadingEmail, setLoadingEmail] = useState(isSuperAdmin);

  // Load full profile data
  useEffect(() => {
    setLoadingProfile(true);
    (supabase as any)
      .from("profiles")
      .select("title, organisation, bio, avatar_url, show_on_website")
      .eq("id", target.id)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setTitle(data.title ?? "");
          setOrganisation(data.organisation ?? "");
          setBio(data.bio ?? "");
          setAvatarUrl(data.avatar_url ?? "");
          setShowOnWebsite(data.show_on_website ?? false);
        }
        setLoadingProfile(false);
      });
  }, [target.id]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    setLoadingEmail(true);
    (supabase as any)
      .from("user_email_settings")
      .select("*")
      .eq("user_id", target.id)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) setEmailCfg({
          smtp_host:     data.smtp_host     ?? "",
          smtp_port:     data.smtp_port     ?? 587,
          smtp_user:     data.smtp_user     ?? "",
          smtp_password: data.smtp_password ?? "",
          imap_host:     data.imap_host     ?? "",
          imap_port:     data.imap_port     ?? 993,
          auto_connect:  data.auto_connect  ?? true,
        });
        setLoadingEmail(false);
      });
  }, [target.id, isSuperAdmin]);

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${target.id}.${ext}`;
      // Remove old avatar if exists
      await supabase.storage.from("team-avatars").remove([path]);
      const { error } = await supabase.storage.from("team-avatars").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("team-avatars").getPublicUrl(path);
      setAvatarUrl(publicUrl);
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update profile (including new fields)
      const { error: profileErr } = await (supabase as any)
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          country: country.trim(),
          title: title.trim() || null,
          organisation: organisation.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl || null,
          show_on_website: showOnWebsite,
        })
        .eq("id", target.id);
      if (profileErr) throw profileErr;

      // 2. Upsert email settings (super_admin only)
      if (isSuperAdmin) {
        const { error: emailErr } = await (supabase as any)
          .from("user_email_settings")
          .upsert({
            user_id:       target.id,
            smtp_host:     emailCfg.smtp_host.trim(),
            smtp_port:     Number(emailCfg.smtp_port) || 587,
            smtp_user:     emailCfg.smtp_user.trim(),
            smtp_password: emailCfg.smtp_password,
            imap_host:     emailCfg.imap_host.trim(),
            imap_port:     Number(emailCfg.imap_port) || 993,
            auto_connect:  emailCfg.auto_connect,
            updated_at:    new Date().toISOString(),
          }, { onConflict: "user_id" });
        if (emailErr) throw emailErr;
      }

      toast({ title: "User updated" });
      onSaved();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">
            Edit User — {target.full_name || target.email}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Avatar upload section */}
          <div>
            <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider mb-3">Profile Photo</p>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full bg-crm-border flex items-center justify-center overflow-hidden flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-emerald-400 uppercase">
                    {fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("") || "?"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <Camera size={18} className="text-white" />
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
              <div className="text-[10px] text-crm-text-dim space-y-1">
                <p>Click the avatar to upload a photo</p>
                {uploading && <p className="text-amber-400">Uploading…</p>}
                {avatarUrl && (
                  <button type="button" onClick={() => setAvatarUrl("")}
                    className="text-red-400 hover:text-red-300">Remove photo</button>
                )}
              </div>
            </div>
          </div>

          {/* Profile section */}
          <div>
            <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider mb-3">Profile Details</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-crm-text-dim">Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-crm-text-dim">Country</Label>
                  <Input
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    placeholder="Country"
                    className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-crm-text-dim">Title / Position</Label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Project Director"
                    className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-crm-text-dim">Organisation</Label>
                  <Input
                    value={organisation}
                    onChange={e => setOrganisation(e.target.value)}
                    placeholder="e.g. ECOWAS"
                    className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-crm-text-dim">Bio</Label>
                <Textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Short biography…"
                  className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Show on website toggle */}
          <div className="flex items-center justify-between bg-crm-surface border border-crm-border rounded-lg px-3 py-2.5">
            <div>
              <p className="text-[12px] text-crm-text">Show on Team page</p>
              <p className="text-[10px] text-crm-text-dim mt-0.5">
                Display this user on the public Team page with their photo, title, and organisation.
              </p>
            </div>
            <Switch checked={showOnWebsite} onCheckedChange={setShowOnWebsite} />
          </div>

          {/* Email credentials — super_admin only */}
          {isSuperAdmin && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Email Credentials</p>
                <span className="text-[9px] font-mono text-amber-600 bg-amber-950 border border-amber-800 rounded px-1.5 py-0.5">
                  SUPER ADMIN
                </span>
              </div>

              {/* Migration warning */}
              <div className="flex items-start gap-2 bg-amber-950/40 border border-amber-800/60 rounded-lg px-3 py-2.5 mb-3">
                <AlertTriangle size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-amber-400 leading-relaxed">
                  Requires a <code className="font-mono">user_email_settings</code> table. Run in Supabase SQL editor:
                  <br />
                  <code className="font-mono text-[9px] text-amber-300 break-all">
                    CREATE TABLE user_email_settings (user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE, smtp_host TEXT, smtp_port INT DEFAULT 587, smtp_user TEXT, smtp_password TEXT, imap_host TEXT, imap_port INT DEFAULT 993, auto_connect BOOLEAN DEFAULT true, updated_at TIMESTAMPTZ DEFAULT now());
                  </code>
                </p>
              </div>

              {loadingEmail ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-8 bg-crm-surface rounded-lg animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* SMTP host + port */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[11px] text-crm-text-dim">SMTP Host</Label>
                      <Input
                        value={emailCfg.smtp_host}
                        onChange={e => setEmailCfg(c => ({ ...c, smtp_host: e.target.value }))}
                        placeholder="smtp.gmail.com"
                        className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-crm-text-dim">Port</Label>
                      <Input
                        type="number"
                        min={1}
                        value={emailCfg.smtp_port}
                        onChange={e => setEmailCfg(c => ({ ...c, smtp_port: Number(e.target.value) }))}
                        className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
                      />
                    </div>
                  </div>

                  {/* SMTP username */}
                  <div className="space-y-1">
                    <Label className="text-[11px] text-crm-text-dim">SMTP Username / Email</Label>
                    <Input
                      value={emailCfg.smtp_user}
                      onChange={e => setEmailCfg(c => ({ ...c, smtp_user: e.target.value }))}
                      placeholder="user@example.com"
                      className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
                    />
                  </div>

                  {/* Password with show/hide */}
                  <div className="space-y-1">
                    <Label className="text-[11px] text-crm-text-dim">SMTP Password</Label>
                    <div className="relative">
                      <Input
                        type={showPass ? "text" : "password"}
                        value={emailCfg.smtp_password}
                        onChange={e => setEmailCfg(c => ({ ...c, smtp_password: e.target.value }))}
                        placeholder="••••••••"
                        className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(v => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-crm-text-dim hover:text-crm-text-secondary transition-colors"
                      >
                        {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* IMAP host + port */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[11px] text-crm-text-dim">IMAP Host</Label>
                      <Input
                        value={emailCfg.imap_host}
                        onChange={e => setEmailCfg(c => ({ ...c, imap_host: e.target.value }))}
                        placeholder="imap.gmail.com"
                        className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-crm-text-dim">Port</Label>
                      <Input
                        type="number"
                        min={1}
                        value={emailCfg.imap_port}
                        onChange={e => setEmailCfg(c => ({ ...c, imap_port: Number(e.target.value) }))}
                        className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
                      />
                    </div>
                  </div>

                  {/* Auto-connect toggle */}
                  <div className="flex items-center justify-between bg-crm-surface border border-crm-border rounded-lg px-3 py-2.5">
                    <div>
                      <p className="text-[12px] text-crm-text">Auto-connect on login</p>
                      <p className="text-[10px] text-crm-text-dim mt-0.5">
                        User is automatically connected to their email when they log into the CRM.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailCfg(c => ({ ...c, auto_connect: !c.auto_connect }))}
                      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ml-3 ${
                        emailCfg.auto_connect ? "bg-emerald-600" : "bg-crm-border-hover"
                      }`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                        emailCfg.auto_connect ? "left-[18px]" : "left-0.5"
                      }`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}
            className="border-crm-border text-crm-text-muted hover:text-crm-text-secondary text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PeopleModule() {
  const { user, isAdmin, isSuperAdmin, refreshRoles } = useAuthContext();
  const { toast } = useToast();

  const [users,       setUsers]       = useState<UserWithRoles[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [sending,     setSending]     = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole,  setInviteRole]  = useState<AppRole>("admin");
  const [search,      setSearch]      = useState("");
  const [tab,         setTab]         = useState<"users" | "invitations">("users");

  // CRUD state
  const [viewTarget,      setViewTarget]      = useState<UserWithRoles | null>(null);
  const [editTarget,      setEditTarget]      = useState<UserWithRoles | null>(null);
  const [editOpen,        setEditOpen]        = useState(false);
  const [viewOpen,        setViewOpen]        = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const assignableRoles = isSuperAdmin ? SUPER_ADMIN_ASSIGNABLE_ROLES : ADMIN_ASSIGNABLE_ROLES;

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profilesRes, rolesRes, invRes] = await Promise.all([
        (supabase as any)
          .from("profiles")
          .select("id, email, full_name, country, created_at")
          .order("created_at", { ascending: false }),
        (supabase as any).from("user_roles").select("user_id, role"),
        (supabase as any)
          .from("invitations")
          .select("id, email, role, created_at, accepted_at")
          .order("created_at", { ascending: false }),
      ]);

      const rolesMap = new Map<string, AppRole[]>();
      (rolesRes.data ?? []).forEach((r: any) => {
        const arr = rolesMap.get(r.user_id) || [];
        arr.push(r.role as AppRole);
        rolesMap.set(r.user_id, arr);
      });

      let userList: UserWithRoles[] = (profilesRes.data ?? []).map((p: any) => ({
        id:         p.id,
        email:      p.email ?? "",
        full_name:  p.full_name ?? "",
        country:    p.country ?? "",
        created_at: p.created_at,
        roles:      rolesMap.get(p.id) ?? [],
      }));

      // Non-super_admins cannot see super_admin users
      if (!isSuperAdmin) {
        userList = userList.filter(u => !u.roles.includes("super_admin"));
      }

      setUsers(userList);
      setInvitations(invRes.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [user, isSuperAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    if (!isSuperAdmin && inviteRole === "super_admin") {
      toast({ title: "Insufficient permissions", description: "Only a Super Admin can grant the super_admin role.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("invite-user", {
        body: { email: inviteEmail.trim(), role: inviteRole },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const body = res.data as any;
      if (body?.error) throw new Error(body.error);
      toast({ title: "Invitation sent", description: `${inviteEmail} — ${CRM_ROLE_META[inviteRole]?.label ?? inviteRole}` });
      setInviteEmail("");
      loadData();
    } catch (err: any) {
      toast({ title: "Failed to send invitation", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleRoleChange = async (targetId: string, role: AppRole, action: "add" | "remove") => {
    if (targetId === user?.id && action === "remove" && role === "super_admin") {
      toast({ title: "Cannot remove your own super_admin role", variant: "destructive" });
      return;
    }
    if (!isSuperAdmin && role === "super_admin") {
      toast({ title: "Insufficient permissions", variant: "destructive" });
      return;
    }
    try {
      if (action === "add") {
        await (supabase as any).from("user_roles").insert({ user_id: targetId, role });
      } else {
        await (supabase as any).from("user_roles").delete().eq("user_id", targetId).eq("role", role);
      }
      toast({ title: `Role ${action === "add" ? "granted" : "revoked"}` });
      loadData();
      if (targetId === user?.id) refreshRoles();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const revokeInvitation = async (invId: string) => {
    try {
      await (supabase as any).from("invitations").delete().eq("id", invId);
      toast({ title: "Invitation revoked" });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await (supabase as any).from("user_roles").delete().eq("user_id", userId);
      await (supabase as any).from("profiles").delete().eq("id", userId);
      toast({ title: "User removed" });
      setConfirmDeleteId(null);
      loadData();
    } catch (err: any) {
      toast({ title: "Error removing user", description: err.message, variant: "destructive" });
    }
  };

  const pending = invitations.filter(i => !i.accepted_at).length;

  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.country.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-crm-text">People & Access</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">
            Invite team members, assign roles, manage access
          </p>
        </div>
        <button onClick={loadData} disabled={loading}
          className="flex items-center gap-1.5 text-xs text-crm-text-dim hover:text-crm-text-secondary transition-colors">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Invite form */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={14} className="text-emerald-500" />
          <h3 className="text-[13px] font-semibold text-crm-text">Invite team member</h3>
        </div>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            placeholder="colleague@example.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="flex-1 bg-crm-surface border border-crm-border text-crm-text-secondary text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-700 placeholder:text-crm-text-faint"
          />
          <select
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value as AppRole)}
            className="bg-crm-surface border border-crm-border text-crm-text-secondary text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-700"
          >
            {assignableRoles.map(r => (
              <option key={r} value={r}>{CRM_ROLE_META[r]?.label ?? r}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
          >
            <Send size={13} />
            {sending ? "Sending…" : "Send invite"}
          </button>
        </form>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-crm-border">
        {[
          { id: "users" as const,       label: `Users (${filteredUsers.length})` },
          { id: "invitations" as const, label: `Invitations${pending > 0 ? ` · ${pending} pending` : ""}` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-crm-text-muted hover:text-crm-text-secondary"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Users tab */}
      {!loading && tab === "users" && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search by name, email or country…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-crm-card border border-crm-border text-crm-text-secondary text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-700 placeholder:text-crm-text-faint"
          />
          <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-xs text-crm-text-faint py-8">No users found.</p>
            ) : (
              <div className="divide-y divide-crm-border">
                {filteredUsers.map(u => {
                  const initials = u.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
                  const addableRoles = assignableRoles.filter(r => !u.roles.includes(r));
                  return (
                    <div key={u.id} className="flex items-start gap-3 px-4 py-3 hover:bg-crm-surface transition-colors">
                      <div className="w-9 h-9 rounded-full bg-crm-border flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0 uppercase">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[12.5px] font-semibold text-crm-text">{u.full_name || "—"}</p>
                          <p className="text-[11px] text-crm-text-muted">{u.email}</p>
                        </div>
                        <p className="text-[10px] text-crm-text-dim mt-0.5">{u.country}</p>
                        {/* Role chips */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {u.roles.map(role => {
                            const m = CRM_ROLE_META[role];
                            if (!m) return null;
                            const canRemove = assignableRoles.includes(role) || isSuperAdmin;
                            return (
                              <span key={role}
                                className={`flex items-center gap-1 text-[9px] font-mono border rounded px-1.5 py-0.5 ${m.bgColour} ${m.colour} ${m.borderColour}`}>
                                {m.shortLabel}
                                {canRemove && (
                                  <button onClick={() => handleRoleChange(u.id, role, "remove")}
                                    className="hover:opacity-70 transition-opacity ml-0.5">
                                    <X size={8} />
                                  </button>
                                )}
                              </span>
                            );
                          })}
                          {/* Add role dropdown */}
                          {addableRoles.length > 0 && (
                            <select
                              defaultValue=""
                              onChange={e => { if (e.target.value) { handleRoleChange(u.id, e.target.value as AppRole, "add"); e.target.value = ""; }}}
                              className="text-[9px] font-mono bg-crm-surface border border-crm-border text-crm-text-dim rounded px-1 py-0.5 focus:outline-none cursor-pointer"
                            >
                              <option value="">+ role</option>
                              {addableRoles.map(r => (
                                <option key={r} value={r}>{CRM_ROLE_META[r]?.shortLabel ?? r}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>

                      {/* Joined date */}
                      <p className="text-[10px] text-crm-text-faint flex-shrink-0 hidden sm:block pt-0.5">
                        {format(parseISO(u.created_at), "d MMM yyyy")}
                      </p>

                      {/* Action buttons — isAdmin only */}
                      {isAdmin && (
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {/* View */}
                          <button
                            onClick={() => { setViewTarget(u); setViewOpen(true); }}
                            title="View details"
                            className="p-1.5 text-crm-text-dim hover:text-crm-text-secondary transition-colors rounded"
                          >
                            <Eye size={13} />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => { setEditTarget(u); setEditOpen(true); }}
                            title="Edit user"
                            className="p-1.5 text-crm-text-dim hover:text-crm-text-secondary transition-colors rounded"
                          >
                            <Pencil size={13} />
                          </button>

                          {/* Delete — super_admin only, cannot delete yourself */}
                          {isSuperAdmin && u.id !== user?.id && (
                            confirmDeleteId === u.id ? (
                              <span className="flex items-center gap-1 text-[9px] ml-1">
                                <button
                                  onClick={() => deleteUser(u.id)}
                                  className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                                >
                                  Yes
                                </button>
                                <span className="text-crm-text-faint">/</span>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-crm-text-dim hover:text-crm-text-secondary transition-colors"
                                >
                                  No
                                </button>
                              </span>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(u.id)}
                                title="Delete user"
                                className="p-1.5 text-crm-text-dim hover:text-red-400 transition-colors rounded"
                              >
                                <UserMinus size={13} />
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
                      {accepted
                        ? <CheckCircle2 size={13} className="text-emerald-400" />
                        : <Clock size={13} className="text-crm-text-dim" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-crm-text truncate">{inv.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {m && (
                          <span className={`text-[9px] font-mono border rounded px-1.5 py-0.5 ${m.bgColour} ${m.colour} ${m.borderColour}`}>
                            {m.shortLabel}
                          </span>
                        )}
                        <span className={`text-[10px] font-mono ${accepted ? "text-emerald-500" : "text-amber-500"}`}>
                          {accepted ? `Accepted ${format(parseISO(inv.accepted_at!), "d MMM")}` : "Pending"}
                        </span>
                        <span className="text-[10px] text-crm-text-faint">
                          Sent {format(parseISO(inv.created_at), "d MMM yyyy")}
                        </span>
                      </div>
                    </div>
                    {!accepted && (
                      <button onClick={() => revokeInvitation(inv.id)}
                        className="text-crm-text-faint hover:text-red-400 transition-colors p-1" title="Revoke">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      {viewOpen && viewTarget && (
        <ViewUserDialog
          target={viewTarget}
          onClose={() => { setViewOpen(false); setViewTarget(null); }}
        />
      )}
      {editOpen && editTarget && (
        <EditUserDialog
          target={editTarget}
          isSuperAdmin={isSuperAdmin}
          onClose={() => { setEditOpen(false); setEditTarget(null); }}
          onSaved={() => { setEditOpen(false); setEditTarget(null); loadData(); }}
        />
      )}
    </div>
  );
}
