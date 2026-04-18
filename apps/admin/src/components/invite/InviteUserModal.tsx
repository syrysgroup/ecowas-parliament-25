import { useState, useEffect, useRef } from "react";
import type { AppRole } from "@/contexts/AuthContext";
import { inviteUser, type InviteUserResult } from "@/services/inviteUser";
import { InviteForm } from "./InviteForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const SUPER_ADMIN_ASSIGNABLE_ROLES: AppRole[] = [
  "super_admin", "admin", "moderator", "project_director", "programme_lead",
  "website_editor", "marketing_manager", "communications_officer",
  "finance_coordinator", "budget_officer", "logistics_coordinator", "sponsor_manager",
  "consultant", "staff", "sponsor", "media",
];

export interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (result: InviteUserResult) => void;
  title?: string;
  fixedRole?: AppRole;
  assignableRoles?: AppRole[];
  defaultRole?: AppRole;
  showNameField?: boolean;
}

export function InviteUserModal({
  open,
  onClose,
  onSuccess,
  title = "Invite User",
  fixedRole,
  assignableRoles = SUPER_ADMIN_ASSIGNABLE_ROLES,
  defaultRole,
  showNameField = false,
}: InviteUserModalProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>(
    fixedRole ?? defaultRole ?? assignableRoles[0] ?? "admin"
  );
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  // Reset form when the modal opens
  useEffect(() => {
    if (open) {
      setEmail("");
      setRole(fixedRole ?? defaultRole ?? assignableRoles[0] ?? "admin");
      setName("");
    }
  }, [open, fixedRole, defaultRole, assignableRoles]);

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      const result = await inviteUser({
        email: email.trim(),
        role: fixedRole ?? role,
        metadata: name.trim() ? { full_name: name.trim() } : undefined,
      });
      toast({ title: "Invitation sent", description: email.trim() });
      onSuccess?.(result);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send invitation";
      toast({ title: "Failed", description: msg, variant: "destructive" });
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">{title}</DialogTitle>
          {/* ✅ DialogDescription is required by Radix UI for accessibility.
              sr-only keeps it invisible in the UI while satisfying the a11y contract. */}
          <DialogDescription className="sr-only">
            Enter an email address and assign a role to send an invitation.
          </DialogDescription>
        </DialogHeader>

        <div className="py-1">
          <InviteForm
            email={email}
            role={role}
            name={name}
            onEmailChange={setEmail}
            onRoleChange={setRole}
            onNameChange={setName}
            assignableRoles={assignableRoles}
            fixedRole={fixedRole}
            onSubmit={handleSubmit}
            loading={loading}
            showNameField={showNameField}
            submitLabel="Send Invite"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="border-crm-border text-crm-text-muted text-xs"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}