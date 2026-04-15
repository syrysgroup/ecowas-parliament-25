import type { AppRole } from "@/contexts/AuthContext";
import { CRM_ROLE_META } from "@/components/crm/crmRoles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export interface InviteFormProps {
  // Controlled field values
  email: string;
  role: AppRole;
  name?: string;

  // Change handlers
  onEmailChange: (v: string) => void;
  onRoleChange: (v: AppRole) => void;
  onNameChange?: (v: string) => void;

  // Role options
  assignableRoles: AppRole[];
  fixedRole?: AppRole; // when set, hides the role selector and shows a read-only label

  // Submission
  onSubmit: () => void;
  loading: boolean;
  submitLabel?: string; // defaults to "Send Invite"
  disabled?: boolean;

  // Layout
  showNameField?: boolean; // defaults to false
}

export function InviteForm({
  email,
  role,
  name = "",
  onEmailChange,
  onRoleChange,
  onNameChange,
  assignableRoles,
  fixedRole,
  onSubmit,
  loading,
  submitLabel = "Send Invite",
  disabled = false,
  showNameField = false,
}: InviteFormProps) {
  const isSubmitDisabled = loading || disabled || !email.trim();

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
            placeholder="Full name or organisation"
            className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
          />
        </div>
      )}

      {fixedRole ? (
        <div className="space-y-1">
          <Label className="text-[11px] text-crm-text-dim">Role</Label>
          <p className="text-xs text-crm-text px-3 py-1.5 bg-crm-surface border border-crm-border rounded-md">
            {CRM_ROLE_META[fixedRole]?.label ?? fixedRole}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <Label className="text-[11px] text-crm-text-dim">Role</Label>
          <Select value={role} onValueChange={v => onRoleChange(v as AppRole)}>
            <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-crm-card border-crm-border text-crm-text">
              {assignableRoles.map(r => (
                <SelectItem key={r} value={r} className="text-xs">
                  {CRM_ROLE_META[r]?.label ?? r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button
        type="submit"
        size="sm"
        disabled={isSubmitDisabled}
        className="w-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs"
      >
        {loading && <Loader2 size={12} className="animate-spin mr-1.5" />}
        {submitLabel}
      </Button>
    </form>
  );
}
