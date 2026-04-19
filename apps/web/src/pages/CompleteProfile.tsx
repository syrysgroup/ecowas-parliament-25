import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, AlertCircle, UserCircle2, Camera } from "lucide-react";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";

const ECOWAS_COUNTRIES = [
  "Benin", "Burkina Faso", "Cape Verde", "Côte d'Ivoire", "Gambia",
  "Ghana", "Guinea", "Guinea-Bissau", "Liberia", "Mali", "Niger",
  "Nigeria", "Senegal", "Sierra Leone", "Togo",
];

const DEFAULT_ORG = "ECOWAS Parliament Initiatives";

type PageState = "checking" | "form" | "saving" | "success";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, loading } = useAuthContext();
  const fileRef = useRef<HTMLInputElement>(null);

  const [pageState,     setPageState]     = useState<PageState>("checking");
  const [isSponsor,     setIsSponsor]     = useState(false);
  const [fullName,      setFullName]      = useState("");
  const [title,         setTitle]         = useState("");
  const [organisation,  setOrganisation]  = useState("");
  const [country,       setCountry]       = useState("");
  const [bio,           setBio]           = useState("");
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error,         setError]         = useState<string | null>(null);

  // Redirect to /auth if not logged in
  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  // Resolve role + load existing profile data
  useEffect(() => {
    if (loading || !user) return;

    (async () => {
      // 1. Determine role: user_metadata first, then user_roles table
      const metaRole = user.user_metadata?.role as string | undefined;
      let resolvedRole = metaRole;
      if (!resolvedRole) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();
        resolvedRole = roleData?.role ?? "";
      }
      const sponsorUser = resolvedRole === "sponsor";
      setIsSponsor(sponsorUser);

      // 2. Load existing profile
      const { data } = await supabase
        .from("profiles")
        .select("full_name, title, country, organisation, bio, avatar_url")
        .eq("id", user.id)
        .single();

      // 3. If already complete, go straight to the right destination
      if (data?.full_name && data?.title && data?.country && data?.organisation) {
        navigate(sponsorUser ? "/sponsor-dashboard" : "/crm", { replace: true });
        return;
      }

      // 4. Pre-fill existing data (may come from invitation metadata)
      if (data) {
        setFullName(data.full_name ?? "");
        setTitle(data.title ?? "");
        setCountry(data.country ?? "");
        setBio(data.bio ?? "");
        setAvatarPreview(data.avatar_url ?? null);
        setOrganisation(data.organisation ?? (sponsorUser ? "" : DEFAULT_ORG));
      } else {
        if (!sponsorUser) setOrganisation(DEFAULT_ORG);
      }

      setPageState("form");
    })();
  }, [user, loading, navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !title.trim() || !organisation.trim() || !country) {
      setError("Please fill in all required fields.");
      return;
    }
    setPageState("saving");
    try {
      let avatarUrl: string | null = avatarPreview;

      // Upload avatar if a new file was selected
      if (avatarFile) {
        const ext  = avatarFile.name.split(".").pop();
        const path = `${user!.id}-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("profile-photos")
          .upload(path, avatarFile, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("profile-photos").getPublicUrl(path);
          avatarUrl = urlData.publicUrl;
        }
      }

      const { error: dbErr } = await supabase
        .from("profiles")
        .update({
          full_name:    fullName.trim(),
          title:        title.trim(),
          organisation: organisation.trim(),
          country,
          bio:          bio.trim() || null,
          avatar_url:   avatarUrl,
        })
        .eq("id", user!.id);
      if (dbErr) throw dbErr;

      // Sync full_name to auth metadata
      await supabase.auth.updateUser({ data: { full_name: fullName.trim() } });

      setPageState("success");
      setTimeout(() => navigate(isSponsor ? "/sponsor-dashboard" : "/crm", { replace: true }), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to save profile. Please try again.");
      setPageState("form");
    }
  };

  if (loading || pageState === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(152,100%,20%)] via-[hsl(150,80%,10%)] to-[hsl(150,60%,6%)]">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[hsl(152,100%,20%)] via-[hsl(150,80%,10%)] to-[hsl(150,60%,6%)]">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 gap-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 flex flex-col items-center gap-6 border border-white/20">
          <div className="bg-white rounded-full p-4 shadow-2xl">
            <img src={ecowasLogo} alt="ECOWAS Parliament Initiatives" className="h-20 w-20 object-contain" width={80} height={80} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">ECOWAS Parliament Initiatives</h1>
            <p className="text-white/70 mt-2 text-sm font-medium">CRM Portal — Staff Onboarding</p>
          </div>
          <div className="w-16 h-0.5 bg-white/30 rounded" />

          {/* Step progress */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500/30 border border-emerald-500/60 flex items-center justify-center">
                <CheckCircle2 size={13} className="text-emerald-300" />
              </div>
              <span className="text-white/50 text-xs">Set password</span>
            </div>
            <div className="w-8 h-px bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/25 border border-white/50 flex items-center justify-center">
                <span className="text-white text-[11px] font-bold">2</span>
              </div>
              <span className="text-white text-xs font-semibold">Complete profile</span>
            </div>
          </div>

          <p className="text-white/50 text-xs text-center max-w-xs leading-relaxed">
            Fill in your details to personalise your CRM experience and make your profile visible to your team.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm py-8">

          {/* Mobile logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <div className="bg-white rounded-full p-3 shadow-xl">
              <img src={ecowasLogo} alt="ECOWAS Parliament Initiatives" className="h-12 w-12 object-contain" />
            </div>
          </div>

          {/* Mobile step indicator */}
          <div className="flex items-center justify-center gap-3 mb-6 lg:hidden">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500/30 border border-emerald-500/60 flex items-center justify-center">
                <CheckCircle2 size={11} className="text-emerald-300" />
              </div>
              <span className="text-white/50 text-xs">Password set</span>
            </div>
            <div className="w-6 h-px bg-white/20" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-white/25 border border-white/50 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">2</span>
              </div>
              <span className="text-white text-xs font-semibold">Profile</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">

            {/* Success state */}
            {pageState === "success" && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Profile complete!</h2>
                  <p className="text-white/60 text-sm mt-2">
                    {isSponsor ? "Taking you to your sponsor portal…" : "Taking you to the CRM…"}
                  </p>
                </div>
                <Loader2 size={16} className="animate-spin text-white/50" />
              </div>
            )}

            {/* Form state */}
            {(pageState === "form" || pageState === "saving") && (
              <>
                <div className="mb-5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                    <UserCircle2 size={17} className="text-white/80" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg leading-tight">Complete your profile</h2>
                    <p className="text-white/50 text-xs mt-0.5">Required before accessing the portal</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Avatar upload */}
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="w-16 h-16 rounded-full bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer overflow-hidden hover:border-white/60 transition-colors flex-shrink-0"
                    >
                      {avatarPreview
                        ? <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar" />
                        : <Camera size={20} className="text-white/40" />
                      }
                    </div>
                    <div>
                      <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-white/70 hover:text-white font-medium hover:underline">
                        Upload photo
                      </button>
                      <p className="text-[10px] text-white/30 mt-0.5">JPG or PNG, max 2MB (optional)</p>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs font-semibold">
                      Full Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Amara Koné"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder-white/30 focus:border-white/50 focus:bg-white/15"
                    />
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs font-semibold">
                      Title / Position <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Programme Coordinator"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder-white/30 focus:border-white/50 focus:bg-white/15"
                    />
                  </div>

                  {/* Organisation */}
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs font-semibold">
                      Organisation <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={organisation}
                      onChange={e => setOrganisation(e.target.value)}
                      placeholder={isSponsor ? "Your organisation name" : DEFAULT_ORG}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder-white/30 focus:border-white/50 focus:bg-white/15"
                    />
                    {!isSponsor && organisation === DEFAULT_ORG && (
                      <p className="text-white/30 text-[10px]">Pre-filled — you can change this if needed.</p>
                    )}
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs font-semibold">
                      Country <span className="text-red-400">*</span>
                    </Label>
                    <Select value={country} onValueChange={setCountry} required>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-white/50 focus:bg-white/15">
                        <SelectValue placeholder="Select your country" className="text-white/30" />
                      </SelectTrigger>
                      <SelectContent className="bg-[hsl(152,40%,8%)] border-white/20 text-white">
                        {ECOWAS_COUNTRIES.map(c => (
                          <SelectItem key={c} value={c} className="focus:bg-white/10 focus:text-white">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs font-semibold">
                      Bio <span className="text-white/30 font-normal">(optional)</span>
                    </Label>
                    <Textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="A short description about yourself…"
                      rows={2}
                      className="bg-white/10 border-white/20 text-white placeholder-white/30 focus:border-white/50 focus:bg-white/15 resize-none text-sm"
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 bg-red-500/15 border border-red-500/30 rounded-lg px-3 py-2.5">
                      <AlertCircle size={14} className="text-red-300 flex-shrink-0 mt-0.5" />
                      <p className="text-red-300 text-xs">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={pageState === "saving" || !fullName.trim() || !title.trim() || !organisation.trim() || !country}
                    className="w-full bg-white text-[hsl(152,100%,20%)] hover:bg-white/90 font-bold gap-2 mt-2"
                  >
                    {pageState === "saving"
                      ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                      : isSponsor ? "Save & Enter Sponsor Portal" : "Save & Enter CRM"}
                  </Button>
                </form>
              </>
            )}
          </div>

          <p className="text-white/30 text-[10px] text-center mt-6">
            © {new Date().getFullYear()} ECOWAS Parliament Initiatives. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
