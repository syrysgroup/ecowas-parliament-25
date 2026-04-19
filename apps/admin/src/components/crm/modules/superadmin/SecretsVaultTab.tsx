import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  KeyRound, CheckCircle2, XCircle, Loader2, Eye, EyeOff,
  Trash2, Zap, ShieldCheck, MessageSquare, Share2,
} from "lucide-react";

// ─── Service definitions ──────────────────────────────────────────────────────
interface ServiceDef {
  key: string;
  label: string;
  description: string;
  group: "ai" | "messaging" | "social";
  testable: boolean;
}

const SERVICES: ServiceDef[] = [
  // AI
  { key: "ANTHROPIC_API_KEY",        label: "Claude AI (Anthropic)",         group: "ai",        testable: true,  description: "Parliament transcript summarization & EN/FR/PT translations" },
  { key: "OPENAI_API_KEY",           label: "OpenAI (GPT-4o fallback)",      group: "ai",        testable: false, description: "Optional fallback for OCR-heavy transcript processing" },
  // Messaging
  { key: "WHATSAPP_ACCESS_TOKEN",    label: "WhatsApp Cloud API Token",      group: "messaging", testable: true,  description: "Meta WhatsApp Cloud API — broadcast session summaries to subscribers" },
  { key: "WHATSAPP_PHONE_NUMBER_ID", label: "WhatsApp Phone Number ID",      group: "messaging", testable: false, description: "Phone Number ID linked to your WhatsApp Business account" },
  { key: "TELEGRAM_BOT_TOKEN",       label: "Telegram Bot Token",            group: "messaging", testable: true,  description: "Post to EN/FR/PT channels on parliament content publish" },
  { key: "TELEGRAM_CHANNEL_EN",      label: "Telegram Channel EN",           group: "messaging", testable: false, description: "Channel ID for English channel (e.g. @ecowasparliament_en)" },
  { key: "TELEGRAM_CHANNEL_FR",      label: "Telegram Channel FR",           group: "messaging", testable: false, description: "Channel ID for French channel" },
  { key: "TELEGRAM_CHANNEL_PT",      label: "Telegram Channel PT",           group: "messaging", testable: false, description: "Channel ID for Portuguese channel" },
  // Social
  { key: "X_API_KEY",                label: "X (Twitter) API Key",           group: "social",    testable: false, description: "X API v2 — auto-post on parliament content publish" },
  { key: "X_API_SECRET",             label: "X (Twitter) API Secret",        group: "social",    testable: false, description: "X API v2 secret key" },
  { key: "X_ACCESS_TOKEN",           label: "X Access Token",                group: "social",    testable: true,  description: "OAuth 1.0a access token — posting on behalf of @ecowasparliament" },
  { key: "X_ACCESS_SECRET",          label: "X Access Token Secret",         group: "social",    testable: false, description: "OAuth 1.0a access token secret" },
  { key: "INSTAGRAM_ACCESS_TOKEN",   label: "Instagram Graph Token",         group: "social",    testable: true,  description: "Instagram Graph API — auto-post caption + image" },
  { key: "INSTAGRAM_PAGE_ID",        label: "Instagram Page ID",             group: "social",    testable: false, description: "Facebook Page ID linked to your Instagram Business account" },
  { key: "YOUTUBE_API_KEY",          label: "YouTube Data API v3",           group: "social",    testable: true,  description: "Session recording upload automation (Phase 4)" },
];

const GROUP_META = {
  ai:        { label: "AI Services",        icon: Zap,            color: "text-amber-400",  border: "border-amber-800/40",  bg: "bg-amber-950/20" },
  messaging: { label: "Messaging Services", icon: MessageSquare,  color: "text-emerald-400", border: "border-emerald-800/40", bg: "bg-emerald-950/20" },
  social:    { label: "Social Media APIs",  icon: Share2,         color: "text-blue-400",   border: "border-blue-800/40",   bg: "bg-blue-950/20" },
};

