import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { CRM_ROLE_META } from "../crmRoles";
import { format, parseISO } from "date-fns";
import { DEFAULT_AVATAR } from "@/lib/constants";
import {
  Camera, Shield, Globe, Loader2, User, MapPin, Calendar,
  Briefcase, Check, Star, Users, Heart, Mail, Phone, Linkedin,
  Twitter, Link2, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ─── Profile Banner ───────────────────────────────────────────────────────────
function ProfileBanner({
  avatarUrl, fullName, title, country, joinDate, email, roles, uploading, onUpload, onUrlChange,
}: {
  avatarUrl: string; fullName: string; title: string; country: string;
  joinDate: string; email: string; roles: string[];
  uploading: boolean; onUpload: (f: File) => void; onUrlChange: (url: string) => void;
}) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const displayAvatar = avatarUrl || DEFAULT_AVATAR;

  return (
    <div className="relative">
      <div className="h-40 rounded-t-xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900" />
      <div className="px-6 pb-6 pt-0 -mt-14 flex flex-col sm:flex-row items-center sm:items-end gap-5">
        {/* Avatar */}
        <div className="relative w-28 h-28 rounded-xl bg-crm-card border-4 border-crm-card overflow-hidden shadow-xl flex-shrink-0">
          <img src={displayAvatar} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-1">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors" title={t("crm.profile.uploadAvatar")}>
              {uploading ? <Loader2 size={16} className="text-white animate-spin" /> : <Camera size={16} className="text-white" />}
            </button>
            <button type="button" onClick={() => setShowUrlInput(!showUrlInput)}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors" title={t("crm.profile.pasteUrl")}>
              <Link2 size={16} className="text-white" />
            </button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />

        {/* Info */}
        <div className="text-center sm:text-left pb-1 flex-1 min-w-0">
          <h2 className="text-xl font-bold text-crm-text">{fullName || t("crm.profile.yourName")}</h2>
          {email && (
            <p className="text-[12px] text-crm-text-muted mt-0.5 flex items-center gap-1.5 justify-center sm:justify-start">
              <Mail size={12} className="text-emerald-400 flex-shrink-0" />
              <span className="break-all">{email}</span>
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5 text-[11px] text-crm-text-muted">
            {title && <span className="flex items-center gap-1"><Briefcase size={11} /> {title}</span>}
            {country && <span className="flex items-center gap-1"><MapPin size={11} /> {country}</span>}
            {joinDate && <span className="flex items-center gap-1"><Calendar size={11} /> {t("crm.profile.joined")} {format(parseISO(joinDate), "MMM yyyy")}</span>}
          </div>
          {/* Role badges */}
          {roles.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 justify-center sm:justify-start">
              {roles.map(r => {
                const m = CRM_ROLE_META[r as keyof typeof CRM_ROLE_META];
                return m ? (
                  <span key={r} className={`text-[9px] font-mono border rounded px-1.5 py-0.5 ${m.bgColour} ${m.colour} ${m.borderColour}`}>
                    {m.label}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
      {/* URL input overlay */}
      {showUrlInput && (
        <div className="px-6 pb-3 flex gap-2">
          <Input value={urlValue} onChange={e => setUrlValue(e.target.value)}
            placeholder="https://example.com/avatar.png"
            className="bg-crm-surface border-crm-border text-crm-text text-xs flex-1" />
          <Button size="sm" variant="outline" className="text-xs border-crm-border text-crm-text-muted"
            onClick={() => { if (urlValue.trim()) { onUrlChange(urlValue.trim()); setShowUrlInput(false); setUrlValue(""); } }}>
            {t("crm.common.apply")}
          </Button>
          <Button size="sm" variant="ghost" className="text-xs text-crm-text-muted" onClick={() => setShowUrlInput(false)}>✕</Button>
        </div>
      )}
    </div>
  );
}

// ─── Contact Info Row ─────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 text-[12px]">
      <Icon size={14} className="text-crm-text-dim flex-shrink-0" />
      <div><span className="text-crm-text-muted">{label}:</span> <span className="text-crm-text font-medium break-all">{value}</span></div>
    </div>
  );
}

// ─── About Card ───────────────────────────────────────────────────────────────
function AboutCard({ fullName, title, organisation, country, bio, email, phone, linkedinUrl, twitterUrl }: {
  fullName: string; title: string; organisation: string; country: string; bio: string;
  email: string; phone: string; linkedinUrl: string; twitterUrl: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-crm-card border border-crm-border rounded-xl p-5 space-y-4">
      <h3 className="text-[13px] font-semibold text-crm-text">{t("crm.profile.about")}</h3>
      <div className="space-y-3">
        <InfoRow icon={User} label={t("crm.profile.fullName")} value={fullName} />
        <InfoRow icon={Mail} label={t("crm.profile.email")} value={email} />
        <InfoRow icon={Phone} label={t("crm.profile.phone")} value={phone} />
        <InfoRow icon={Briefcase} label={t("crm.profile.titleRole")} value={title} />
        <InfoRow icon={Star} label={t("crm.profile.organisation")} value={organisation} />
        <InfoRow icon={MapPin} label={t("crm.profile.country")} value={country} />
        {linkedinUrl && (
          <div className="flex items-center gap-3 text-[12px]">
            <Linkedin size={14} className="text-crm-text-dim flex-shrink-0" />
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline truncate">LinkedIn</a>
          </div>
        )}
        {twitterUrl && (
          <div className="flex items-center gap-3 text-[12px]">
            <Twitter size={14} className="text-crm-text-dim flex-shrink-0" />
            <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline truncate">Twitter / X</a>
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
  const { t } = useTranslation();
  return (
    <div className="bg-crm-card border border-crm-border rounded-xl p-5 space-y-4">
      <h3 className="text-[13px] font-semibold text-crm-text">{t("crm.profile.overview")}</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Check, label: t("crm.profile.tasksDone"), val: "—" },
          { icon: Users, label: t("crm.profile.connections"), val: "—" },
          { icon: Star, label: t("crm.profile.projects"), val: "—" },
          { icon: Heart, label: t("crm.profile.events"), val: "—" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 p-2 rounded-lg bg-crm-surface">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/50 border border-emerald-800/30 flex items-center justify-center">
              <s.icon size={15} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-crm-text leading-none">{s.val}</p>
              <p className="text-[10px] text-crm-text-muted mt-0.5">{s.label}</p>
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
  const { t } = useTranslation();
  const qc = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showOnWebsite, setShowOnWebsite] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joinDate, setJoinDate] = useState("");

  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSending, setPwSending] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    (supabase as any)
      .from("profiles")
      .select("full_name, title, organisation, country, bio, avatar_url, show_on_website, created_at, phone, linkedin_url, twitter_url")
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
          setPhone(data.phone ?? "");
          setLinkedinUrl(data.linkedin_url ?? "");
          setTwitterUrl(data.twitter_url ?? "");
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
      toast({ title: t("crm.profile.uploadFailed"), description: err.message, variant: "destructive" });
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
          phone: phone.trim() || null,
          linkedin_url: linkedinUrl.trim() || null,
          twitter_url: twitterUrl.trim() || null,
        })
        .eq("id", user.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["team-members"] });
      qc.invalidateQueries({ queryKey: ["team-members-profiles"] });
      toast({ title: t("crm.profile.saved") });
    } catch (err: any) {
      toast({ title: t("crm.profile.saveFailed"), description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast({ title: t("crm.profile.passwordMismatch"), variant: "destructive" });
      return;
    }
    setPwSending(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      toast({ title: t("crm.profile.passwordUpdated") });
      setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      toast({ title: t("crm.common.failed"), description: err.message, variant: "destructive" });
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
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Banner */}
      <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
        <ProfileBanner
          avatarUrl={avatarUrl} fullName={fullName} title={title} country={country}
          joinDate={joinDate} email={user?.email ?? ""} roles={roles}
          uploading={uploading} onUpload={handleAvatarUpload}
          onUrlChange={(url) => setAvatarUrl(url)}
        />
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-crm-card border border-crm-border w-full justify-start rounded-xl h-auto p-1 gap-1">
          <TabsTrigger value="profile" className="text-xs data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400 rounded-lg px-4 py-2">
            {t("crm.profile.tabProfile")}
          </TabsTrigger>
          <TabsTrigger value="contact" className="text-xs data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400 rounded-lg px-4 py-2">
            {t("crm.profile.tabContact")}
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400 rounded-lg px-4 py-2">
            {t("crm.profile.tabSecurity")}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <AboutCard
                fullName={fullName} title={title} organisation={organisation}
                country={country} bio={bio} email={user?.email ?? ""}
                phone={phone} linkedinUrl={linkedinUrl} twitterUrl={twitterUrl}
              />
              <OverviewCard />
            </div>

            <div className="lg:col-span-3">
              <div className="bg-crm-card border border-crm-border rounded-xl p-5 space-y-4">
                <h3 className="text-[13px] font-semibold text-crm-text">{t("crm.profile.editProfile")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-crm-text-muted">{t("crm.profile.fullName")}</Label>
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder={t("crm.profile.fullNamePlaceholder")}
                      className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-crm-text-muted">{t("crm.profile.titleRole")}</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t("crm.profile.titlePlaceholder")}
                      className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-crm-text-muted">{t("crm.profile.organisation")}</Label>
                    <Input value={organisation} onChange={e => setOrganisation(e.target.value)} placeholder={t("crm.profile.orgPlaceholder")}
                      className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-crm-text-muted">{t("crm.profile.country")}</Label>
                    <Input value={country} onChange={e => setCountry(e.target.value)} placeholder={t("crm.profile.countryPlaceholder")}
                      className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-crm-text-muted">{t("crm.profile.bio")}</Label>
                  <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder={t("crm.profile.bioPlaceholder")} rows={3}
                    className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700 resize-none" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-crm-border">
                  <div>
                    <p className="text-[12px] font-medium text-crm-text flex items-center gap-1.5">
                      <Globe size={13} className="text-emerald-400" />
                      {t("crm.profile.showOnWebsite")}
                    </p>
                    <p className="text-[10px] text-crm-text-muted mt-0.5">{t("crm.profile.showOnWebsiteDesc")}</p>
                  </div>
                  <Switch checked={showOnWebsite} onCheckedChange={setShowOnWebsite} className="data-[state=checked]:bg-emerald-600" />
                </div>

                <Button onClick={handleSave} disabled={saving}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5" size="sm">
                  {saving ? <Loader2 size={11} className="animate-spin" /> : <User size={11} />}
                  {saving ? t("crm.common.saving") : t("crm.profile.saveProfile")}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="mt-4">
          <div className="max-w-xl">
            <div className="bg-crm-card border border-crm-border rounded-xl p-5 space-y-4">
              <h3 className="text-[13px] font-semibold text-crm-text">{t("crm.profile.contactDetails")}</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-crm-text-muted">{t("crm.profile.email")}</Label>
                  <Input value={user?.email ?? ""} disabled
                    className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm opacity-60" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-crm-text-muted">{t("crm.profile.phone")}</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 ..."
                    className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-crm-text-muted">LinkedIn URL</Label>
                  <Input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..."
                    className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-crm-text-muted">Twitter / X URL</Label>
                  <Input value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)} placeholder="https://x.com/..."
                    className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5" size="sm">
                {saving ? <Loader2 size={11} className="animate-spin" /> : <User size={11} />}
                {saving ? t("crm.common.saving") : t("crm.profile.saveContact")}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-4">
          <div className="max-w-xl">
            <div className="bg-crm-card border border-crm-border rounded-xl p-5 space-y-4">
              <h3 className="text-[13px] font-semibold text-crm-text">{t("crm.profile.accountSecurity")}</h3>

              <div className="flex items-center justify-between py-2 border-b border-crm-border">
                <div>
                  <p className="text-[12px] font-medium text-crm-text">{t("crm.profile.email")}</p>
                  <p className="text-[11px] text-crm-text-muted font-mono">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3">
                <p className="text-[12px] font-medium text-crm-text flex items-center gap-1.5">
                  <Shield size={13} className="text-emerald-400" />
                  {t("crm.profile.changePassword")}
                </p>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-crm-text-muted">{t("crm.profile.newPassword")}</Label>
                  <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                    className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-crm-text-muted">{t("crm.profile.confirmPassword")}</Label>
                  <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                    className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm" />
                </div>
                <Button type="submit" disabled={pwSending || !newPw || !confirmPw} size="sm"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
                  {pwSending ? <Loader2 size={11} className="animate-spin" /> : <Shield size={11} />}
                  {pwSending ? t("crm.common.saving") : t("crm.profile.updatePassword")}
                </Button>
              </form>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
