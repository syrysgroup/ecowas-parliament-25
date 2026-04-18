import { useState, useEffect, useRef } from "react";
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

export interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (result: InviteUserResult) => void;
  title?: string;
  showNameField?: boolean;
}

export function InviteUserModal({
  open,
  onClose,
  onSuccess,
  title = "Invite User",
  showNameField = false,
}: InviteUserModalProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setEmail("");
      setName("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);

    try {
      const result = await inviteUser({
        email: email.trim(),
        // No role sent — edge function defaults to "staff"
        metadata: name.trim() ? { full_name: name.trim() } : undefined,
      });

      toast({
        title: "Invitation sent",
        description: `${email.trim()} will receive a link to set their password.`,
      });

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
          <DialogTitle className="text-sm font-semibold text-crm-text">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Enter an email address to send an invitation. The user will be
            assigned the Staff role and can be promoted later.
          </DialogDescription>
        </DialogHeader>

        <div className="py-1">
          <InviteForm
            email={email}
            name={name}
            onEmailChange={setEmail}
            onNameChange={setName}
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