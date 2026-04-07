import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const EmailConfigSettings = () => {
  const { settings, updateSetting } = useGlobalSettings();
  const stored = (settings.smtp as Record<string, any>) ?? {};

  const [host, setHost] = useState(stored.host ?? "smtppro.zoho.eu");
  const [port, setPort] = useState(String(stored.port ?? 465));
  const [username, setUsername] = useState(stored.username ?? "");
  const [password, setPassword] = useState("");
  const [fromName, setFromName] = useState(stored.from_name ?? "ECOWAS Parliament CRM");
  const [fromEmail, setFromEmail] = useState(stored.from_email ?? "noreply@ecowas.int");
  const [showPw, setShowPw] = useState(false);

  // IMAP settings
  const [imapHost, setImapHost] = useState(stored.imap_host ?? "imappro.zoho.eu");
  const [imapPort, setImapPort] = useState(String(stored.imap_port ?? 993));
  const [sslEnabled, setSslEnabled] = useState(stored.ssl_enabled !== false);

  const handleSave = async () => {
    const smtp: Record<string, any> = {
      host,
      port: Number(port),
      username,
      from_name: fromName,
      from_email: fromEmail,
      imap_host: imapHost,
      imap_port: Number(imapPort),
      ssl_enabled: sslEnabled,
    };
    if (password) smtp.password_hint = "***";
    await updateSetting("smtp", smtp);
    toast.success("Email config saved");
  };

  const handleTest = () => {
    toast.info("Test connection feature requires server-side SMTP. Add a Supabase Edge Function to handle this.");
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      {/* SMTP / Outgoing */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Outgoing (SMTP)</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>SMTP Host</Label>
            <Input value={host} onChange={(e) => setHost(e.target.value)} placeholder="smtppro.zoho.eu" />
          </div>
          <div className="space-y-1.5">
            <Label>SMTP Port</Label>
            <Input value={port} onChange={(e) => setPort(e.target.value)} placeholder="465" type="number" />
          </div>
          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="user@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep existing"
                className="pr-9"
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>From Name</Label>
            <Input value={fromName} onChange={(e) => setFromName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>From Email</Label>
            <Input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} />
          </div>
        </div>
      </div>

      {/* IMAP / Incoming */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Incoming (IMAP)</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>IMAP Host</Label>
            <Input value={imapHost} onChange={(e) => setImapHost(e.target.value)} placeholder="imappro.zoho.eu" />
          </div>
          <div className="space-y-1.5">
            <Label>IMAP Port</Label>
            <Input value={imapPort} onChange={(e) => setImapPort(e.target.value)} placeholder="993" type="number" />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <Switch checked={sslEnabled} onCheckedChange={setSslEnabled} />
            <Label className="cursor-pointer">Require SSL</Label>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave}>Save Config</Button>
        <Button variant="outline" onClick={handleTest}>Test Connection</Button>
      </div>
    </div>
  );
};

export default EmailConfigSettings;