// ─── Status row data ──────────────────────────────────────────────────────────
interface SecretStatus {
  service_key: string;
  is_set: boolean;
  last_four: string | null;
  updated_at: string | null;
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────
function DeleteConfirmModal({
  serviceKey, onConfirm, onCancel, loading,
}: { serviceKey: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  const [input, setInput] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-crm-card border border-red-900 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center flex-shrink-0">
            <Trash2 size={15} className="text-red-400" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-crm-text">Delete Secret</p>
            <p className="text-[11px] text-crm-text-muted font-mono">{serviceKey}</p>
          </div>
        </div>
        <p className="text-[12px] text-crm-text-muted">
          This will permanently wipe the key from the database. Any edge functions that rely on it will fail until a new key is set.
        </p>
        <div className="space-y-1.5">
          <p className="text-[11px] text-crm-text-muted">Type <span className="text-red-400 font-mono font-semibold">DELETE</span> to confirm:</p>
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="DELETE"
            className="font-mono text-[12px] border-crm-border bg-crm-surface"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}
            className="text-crm-text-muted hover:text-crm-text text-[11px]">
            Cancel
          </Button>
          <Button size="sm" onClick={onConfirm}
            disabled={input !== "DELETE" || loading}
            className="bg-red-900 hover:bg-red-800 text-red-100 border border-red-700 text-[11px]">
            {loading ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
            Delete Key
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Single secret row ────────────────────────────────────────────────────────
function SecretRow({ svc, status }: { svc: ServiceDef; status?: SecretStatus }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latency_ms?: number; error?: string; note?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isSet = status?.is_set ?? false;

  async function handleSave() {
    if (!inputVal.trim()) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("set-secret", {
      body: { service_key: svc.key, value: inputVal.trim() },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    setSaving(false);
    if (res.error || res.data?.error) {
      toast({ title: "Failed to save", description: res.data?.error ?? res.error?.message, variant: "destructive" });
    } else {
      toast({ title: "Key saved", description: `${svc.label} updated — last 4: ••••${res.data.last_four}` });
      setEditing(false);
      setInputVal("");
      qc.invalidateQueries({ queryKey: ["integration-secrets-status"] });
      setTestResult(null);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("test-secret", {
      body: { service_key: svc.key },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    setTesting(false);
    if (res.error) {
      setTestResult({ success: false, error: res.error.message });
    } else {
      setTestResult(res.data);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("delete-secret", {
      body: { service_key: svc.key },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    setDeleting(false);
    setShowDeleteModal(false);
    if (res.error || res.data?.error) {
      toast({ title: "Failed to delete", description: res.data?.error ?? res.error?.message, variant: "destructive" });
    } else {
      toast({ title: "Key deleted", description: `${svc.label} has been removed` });
      qc.invalidateQueries({ queryKey: ["integration-secrets-status"] });
      setTestResult(null);
    }
  }

  return (
    <>
      {showDeleteModal && (
        <DeleteConfirmModal
          serviceKey={svc.key}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleting}
        />
      )}

      <div className="bg-crm-surface border border-crm-border rounded-lg p-4 space-y-3">
        {/* Top row: info + status */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-crm-text font-mono">{svc.key}</p>
            <p className="text-[11px] text-crm-text-muted mt-0.5 leading-relaxed">{svc.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isSet ? (
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-1 rounded-md">
                <CheckCircle2 size={10} />
                ••••{status?.last_four ?? "????"}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-red-400 bg-red-950 border border-red-800 px-2 py-1 rounded-md">
                <XCircle size={10} />
                Not set
              </span>
            )}
          </div>
        </div>

        {/* Inline input when editing */}
        {editing && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showInput ? "text" : "password"}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setEditing(false); setInputVal(""); }}}
                placeholder="Paste key here..."
                autoFocus
                className="font-mono text-[12px] border-amber-800/60 bg-crm-card pr-9"
              />
              <button
                type="button"
                onClick={() => setShowInput(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-crm-text-faint hover:text-crm-text-muted transition-colors"
              >
                {showInput ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <Button size="sm" onClick={handleSave} disabled={!inputVal.trim() || saving}
              className="bg-amber-900 hover:bg-amber-800 text-amber-100 border border-amber-700 text-[11px] px-3">
              {saving ? <Loader2 size={12} className="animate-spin" /> : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setInputVal(""); }}
              className="text-crm-text-muted text-[11px] px-2">
              Cancel
            </Button>
          </div>
        )}

        {/* Test result */}
        {testResult && (
          <div className={`flex items-center gap-2 text-[11px] px-3 py-2 rounded-md border ${
            testResult.success
              ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
              : "bg-red-950/40 border-red-800/50 text-red-300"
          }`}>
            {testResult.success
              ? <CheckCircle2 size={12} />
              : <XCircle size={12} />}
            <span>
              {testResult.success
                ? testResult.note ?? `Connected — ${testResult.latency_ms}ms`
                : `Failed: ${testResult.error}`}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setEditing(true); setInputVal(""); setTestResult(null); }}
            className="text-[10px] font-mono px-3 py-1.5 rounded-md border border-amber-800/60 text-amber-400 bg-amber-950/20 hover:bg-amber-950/40 transition-colors"
          >
            {isSet ? "Replace Key" : "Set Key"}
          </button>
          {svc.testable && isSet && (
            <button
              onClick={handleTest}
              disabled={testing}
              className="text-[10px] font-mono px-3 py-1.5 rounded-md border border-blue-800/60 text-blue-400 bg-blue-950/20 hover:bg-blue-950/40 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {testing ? <Loader2 size={10} className="animate-spin" /> : null}
              Test Connection
            </button>
          )}
          {isSet && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-[10px] font-mono px-3 py-1.5 rounded-md border border-red-800/60 text-red-400 bg-red-950/20 hover:bg-red-950/40 transition-colors ml-auto"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main tab component ───────────────────────────────────────────────────────
export default function SecretsVaultTab({ userId }: { userId?: string }) {
  const { data: statuses = [] } = useQuery<SecretStatus[]>({
    queryKey: ["integration-secrets-status"],
    queryFn: async () => {
      const { data } = await supabase
        .from("integration_secrets_status" as any)
        .select("service_key, is_set, last_four, updated_at");
      return (data ?? []) as SecretStatus[];
    },
    staleTime: 10_000,
  });

  const statusMap = Object.fromEntries(statuses.map(s => [s.service_key, s]));
  const groups: Array<"ai" | "messaging" | "social"> = ["ai", "messaging", "social"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-bold text-crm-text">Integration Secrets Vault</h3>
            <p className="text-[12px] text-crm-text-muted mt-1 leading-relaxed max-w-xl">
              Manage all third-party API credentials from here. Keys are stored encrypted and only read server-side by Edge Functions — they are never exposed to the browser.
            </p>
            <div className="flex gap-2 flex-wrap mt-3">
              <span className="text-[9px] font-mono px-2 py-1 rounded border border-red-800/60 text-red-400 bg-red-950/20">super_admin only</span>
              <span className="text-[9px] font-mono px-2 py-1 rounded border border-amber-800/60 text-amber-400 bg-amber-950/20">AES-256-GCM encrypted</span>
              <span className="text-[9px] font-mono px-2 py-1 rounded border border-emerald-800/60 text-emerald-400 bg-emerald-950/20">never browser-exposed</span>
              <span className="text-[9px] font-mono px-2 py-1 rounded border border-blue-800/60 text-blue-400 bg-blue-950/20">audit logged</span>
            </div>
          </div>
        </div>
      </div>

      {/* Setup note if ANTHROPIC_API_KEY not set */}
      {!statusMap["ANTHROPIC_API_KEY"]?.is_set && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-950/20 border border-amber-800/40">
          <KeyRound size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-300">
            <strong>Start here:</strong> Set the <span className="font-mono text-amber-400">ANTHROPIC_API_KEY</span> first — it enables the AI engine for parliament transcript processing. All other keys are needed for Phase 2 onward.
          </p>
        </div>
      )}

      {/* Service groups */}
      {groups.map(group => {
        const meta = GROUP_META[group];
        const Icon = meta.icon;
        const groupServices = SERVICES.filter(s => s.group === group);
        const setCount = groupServices.filter(s => statusMap[s.key]?.is_set).length;

        return (
          <div key={group} className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg border ${meta.border} ${meta.bg} flex items-center justify-center`}>
                <Icon size={13} className={meta.color} />
              </div>
              <span className={`text-[11px] font-mono font-semibold uppercase tracking-widest ${meta.color}`}>
                {meta.label}
              </span>
              <span className="text-[10px] font-mono text-crm-text-faint">
                {setCount}/{groupServices.length} set
              </span>
            </div>
            <div className="space-y-2 pl-0">
              {groupServices.map(svc => (
                <SecretRow key={svc.key} svc={svc} status={statusMap[svc.key]} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Footer note */}
      <p className="text-[11px] text-crm-text-faint text-center pb-2">
        Keys are never shown in plain text after saving. Only the last 4 characters are displayed. To rotate a key, click "Replace Key".
      </p>
    </div>
  );
}
