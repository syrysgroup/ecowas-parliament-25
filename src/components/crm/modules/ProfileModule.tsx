import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CRM_ROLE_META } from "../crmRoles";
import { format, parseISO } from "date-fns";
import {
  Camera, Shield, Globe, Loader2, User, MapPin, Calendar,
  Briefcase, Check, Star, Users, Link2, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// ─── Profile Banner ───────────────────────────────────────────────────────────
function ProfileBanner({
  avatarUrl, fullName, title, country, joinDate, uploading, onUpload,
}: {
  avatarUrl: string;
  fullName: string;
  title: string;
  country: string;
  joinDate: string;
  uploading: boolean;
  onUpload: (f: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const initials = fullName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <div className="relative">
      {/* Banner gradient */}
      <div className="h-32 rounded-t-xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900" />
      {/* Avatar overlay */}
      <div className="absolute left-6 -bottom-12 flex items-end gap-5">
        <div className="relative w-24 h-24 rounded-xl bg-crm-card border-4 border-crm-card overflow-hidden shadow-xl flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-crm-border">
              <span className="text-2xl font-bold text-emerald-400 uppercase">{initials}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          >
            {uploading ? <Loader2 size={18} className="text-white animate-spin" /> : <Camera size={18} className="text-white" />}
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
        <div className="pb-1 hidden sm:block">
          <h2 className="text-lg font-bold text-crm-text">{fullName || "Your Name"}</h2>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-crm-text-muted">
            {title && <span className="flex items-center gap-1"><Briefcase size={11} /> {title}</span>}
            {country && <span className="flex items-center gap-1"><MapPin size={11} /> {country}</span>}
            {joinDate && <span className="flex items-center gap-1"><Calendar size={11} /> Joined {format(parseISO(joinDate), "MMM yyyy")}</span>}
          </div>
        </div>
      </div>
      {/* Spacer for avatar overflow */}
      <div className="h-14" />
    </div>
  );
}

// ─── About Card ───────────────────────────────────────────────────────────────
function AboutCard({ fullName, title, organisation, country, bio, roles }: {
  fullName: string; title: string; organisation: string; country: string; bio: string; roles: string[];
}) {
  return (
    <div className="bg-crm-card border border-crm-border rounded-xl p-5 space-y-4">
      <h3 className="text-[13px] font-semibold text-crm-text">About</h3>
      <div className="space-y-3 text-[12px]">
        {fullName && (
          <div className="flex items-center gap-3">
            <User size={14} className="text-crm-text-dim flex-shrink-0" />
            <div><span className="text-crm-text-muted">Full Name:</span> <span className="text-crm-text font-medium">{fullName}</span></div>
          </div>
        )}
        {title && (
          <div className="flex items-center gap-3">
            <Briefcase size={14} className="text-crm-text-dim flex-shrink-0" />
            <div><span className="text-crm-text-muted">Role:</span> <span className="text-crm-text font-medium">{title}</span></div>
          </div>
        )}
        {organisation && (
          <div className="flex items-center gap-3">
            <Star size={14} className="text-crm-text-dim flex-shrink-0" />
            <div><span className="text-crm-text-muted">Organisation:</span> <span className="text-crm-text font-medium">{organisation}</span></div>
          </div>
        )}
        {country && (
          <div className="flex items-center gap-3">
            <MapPin size={14} className="text-crm-text-dim flex-shrink-0" />
            <div><span className="text-crm-text-muted">Country:</span> <span className="text-crm-text font-medium">{country}</span></div>
          </div>
        )}
        {roles.length > 0 && (
          <div className="flex items-start gap-3">
            <Shield size={14} className="text-crm-text-dim flex-shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {roles.map(r => {
                const m = CRM_ROLE_META[r as keyof typeof CRM_ROLE_META];
                return m ? (
                  <span key={r} className={`text-[9px] font-mono border rounded px-1.5 py-0.5 ${m.bgColour} ${m.colour} ${m.borderColour}`}>
                    {m.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
      {bio && (
        <>
          <div className="border-t border-crm-border" />
          <p className="text-[12px] text-crm-text-secondary leading-relaxed">{bio}</p>
        </>
      )}
    </div>
  );
}

// ─── Overview Card ────────────────────────────────────────────────────────────
function OverviewCard() {
  return (
    <div className="bg-crm-card border border-crm-border rounded-xl p-5 space-y-4">
      <h3 className="text-[13px] font-semibold text-crm-text">Overview</h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Check, label: "Tasks Done", val: "—" },
          { icon: Users, label: "Connections", val: "—" },
          { icon: Star, label: "Projects", val: "—" },
          { icon: Heart, label: "Events", val: "—" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-crm-surface flex items-center justify-center">
              <s.icon size={14} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-crm-text">{s.val}</p>
              <p className="text-[10px] text-crm-text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProfileModule() {
  const { user, roles } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showOnWebsite, setShowOnWebsite] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joinDate, setJoinDate] = useState("");

  const [tab, setTab] = useState<"profile" | "security">("profile");

  // Password
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSending, setPwSending] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    (supabase as any)
      .from("profiles")
      .select("full_name, title, organisation, country, bio, avatar_url, show_on_website, created_at")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setFullName(data.full_name ?? "");
          setTitle(data.title ?? "");
          setOrganisation(data.organisation ?? "");
          setCountry(data.country ?? "");
          setBio(data.bio ?? "");
          setAvatarUrl(data.avatar_url ?? "");
          setShowOnWebsite(data.show_on_website ?? false);
          setJoinDate(data.created_at ?? "");
        }
        setLoading(false);
      });
  }, [user?.id]);

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}.${ext}`;
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
    if (!user?.id) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          title: title.trim() || null,
          organisation: organisation.trim() || null,
          country: country.trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl || null,
          show_on_website: showOnWebsite,
        })
        .eq("id", user.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["team-members"] });
      qc.invalidateQueries({ queryKey: ["team-members-profiles"] });
      toast({ title: "Profile saved" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setPwSending(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      toast({ title: "Password updated" });
      setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setPwSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-0">
      {/* Banner */}
      <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
        <ProfileBanner
          avatarUrl={avatarUrl}
          fullName={fullName}
          title={title}
          country={country}
          joinDate={joinDate}
          uploading={uploading}
          onUpload={handleAvatarUpload}
        />

        {/* Tabs */}
        <div className="flex gap-1 px-6 border-t border-crm-border">
          {(["profile", "security"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors capitalize ${
                tab === t
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-crm-text-muted hover:text-crm-text-secondary"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-4">
            <AboutCard
              fullName={fullName}
              title={title}
              organisation={organisation}
              country={country}
              bio={bio}
              roles={roles}
            />
            <OverviewCard />
          </div>

          {/* Right column — edit form */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-crm-card border border-crm-border rounded-xl p-5 space-y-4">
              <h3 className="text-[13px] font-semibold text-crm-text">Edit Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-crm-text-muted">Full Name</Label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name"
                    className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-crm-text-muted">Title / Role</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Programme Director"
                    className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-crm-text-muted">Organisation</Label>
                  <Input value={organisation} onChange={e => setOrganisation(e.target.value)} placeholder="e.g. ECOWAS Commission"
                    className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-crm-text-muted">Country</Label>
                  <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Nigeria"
                    className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-crm-text-muted">Bio</Label>
                <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="A short description about yourself…" rows={3}
                  className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700 resize-none" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-crm-border">
                <div>
                  <p className="text-[12px] font-medium text-crm-text flex items-center gap-1.5">
                    <Globe size={13} className="text-emerald-400" />
                    Show on public Team page
                  </p>
                  <p className="text-[10px] text-crm-text-muted mt-0.5">
                    Your name, photo and bio will appear on the website's Team section
                  </p>
                </div>
                <Switch checked={showOnWebsite} onCheckedChange={setShowOnWebsite} className="data-[state=checked]:bg-emerald-600" />
              </div>

              <Button onClick={handleSave} disabled={saving}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5" size="sm">
                {saving ? <Loader2 size={11} className="animate-spin" /> : <User size={11} />}
                {saving ? "Saving…" : "Save Profile"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="max-w-xl mt-4">
          <div className="bg-crm-card border border-crm-border rounded-xl p-5 space-y-4">
            <h3 className="text-[13px] font-semibold text-crm-text">Account Security</h3>

            <div className="flex items-center justify-between py-2 border-b border-crm-border">
              <div>
                <p className="text-[12px] font-medium text-crm-text">Email address</p>
                <p className="text-[11px] text-crm-text-muted font-mono">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <p className="text-[12px] font-medium text-crm-text flex items-center gap-1.5">
                <Shield size={13} className="text-emerald-400" />
                Change password
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                  placeholder="New password (min 8 chars)" minLength={8}
                  className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
                <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Confirm new password"
                  className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
              </div>
              <Button type="submit" size="sm" disabled={pwSending || newPw.length < 8 || newPw !== confirmPw}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
                {pwSending ? <Loader2 size={11} className="animate-spin" /> : <Shield size={11} />}
                {pwSending ? "Updating…" : "Update Password"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
