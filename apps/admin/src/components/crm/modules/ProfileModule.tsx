import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
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
  Twitter, Link2, Upload, Bell, Cake, AtSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const EmailSignaturePanel = lazy(() => import("./EmailSignaturePanel"));

// ─── Profile Banner ───────────────────────────────────────────────────────────
function ProfileBanner({
  avatarUrl, fullName, title, country, joinDate, email, roles, uploading, onUpload, onUrlChange, isSuperAdmin,
}: {
  avatarUrl: string; fullName: string; title: string; country: string;
  joinDate: string; email: string; roles: string[]; isSuperAdmin: boolean;
  uploading: boolean; onUpload: (f: File) => void; onUrlChange: (url: string) => void;
}) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const displayAvatar = avatarUrl || DEFAULT_AVATAR;

  return (
    <div className="relative">
      <div className="h-36 rounded-t-xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900" />
      <div className="px-6 pb-5 pt-0 -mt-12 flex flex-col sm:flex-row items-center sm:items-end gap-4">
        {/* Avatar */}
        <div className="relative w-24 h-24 rounded-xl bg-crm-card border-4 border-crm-card overflow-hidden shadow-xl flex-shrink-0">
          <img
            src={displayAvatar}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={e => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-1">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors" title={t("crm.profile.uploadAvatar")}>
              {uploading ? <Loader2 size={14} className="text-white animate-spin" /> : <Camera size={14} className="text-white" />}
            </button>
            <button type="button" onClick={() => setShowUrlInput(!showUrlInput)}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors" title={t("crm.profile.pasteUrl")}>
              <Link2 size={14} className="text-white" />
            </button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />

        {/* Info */}
        <div className="text-center sm:text-left pb-1 flex-1 min-w-0">
          <h2 className="text-lg font-bold text-crm-text">{fullName || t("crm.profile.yourName")}</h2>
          {email && (
            <p className="text-[11px] text-crm-text-muted mt-0.5 flex items-center gap-1.5 justify-center sm:justify-start">
              <Mail size={11} className="text-emerald-400 flex-shrink-0" />
              <span className="break-all">{email}</span>
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1 text-[10px] text-crm-text-muted">
            {title && <span className="flex items-center gap-1"><Briefcase size={10} /> {title}</span>}
            {country && <span className="flex items-center gap-1"><MapPin size={10} /> {country}</span>}
            {joinDate && <span className="flex items-center gap-1"><Calendar size={10} /> {t("crm.profile.joined")} {format(parseISO(joinDate), "MMM yyyy")}</span>}
          </div>
          {isSuperAdmin && roles.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5 justify-center sm:justify-start">
              {roles.map(r => {
                const m = CRM_ROLE_META[r as keyof typeof CRM_ROLE_META];
                return m ? (
                  <span key={r} className={`text-[8px] font-mono border rounded px-1.5 py-0.5 ${m.bgColour} ${m.colour} ${m.borderColour}`}>
                    {m.label}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
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

// ─── Input Field (defined at top level to avoid remount on parent re-render) ──
function InputField({ label, value, onChange, placeholder, disabled, type = "text", icon: Icon, note }: {
  label: string; value: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; disabled?: boolean; type?: string; icon?: any; note?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-crm-text-muted uppercase tracking-wider flex items-center gap-1">
        {Icon && <Icon size={10} className="text-crm-text-dim" />}
        {label}
      </Label>
      <Input value={value} onChange={onChange} placeholder={placeholder} type={type} disabled={disabled}
        className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700 h-9 disabled:opacity-60 disabled:cursor-not-allowed" />
      {note && <p className="text-[10px] text-crm-text-dim">{note}</p>}
    </div>
  );
}

// ─── Contact Info Row ─────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, isLink }: { icon: any; label: string; value: string; isLink?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 text-[12px] py-1.5">
      <Icon size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <span className="text-crm-text-muted text-[10px] uppercase tracking-wider">{label}</span>
        {isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="block text-emerald-400 hover:underline truncate text-[12px]">{value}</a>
        ) : (
          <p className="text-crm-text font-medium break-all">{value}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProfileModule() {
  const { user, roles, isSuperAdmin } = useAuthContext();
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
  const [notificationEmail, setNotificationEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joinDate, setJoinDate] = useState("");

  const [crmEmailAddress, setCrmEmailAddress] = useState<string | null>(null);

  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSending, setPwSending] = useState(false);

  // Change login email state
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailChangeSending, setEmailChangeSending] = useState(false);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState("");

  // Notification prefs state
  const [notifyNewMessage, setNotifyNewMessage] = useState(true);
  const [notifyTaskAssign, setNotifyTaskAssign] = useState(true);
  const [notifyEventRemind, setNotifyEventRemind] = useState(true);
  const [notifyAppPending, setNotifyAppPending] = useState(true);
  const [notifyInviteAccept, setNotifyInviteAccept] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["profile-stats", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const [tasksRes, msgsRes, eventsRes] = await Promise.all([
        supabase.from("tasks").select("id", { count: "exact", head: true }).eq("assignee_id", user!.id).eq("status", "done"),
        supabase.from("crm_messages").select("id", { count: "exact", head: true }).or(`from_user_id.eq.${user!.id},to_user_id.eq.${user!.id}`),
        supabase.from("crm_calendar_events").select("id", { count: "exact", head: true }).eq("created_by", user!.id),
      ]);
      return {
        tasksDone: tasksRes.count ?? 0,
        connections: msgsRes.count ?? 0,
        events: eventsRes.count ?? 0,
      };
    },
  });

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      supabase
        .from("profiles")
        .select("full_name, title, organisation, country, bio, avatar_url, show_on_website, created_at, phone, linkedin_url, twitter_url, notification_email, date_of_birth")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("email_accounts")
        .select("email_address")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle(),
      supabase
        .from("user_notification_prefs")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]).then(([profileRes, emailAcctRes, notifRes]: any[]) => {
      const data = profileRes.data;
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
        setNotificationEmail(data.notification_email ?? "");
        setDateOfBirth(data.date_of_birth ?? "");
      }
      if (emailAcctRes.data) setCrmEmailAddress(emailAcctRes.data.email_address);
      if (notifRes.data) {
        const n = notifRes.data;
        setNotifyNewMessage(n.notify_new_message ?? true);
        setNotifyTaskAssign(n.notify_task_assign ?? true);
        setNotifyEventRemind(n.notify_event_remind ?? true);
        setNotifyAppPending(n.notify_app_pending ?? true);
        setNotifyInviteAccept(n.notify_invite_accept ?? true);
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
      const { error } = await supabase
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
          notification_email: notificationEmail.trim() || null,
          date_of_birth: dateOfBirth || null,
        })
        .eq("id", user.id);
      if (error) throw error;
      // Sync full_name to auth user_metadata so CRM header stays in sync
      await supabase.auth.updateUser({ data: { full_name: fullName.trim(), avatar_url: avatarUrl || null } });
      qc.invalidateQueries({ queryKey: ["team-members"] });
      qc.invalidateQueries({ queryKey: ["team-members-profiles"] });
      qc.invalidateQueries({ queryKey: ["profile-stats"] });
      qc.invalidateQueries({ queryKey: ["crm-notifications"] });
      toast({ title: t("crm.profile.saved") });
    } catch (err: any) {
      toast({ title: t("crm.profile.saveFailed"), description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailChangeSuccess("");
    if (!newEmail.trim() || !confirmEmail.trim()) return;
    if (newEmail !== confirmEmail) {
      toast({ title: "Emails do not match", variant: "destructive" });
      return;
    }
    if (newEmail === user?.email) {
      toast({ title: "New email must differ from current email", variant: "destructive" });
      return;
    }
    setEmailChangeSending(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setEmailChangeSuccess(`A confirmation link has been sent to ${newEmail}. Click it to confirm the change.`);
      setNewEmail(""); setConfirmEmail("");
    } catch (err: any) {
      toast({ title: "Failed to update email", description: err.message, variant: "destructive" });
    } finally {
      setEmailChangeSending(false);
    }
  };

  const handleSaveNotifications = async (overrides?: Record<string, boolean>) => {
    if (!user?.id) return;
    setNotifSaving(true);
    try {
      const prefs = {
        user_id: user.id,
        notify_new_message: overrides?.notify_new_message ?? notifyNewMessage,
        notify_task_assign: overrides?.notify_task_assign ?? notifyTaskAssign,
        notify_event_remind: overrides?.notify_event_remind ?? notifyEventRemind,
        notify_app_pending: overrides?.notify_app_pending ?? notifyAppPending,
        notify_invite_accept: overrides?.notify_invite_accept ?? notifyInviteAccept,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("user_notification_prefs").upsert(prefs, { onConflict: "user_id" });
      if (error) throw error;
      toast({ title: "Notification preferences saved" });
    } catch (err: any) {
      toast({ title: "Failed to save preferences", description: err.message, variant: "destructive" });
    } finally {
      setNotifSaving(false);
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
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Banner */}
      <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
        <ProfileBanner
          avatarUrl={avatarUrl} fullName={fullName} title={title} country={country}
          joinDate={joinDate} email={user?.email ?? ""} roles={roles}
          uploading={uploading} onUpload={handleAvatarUpload}
          onUrlChange={(url) => setAvatarUrl(url)}
          isSuperAdmin={isSuperAdmin}
        />
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-crm-card border border-crm-border w-full justify-start rounded-xl h-auto p-1 gap-1">
          <TabsTrigger value="profile" className="text-xs data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400 rounded-lg px-4 py-2">
            {t("crm.profile.tabProfile")}
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400 rounded-lg px-4 py-2">
            {t("crm.profile.tabSecurity")}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400 rounded-lg px-4 py-2">
            {t("crm.profile.tabNotifications") || "Notifications"}
          </TabsTrigger>
          <TabsTrigger value="signature" className="text-xs data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400 rounded-lg px-4 py-2">
            Signature
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab — merged profile + contact */}
        <TabsContent value="profile" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Left — Read-only about card */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-crm-card border border-crm-border rounded-xl p-5 space-y-1">
                <h3 className="text-[13px] font-semibold text-crm-text mb-3">{t("crm.profile.about")}</h3>
                <InfoRow icon={User} label={t("crm.profile.fullName")} value={fullName} />
                <InfoRow icon={Mail} label={t("crm.profile.email")} value={user?.email ?? ""} />
                {crmEmailAddress && <InfoRow icon={AtSign} label="CRM Email" value={crmEmailAddress} />}
                <InfoRow icon={Phone} label={t("crm.profile.phone")} value={phone} />
                <InfoRow icon={Briefcase} label={t("crm.profile.titleRole")} value={title} />
                <InfoRow icon={Star} label={t("crm.profile.organisation")} value={organisation} />
                <InfoRow icon={MapPin} label={t("crm.profile.country")} value={country} />
                <InfoRow icon={Bell} label={t("crm.profile.notificationEmail")} value={notificationEmail} />
                {dateOfBirth && <InfoRow icon={Cake} label={t("crm.profile.dateOfBirth")} value={format(parseISO(dateOfBirth), "d MMMM yyyy")} />}
                <InfoRow icon={Linkedin} label="LinkedIn" value={linkedinUrl} isLink />
                <InfoRow icon={Twitter} label="Twitter / X" value={twitterUrl} isLink />
                {bio && (
                  <>
                    <div className="border-t border-crm-border mt-2 pt-2" />
                    <p className="text-[11px] text-crm-text-secondary leading-relaxed">{bio}</p>
                  </>
                )}
              </div>

              {/* Overview Stats */}
              <div className="bg-crm-card border border-crm-border rounded-xl p-5 space-y-3">
                <h3 className="text-[13px] font-semibold text-crm-text">{t("crm.profile.overview")}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Check, label: t("crm.profile.tasksDone"), val: stats ? String(stats.tasksDone) : "—" },
                    { icon: Users, label: t("crm.profile.connections"), val: stats ? String(stats.connections) : "—" },
                    { icon: Star, label: t("crm.profile.projects"), val: "—" },
                    { icon: Heart, label: t("crm.profile.events"), val: stats ? String(stats.events) : "—" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-2.5 p-2 rounded-lg bg-crm-surface">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-800/30 flex items-center justify-center">
                        <s.icon size={13} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-crm-text leading-none">{s.val}</p>
                        <p className="text-[9px] text-crm-text-muted mt-0.5">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Edit form */}
            <div className="lg:col-span-3">
              <div className="bg-crm-card border border-crm-border rounded-xl p-5 space-y-4">
                <h3 className="text-[13px] font-semibold text-crm-text">{t("crm.profile.editProfile")}</h3>

                {/* Personal Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField icon={User} label={t("crm.profile.fullName")} value={fullName} onChange={(e: any) => setFullName(e.target.value)} placeholder={t("crm.profile.fullNamePlaceholder")} />
                  <InputField icon={Briefcase} label={t("crm.profile.titleRole")} value={title} onChange={(e: any) => setTitle(e.target.value)} placeholder={t("crm.profile.titlePlaceholder")} />
                  <InputField icon={Star} label={t("crm.profile.organisation")} value={organisation} onChange={(e: any) => setOrganisation(e.target.value)} placeholder={t("crm.profile.orgPlaceholder")} />
                  <InputField icon={MapPin} label={t("crm.profile.country")} value={country} onChange={(e: any) => setCountry(e.target.value)} placeholder={t("crm.profile.countryPlaceholder")} />
                </div>

                <div className="border-t border-crm-border pt-3">
                  <p className="text-[10px] text-crm-text-dim uppercase tracking-wider mb-2">{t("crm.profile.contactDetails")}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InputField icon={Mail} label={t("crm.profile.email")} value={user?.email ?? ""} disabled placeholder="" />
                    <InputField icon={AtSign} label="CRM Email Address" value={crmEmailAddress ?? "Not assigned"} disabled placeholder="" note="Set by administrator" />
                    <InputField icon={Phone} label={t("crm.profile.phone")} value={phone} onChange={(e: any) => setPhone(e.target.value)} placeholder="+234 ..." />
                    <InputField icon={Bell} label={t("crm.profile.notificationEmail")} value={notificationEmail} onChange={(e: any) => setNotificationEmail(e.target.value)} placeholder={t("crm.profile.notifEmailPlaceholder")} />
                    <InputField icon={Cake} label={t("crm.profile.dateOfBirth")} value={dateOfBirth} onChange={(e: any) => setDateOfBirth(e.target.value)} type="date" />
                  </div>
                </div>

                <div className="border-t border-crm-border pt-3">
                  <p className="text-[10px] text-crm-text-dim uppercase tracking-wider mb-2">{t("crm.profile.socialLinks")}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InputField icon={Linkedin} label="LinkedIn URL" value={linkedinUrl} onChange={(e: any) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />
                    <InputField icon={Twitter} label="Twitter / X URL" value={twitterUrl} onChange={(e: any) => setTwitterUrl(e.target.value)} placeholder="https://x.com/..." />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] text-crm-text-muted uppercase tracking-wider">{t("crm.profile.bio")}</Label>
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

              {/* Change Login Email */}
              <form onSubmit={handleChangeEmail} className="space-y-3">
                <p className="text-[12px] font-medium text-crm-text flex items-center gap-1.5">
                  <Mail size={13} className="text-emerald-400" />
                  Change Login Email
                </p>
                {emailChangeSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-[11px] text-emerald-300 leading-relaxed">
                    {emailChangeSuccess}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-crm-text-muted">New Email Address</Label>
                  <Input type="email" value={newEmail} onChange={e => { setNewEmail(e.target.value); setEmailChangeSuccess(""); }}
                    className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm" placeholder="new@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-crm-text-muted">Confirm New Email</Label>
                  <Input type="email" value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)}
                    className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm" placeholder="new@example.com" />
                </div>
                <Button type="submit" disabled={emailChangeSending || !newEmail || !confirmEmail} size="sm"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
                  {emailChangeSending ? <Loader2 size={11} className="animate-spin" /> : <Mail size={11} />}
                  {emailChangeSending ? t("crm.common.saving") : "Update Login Email"}
                </Button>
              </form>

              <div className="border-t border-crm-border pt-3" />

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

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4">
          <div className="max-w-xl">
            <div className="bg-crm-card border border-crm-border rounded-xl p-5 space-y-4">
              <h3 className="text-[13px] font-semibold text-crm-text flex items-center gap-1.5">
                <Bell size={13} className="text-emerald-400" />
                Notification Preferences
              </h3>
              <p className="text-[11px] text-crm-text-muted">Choose which notifications you want to receive.</p>
              {[
                { label: "New Messages", desc: "Notify when you receive a new message", key: "notify_new_message", val: notifyNewMessage, set: setNotifyNewMessage },
                { label: "Task Assigned", desc: "Notify when a task is assigned to you", key: "notify_task_assign", val: notifyTaskAssign, set: setNotifyTaskAssign },
                { label: "Event Reminders", desc: "Notify about upcoming calendar events", key: "notify_event_remind", val: notifyEventRemind, set: setNotifyEventRemind },
                { label: "Application Pending", desc: "Notify when an application awaits review", key: "notify_app_pending", val: notifyAppPending, set: setNotifyAppPending },
                { label: "Invite Accepted", desc: "Notify when someone accepts your invite", key: "notify_invite_accept", val: notifyInviteAccept, set: setNotifyInviteAccept },
              ].map(({ label, desc, key, val, set }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-crm-border last:border-0">
                  <div>
                    <p className="text-[12px] font-medium text-crm-text">{label}</p>
                    <p className="text-[10px] text-crm-text-muted mt-0.5">{desc}</p>
                  </div>
                  <Switch
                    checked={val}
                    onCheckedChange={async (checked) => {
                      set(checked);
                      await handleSaveNotifications({ [key]: checked });
                    }}
                    className="data-[state=checked]:bg-emerald-600"
                    disabled={notifSaving}
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="signature" className="mt-4">
          <Suspense fallback={<div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" /></div>}>
            <EmailSignaturePanel />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
