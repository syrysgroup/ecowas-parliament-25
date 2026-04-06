import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { toast } from "sonner";

const ThemeAppearanceSettings = () => {
  const { settings, updateSetting } = useGlobalSettings();
  const [theme, setTheme] = useState((settings.default_theme as string) ?? "light");
  const [sidebar, setSidebar] = useState((settings.default_sidebar as string) ?? "expanded");
  const [layout, setLayout] = useState((settings.default_layout as string) ?? "vertical");

  const handleSave = async () => {
    await updateSetting("default_theme", theme);
    await updateSetting("default_sidebar", sidebar);
    await updateSetting("default_layout", layout);
    toast.success("Theme settings saved");
  };

  return (
    <div className="flex flex-col gap-5 max-w-md">
      <div className="space-y-1.5">
        <Label>Default Theme</Label>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Applied to new user sessions.</p>
      </div>

      <div className="space-y-1.5">
        <Label>Default Sidebar Mode</Label>
        <Select value={sidebar} onValueChange={setSidebar}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="expanded">Expanded</SelectItem>
            <SelectItem value="collapsed">Collapsed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Default Layout</Label>
        <Select value={layout} onValueChange={setLayout}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="vertical">Vertical</SelectItem>
            <SelectItem value="horizontal">Horizontal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSave} className="w-fit">Save Appearance</Button>
    </div>
  );
};

export default ThemeAppearanceSettings;
