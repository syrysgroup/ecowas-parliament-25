import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export interface InviteFormProps {
  email: string;
  name?: string;
  onEmailChange: (v: string) => void;
  onNameChange?: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  submitLabel?: string;
  disabled?: boolean;
  showNameField?: boolean;
}

export function InviteForm({
  email,
  name = "",
  onEmailChange,
  onNameChange,
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

      {/* Role is intentionally hidden — new users get "staff" by default.
          Admins can promote them later in User Management. */}
      <p className="text-[10px] text-crm-text-faint">
        The user will receive an invite email and be assigned the{" "}
        <span className="text-crm-text-muted font-medium">Staff</span> role.
        An admin can change their role after they join.
      </p>

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