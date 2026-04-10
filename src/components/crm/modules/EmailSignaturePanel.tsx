import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, PenLine } from "lucide-react";

const TITLE_OPTIONS = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Hon.", "Engr.", "Barr."];
const FIXED_ORG = "ECOWAS Parliament Initiatives";
const FIXED_WEBSITE = "www.ecowasparliamentinitiatives.org";
const FIXED_TAGLINE = "Be The Change You Want To See In The World";
const FIXED_LOGO = "https://xahuyraommtfopnxrjvz.supabase.co/storage/v1/object/public/branding/logos/sing.png";

export default function EmailSignaturePanel() {
  const { user } = useAuthContext();
  const { toast } = useToast();

  const [honorific, setHonorific] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [mobile, setMobile] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [emailAddress, setEmailAddress] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    Promise.all([
      (supabase as any)
        .from("email_signatures")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      (supabase as any)
        .from("email_accounts")
        .select("email_address")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle(),
    ]).then(([sigRes, acctRes]: any[]) => {
      if (acctRes.data) setEmailAddress(acctRes.data.email_address);

      if (sigRes.data) {
        const sig = sigRes.data;
        setHonorific(sig.title ?? "");
        setPosition(sig.department ?? "");
        setMobile(sig.mobile ?? "");
        setIsActive(sig.is_active ?? true);

        const name = sig.full_name ?? "";
        const spaceIdx = name.indexOf(" ");
        if (spaceIdx > 0) {
          setFirstName(name.slice(0, spaceIdx));
          setLastName(name.slice(spaceIdx + 1));
        } else {
          setFirstName(name);
          setLastName("");
        }
      }
      setLoading(false);
    });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any).from("email_signatures").upsert(
        {
          user_id: user.id,
          title: honorific || null,
          full_name: `${firstName} ${lastName}`.trim(),
          department: position.trim() || null,
          mobile: mobile.trim() || null,
          email: emailAddress ?? null,
          website: FIXED_WEBSITE,
          tagline: FIXED_TAGLINE,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (error) throw error;
      toast({ title: "Signature saved" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  const previewName = `${honorific ? honorific + " " : ""}${firstName} ${lastName}`.trim();
  const previewEmail = emailAddress;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Form */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-5 space-y-4">
        <h3 className="text-[13px] font-semibold text-crm-text flex items-center gap-2">
          <PenLine size={14} className="text-emerald-400" />
          Email Signature
        </h3>

        <div className="space-y-1">
          <Label className="text-[10px] text-crm-text-muted uppercase tracking-wider">Title</Label>
          <Select value={honorific} onValueChange={setHonorific}>
            <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm h-9">
              <SelectValue placeholder="Select title…" />
            </SelectTrigger>
            <SelectContent>
              {TITLE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] text-crm-text-muted uppercase tracking-wider">First Name</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name"
              className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-crm-text-muted uppercase tracking-wider">Last Name</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name"
              className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm h-9" />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-crm-text-muted uppercase tracking-wider">Position</Label>
          <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Programme Officer"
            className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm h-9" />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-crm-text-muted uppercase tracking-wider">Mobile Number</Label>
          <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+234 814 560 62 67"
            className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm h-9" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <Label className="text-[11px] text-crm-text-muted">Append signature on send</Label>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <div className="pt-2 border-t border-crm-border">
          {emailAddress ? (
            <p className="text-[11px] text-crm-text-muted">
              Your signature email: <span className="text-emerald-400 font-medium">{emailAddress}</span>
            </p>
          ) : (
            <p className="text-[11px] text-amber-400">No email account assigned yet — contact your admin.</p>
          )}
        </div>

        <Button onClick={handleSave} disabled={saving} size="sm"
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-2 w-full">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Signature
        </Button>
      </div>

      {/* Live Preview */}
      <div className="space-y-2">
        <h3 className="text-[13px] font-semibold text-crm-text">Live Preview</h3>
        <div className="border border-crm-border rounded-xl p-5 bg-white">
          <div style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "#333" }}>
            <p style={{ margin: 0, fontWeight: "bold", fontSize: 15, color: "#1a3c34" }}>
              {previewName || "Your Name"}
            </p>
            <p style={{ margin: "2px 0 0", fontWeight: "bold", fontSize: 13, color: "#2e7d5b" }}>
              {FIXED_ORG}
            </p>
            <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.8, color: "#555" }}>
              {position && <p style={{ margin: 0 }}>{position}</p>}
              {mobile && <p style={{ margin: 0 }}>Mobile Number: {mobile}</p>}
              {previewEmail && <p style={{ margin: 0 }}>Email: {previewEmail}</p>}
              <p style={{ margin: 0 }}>Website: {FIXED_WEBSITE}</p>
            </div>
            <p style={{ margin: "12px 0 0", fontStyle: "italic", fontSize: 11, color: "#888" }}>
              {FIXED_TAGLINE}
            </p>
            <div style={{ marginTop: 12 }}>
              <img src={FIXED_LOGO} alt="ECOWAS Parliament Initiatives" style={{ height: 60 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
