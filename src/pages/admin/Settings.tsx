import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Palette, Users, Mail, Bell, Lock, FileText } from "lucide-react";
import BrandingSettings from "@/views/admin/settings/BrandingSettings";
import UserManagementSettings from "@/views/admin/settings/UserManagementSettings";
import ThemeAppearanceSettings from "@/views/admin/settings/ThemeAppearanceSettings";
import EmailConfigSettings from "@/views/admin/settings/EmailConfigSettings";
import NotificationSettings from "@/views/admin/settings/NotificationSettings";
import PermissionsSettings from "@/views/admin/settings/PermissionsSettings";
import AuditLogSettings from "@/views/admin/settings/AuditLogSettings";

const tabs = [
  { value: "branding", label: "Branding", icon: Palette, component: BrandingSettings },
  { value: "users", label: "Users", icon: Users, component: UserManagementSettings },
  { value: "appearance", label: "Appearance", icon: Shield, component: ThemeAppearanceSettings },
  { value: "email", label: "Email", icon: Mail, component: EmailConfigSettings },
  { value: "notifications", label: "Notifications", icon: Bell, component: NotificationSettings },
  { value: "permissions", label: "Permissions", icon: Lock, component: PermissionsSettings },
  { value: "audit", label: "Audit Log", icon: FileText, component: AuditLogSettings },
];

const AdminSettings = () => (
  <div className="container py-8 max-w-5xl">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Shield size={22} className="text-primary" />
        Super Admin Settings
      </h1>
      <p className="text-sm text-muted-foreground">Manage global configuration, users, and system behaviour.</p>
    </div>
    <Tabs defaultValue="branding">
      <TabsList className="flex-wrap h-auto gap-1 mb-6 bg-muted/40 p-1">
        {tabs.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className="gap-1.5 text-xs">
            <Icon size={13} />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(({ value, component: Component }) => (
        <TabsContent key={value} value={value}>
          <Component />
        </TabsContent>
      ))}
    </Tabs>
  </div>
);

export default AdminSettings;
