import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Eye, EyeOff, Plus, Pencil, RefreshCw, Lock, CheckCircle, Clock, Mail, XCircle, Loader2, Wifi } from "lucide-react";
import { format, parseISO } from "date-fns";

interface EmailAccountRow {
  id: string;
  user_id: string;
  email_address: string;
  is_active: boolean;
  zoho_account_id: string | null;
  last_synced_at: string | null;
  app_password: string | null;
  imap_valid: boolean | null;
  imap_validated_at: string | null;
  profile?: { full_name: string; email: string } | null;
}

interface ProfileOption {
  id: string;
  full_name: string;
  email: string;
}

const EmailConfigSettings = () => {
  const { isSuperAdmin } = useAuthContext();
  const qc = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<EmailAccountRow | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);

  // Fetch all email accounts with profiles
  const { data: accounts = [], isLoading } = useQuery<EmailAccountRow[]>({
    queryKey: ["admin-email-accounts"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("email_accounts")
        .select("id, user_id, email_address, is_active, zoho_account_id, last_synced_at, app_password, imap_valid, imap_validated_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Fetch profiles for all user_ids
      const userIds = [...new Set((data ?? []).map((a: any) => a.user_id))];
      let profileMap: Record<string, ProfileOption> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await (supabase as any)
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);
        for (const p of (profiles ?? [])) profileMap[p.id] = p;
      }
      return (data ?? []).map((a: any) => ({
        ...a,
        profile: profileMap[a.user_id] ?? null,
      }));
    },
    enabled: isSuperAdmin,
  });

  // Profiles for dropdown
  const { data: profiles = [] } = useQuery<ProfileOption[]>({
    queryKey: ["all-profiles-for-email"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");
      return data ?? [];
    },
    enabled: isSuperAdmin,
  });

  if (!isSuperAdmin) return null;

  const openAdd = () => {
    setEditingAccount(null);
    setSelectedUserId("");
    setEmailAddress("");
    setAppPassword("");
    setShowPw(false);
    setModalOpen(true);
  };

  const openEdit = (acct: EmailAccountRow) => {
    setEditingAccount(acct);
    setSelectedUserId(acct.user_id);
    setEmailAddress(acct.email_address);
    setAppPassword("");
    setShowPw(false);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedUserId || !emailAddress.trim()) return;
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("save-email-password", {
        body: {
          target_user_id: selectedUserId,
          email_address: emailAddress.trim(),
          app_password: appPassword || undefined,
        },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error || data?.error) throw new Error(error?.message ?? data?.error);
      toast.success(editingAccount ? "Email account updated" : "Email account added");
      qc.invalidateQueries({ queryKey: ["admin-email-accounts"] });
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (acct: EmailAccountRow) => {
    try {
      const { error } = await (supabase as any)
        .from("email_accounts")
        .update({ is_active: !acct.is_active })
        .eq("id", acct.id);
      if (error) throw error;
      toast.success(acct.is_active ? "Account deactivated" : "Account activated");
      qc.invalidateQueries({ queryKey: ["admin-email-accounts"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleValidateConnection = async (acct: EmailAccountRow) => {
    if (!acct.app_password) {
      toast.error("No app password saved — edit the account and add one first");
      return;
    }
    setValidatingId(acct.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("validate-email-credentials", {
        body: { validate_stored: true, target_user_id: acct.user_id },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw new Error(error.message);
      if (data?.valid) {
        toast.success("IMAP connection verified successfully");
      } else {
        toast.error(`Connection failed: ${data?.error ?? "Unknown error"}`);
      }
      qc.invalidateQueries({ queryKey: ["admin-email-accounts"] });
    } catch (err: any) {
      toast.error(`Validation error: ${err.message}`);
    } finally {
      setValidatingId(null);
    }
  };

  const handleTestSync = async (acct: EmailAccountRow) => {
    setSyncingId(acct.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("sync-emails", {
        body: { target_user_id: acct.user_id },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      const count = data?.newEmailCount ?? 0;
      toast.success(count > 0 ? `${count} new email(s) synced` : "Inbox is up to date");
      qc.invalidateQueries({ queryKey: ["admin-email-accounts"] });
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    if (!editingAccount) {
      const p = profiles.find(pr => pr.id === userId);
      if (p) setEmailAddress(p.email);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Email Accounts</h3>
          <p className="text-sm text-muted-foreground">Manage Zoho Mail accounts for CRM users</p>
        </div>
        <Button onClick={openAdd} size="sm" className="gap-2">
          <Plus size={14} /> Add Email Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl">
          <Mail size={40} className="text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No email accounts configured</p>
          <Button onClick={openAdd} size="sm" variant="outline" className="gap-2">
            <Plus size={14} /> Add Email Account
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground text-xs">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Zoho</th>
                <th className="px-4 py-3 font-medium">Last Synced</th>
                <th className="px-4 py-3 font-medium">IMAP</th>
                <th className="px-4 py-3 font-medium">Validated</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {accounts.map(acct => (
                <tr key={acct.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {acct.profile?.full_name ?? "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{acct.email_address}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                      acct.is_active
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${acct.is_active ? "bg-emerald-500" : "bg-destructive"}`} />
                      {acct.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {acct.zoho_account_id ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckCircle size={12} /> Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {acct.last_synced_at ? format(parseISO(acct.last_synced_at), "d MMM yyyy, h:mm a") : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    {acct.imap_valid === true ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckCircle size={12} /> Connected
                      </span>
                    ) : acct.imap_valid === false ? (
                      <span className="inline-flex items-center gap-1 text-xs text-destructive">
                        <XCircle size={12} /> Failed
                      </span>
                    ) : acct.app_password ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <Lock size={12} /> Not tested
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">No password</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {acct.imap_validated_at
                      ? format(parseISO(acct.imap_validated_at), "d MMM, h:mm a")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(acct)} className="h-7 px-2">
                        <Pencil size={13} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleValidateConnection(acct)}
                        disabled={validatingId === acct.id || !acct.app_password}
                        title="Test IMAP connection"
                        className="h-7 px-2"
                      >
                        {validatingId === acct.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Wifi size={13} />
                        }
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleTestSync(acct)}
                        disabled={syncingId === acct.id} className="h-7 px-2">
                        <RefreshCw size={13} className={syncingId === acct.id ? "animate-spin" : ""} />
                      </Button>
                      <Switch
                        checked={acct.is_active}
                        onCheckedChange={() => handleToggleActive(acct)}
                        className="scale-75"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Edit Email Account" : "Add Email Account"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>User</Label>
              <Select value={selectedUserId} onValueChange={handleUserSelect} disabled={!!editingAccount}>
                <SelectTrigger><SelectValue placeholder="Select a user" /></SelectTrigger>
                <SelectContent>
                  {profiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name} ({p.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input value={emailAddress} onChange={e => setEmailAddress(e.target.value)} placeholder="user@domain.org" />
            </div>
            <div className="space-y-1.5">
              <Label>App Password</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={appPassword}
                  onChange={e => setAppPassword(e.target.value)}
                  placeholder={editingAccount ? "Leave blank to keep existing" : "Enter app password"}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !selectedUserId || !emailAddress.trim()}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailConfigSettings;
