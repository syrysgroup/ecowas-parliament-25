import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Camera, Shield, Globe, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function ProfileModule() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  // Profile fields
  const [fullName,      setFullName]      = useState("");
  const [title,         setTitle]         = useState("");
  const [organisation,  setOrganisation]  = useState("");
  const [country,       setCountry]       = useState("");
  const [bio,           setBio]           = useState("");
  const [avatarUrl,     setAvatarUrl]     = useState("");
  const [showOnWebsite, setShowOnWebsite] = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [loading,       setLoading]       = useState(true);

  // Password change fields
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSending, setPwSending] = useState(false);

  // Load profile on mount
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    (supabase as any)
      .from("profiles")
      .select("full_name, title, organisation, country, bio, avatar_url, show_on_website")
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
          full_name:       fullName.trim(),
          title:           title.trim() || null,
          organisation:    organisation.trim() || null,
          country:         country.trim(),
          bio:             bio.trim() || null,
          avatar_url:      avatarUrl || null,
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

  const initials = fullName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || user?.email?.charAt(0).toUpperCase() || "?";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-crm-text">My Profile</h2>
        <p className="text-[12px] text-crm-text-muted mt-0.5">Update your personal information and website visibility</p>
      </div>

      {/* Avatar */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-6">
        <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider mb-4">Profile Photo</p>
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-full bg-crm-border flex items-center justify-center overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <span className="text-2xl font-bold text-emerald-400 uppercase">{initials}</span>
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
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
          />
          <div className="text-[11px] text-crm-text-dim space-y-1">
            <p>Click the avatar to upload a photo</p>
            <p className="text-crm-text-faint">JPG, PNG or WebP · max 5MB</p>
            {uploading && <p className="text-emerald-400 animate-pulse">Uploading…</p>}
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-6 space-y-4">
        <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Personal Information</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Full Name</Label>
            <Input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Title / Role</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Programme Director"
              className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Organisation</Label>
            <Input
              value={organisation}
              onChange={e => setOrganisation(e.target.value)}
              placeholder="e.g. ECOWAS Commission"
              className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Country</Label>
            <Input
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="e.g. Nigeria"
              className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] text-crm-text-muted">Bio</Label>
          <Textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="A short description about yourself…"
            rows={3}
            className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700 resize-none"
          />
        </div>

        {/* Website visibility */}
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
          <Switch
            checked={showOnWebsite}
            onCheckedChange={setShowOnWebsite}
            className="data-[state=checked]:bg-emerald-600"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5"
          size="sm"
        >
          {saving ? <Loader2 size={11} className="animate-spin" /> : <User size={11} />}
          {saving ? "Saving…" : "Save Profile"}
        </Button>
      </div>

      {/* Account / Password */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-6 space-y-4">
        <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Account Security</p>

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
            <Input
              type="password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="New password (min 8 chars)"
              minLength={8}
              className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700"
            />
            <Input
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="Confirm new password"
              className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={pwSending || newPw.length < 8 || newPw !== confirmPw}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5"
          >
            {pwSending ? <Loader2 size={11} className="animate-spin" /> : <Shield size={11} />}
            {pwSending ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
