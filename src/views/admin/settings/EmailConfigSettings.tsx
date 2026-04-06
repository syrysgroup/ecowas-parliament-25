import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const EmailConfigSettings = () => {
  const { settings, updateSetting } = useGlobalSettings();
  const stored = (settings.smtp as Record<string, any>) ?? {};

  const [host, setHost] = useState(stored.host ?? "");
  const [port, setPort] = useState(String(stored.port ?? 587));
  const [username, setUsername] = useState(stored.username ?? "");
  const [password, setPassword] = useState("");
  const [fromName, setFromName] = useState(stored.from_name ?? "ECOWAS Parliament CRM");
  const [fromEmail, setFromEmail] = useState(stored.from_email ?? "noreply@ecowas.int");
  const [showPw, setShowPw] = useState(false);

  const handleSave = async () => {
    const smtp: Record<string, any> = { host, port: Number(port), username, from_name: fromName, from_email: fromEmail };
    if (password) smtp.password_hint = "***";
    await updateSetting("smtp", smtp);
    toast.success("Email config saved");
  };

  const handleTest = () => {
    toast.info("Test connection feature requires server-side SMTP. Add a Supabase Edge Function to handle this.");
  };

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>SMTP Host</Label>
          <Input value={host} onChange={(e) => setHost(e.target.value)} placeholder="smtp.example.com" />
        </div>
        <div className="space-y-1.5">
          <Label>SMTP Port</Label>
          <Input value={port} onChange={(e) => setPort(e.target.value)} placeholder="587" type="number" />
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
      <div className="flex gap-2">
        <Button onClick={handleSave}>Save Config</Button>
        <Button variant="outline" onClick={handleTest}>Test Connection</Button>
      </div>
    </div>
  );
};

export default EmailConfigSettings;
