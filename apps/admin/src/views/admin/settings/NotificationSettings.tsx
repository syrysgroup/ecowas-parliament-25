import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { toast } from "sonner";

type NotifKey = "new_user" | "deal_closed" | "invoice_sent" | "payment_received" | "system_error";

const notifItems: { key: NotifKey; label: string; desc: string }[] = [
  { key: "new_user", label: "New User Signup", desc: "Alert when a new user registers" },
  { key: "deal_closed", label: "Deal Closed", desc: "Alert when a sponsorship deal is closed" },
  { key: "invoice_sent", label: "Invoice Sent", desc: "Alert when an invoice is dispatched" },
  { key: "payment_received", label: "Payment Received", desc: "Alert when a payment is recorded" },
  { key: "system_error", label: "System Error", desc: "Alert on critical system errors" },
];

const NotificationSettings = () => {
  const { settings, updateSetting } = useGlobalSettings();
  const stored = (settings.notifications as Record<string, boolean>) ?? {};
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    new_user: stored.new_user ?? true,
    deal_closed: stored.deal_closed ?? true,
    invoice_sent: stored.invoice_sent ?? true,
    payment_received: stored.payment_received ?? false,
    system_error: stored.system_error ?? true,
  });

  const handleSave = async () => {
    await updateSetting("notifications", notifs);
    toast.success("Notification settings saved");
  };

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {notifItems.map((item) => (
        <div key={item.key} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
          <div>
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
          <Switch
            checked={notifs[item.key] ?? false}
            onCheckedChange={(v) => setNotifs((prev) => ({ ...prev, [item.key]: v }))}
          />
        </div>
      ))}
      <Button onClick={handleSave} className="w-fit">Save Notifications</Button>
    </div>
  );
};

export default NotificationSettings;
