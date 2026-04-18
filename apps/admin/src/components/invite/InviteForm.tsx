import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { AppRole } from "@/contexts/AuthContext";

const INVITABLE_ROLES: { value: AppRole; label: string }[] = [
  { value: "staff",                  label: "Staff" },
  { value: "admin",                  label: "Admin" },
  { value: "moderator",              label: "Moderator" },
  { value: "project_director",       label: "Project Director" },
  { value: "programme_lead",         label: "Programme Lead" },
  { value: "website_editor",         label: "Website Editor" },
  { value: "marketing_manager",      label: "Marketing Manager" },
  { value: "communications_officer", label: "Communications Officer" },
  { value: "finance_coordinator",    label: "Finance Coordinator" },
  { value: "logistics_coordinator",  label: "Logistics Coordinator" },
  { value: "sponsor_manager",        label: "Sponsor Manager" },
  { value: "sponsor",                label: "Sponsor" },
  { value: "consultant",             label: "Consultant" },
  { value: "budget_officer",         label: "Budget Officer" },
];

export interface InviteFormProps {
  email: string;
  name?: string;
  role?: AppRole;
  onEmailChange: (v: string) => void;
  onNameChange?: (v: string) => void;
  onRoleChange?: (r: AppRole) => void;
  onSubmit: () => void;
  loading: boolean;
  submitLabel?: string;
  disabled?: boolean;
  showNameField?: boolean;
}

export function InviteForm({
  email,
  name = "",
  role = "staff",
  onEmailChange,
  onNameChange,
  onRoleChange,
  onSubmit,
  loading,
  submitLabel = "Send Invite",
  disabled = false,
  showNameField = false,
}: InviteFormProps) {
  const isDisabled = loading || disabled || !email.trim();

  return (
    <form
      onSubmit={e => { e.preventDefault(); onSubmit(); }}
      className="space-y-3"
    >
      <div className="space-y-1">
        <Label className="text-[11px] text-crm-text-dim">Email *</Label>
        <Input
          type="email"
          value={email}
          onChange={e => onEmailChange(e.target.value)}
          placeholder="user@organisation.com"
          className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
          autoComplete="off"
        />
      </div>

      {showNameField && (
        <div className="space-y-1">
          <Label className="text-[11px] text-crm-text-dim">Name (optional)</Label>
          <Input
            value={name}
            onChange={e => onNameChange?.(e.target.value)}
            placeholder="Full name"
            className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
          />
        </div>
      )}

      <div className="space-y-1">
        <Label className="text-[11px] text-crm-text-dim">Role</Label>
        <select
          value={role}
          onChange={e => onRoleChange?.(e.target.value as AppRole)}
          className="w-full h-8 rounded-md border border-crm-border bg-crm-surface px-2 text-xs text-crm-text focus:outline-none focus:ring-1 focus:ring-emerald-700"
        >
          {INVITABLE_ROLES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <p className="text-[10px] text-crm-text-faint">
          Role can be changed later in User Management.
        </p>
      </div>

      <Button
        type="submit"
        size="sm"
        disabled={isDisabled}
        className="w-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs"
      >
        {loading && <Loader2 size={12} className="animate-spin mr-1.5" />}
        {submitLabel}
      </Button>
    </form>
  );
}
