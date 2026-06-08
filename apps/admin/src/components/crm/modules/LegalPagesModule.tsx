import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Loader2, ExternalLink, Save, History, Bold, Italic, UnderlineIcon, List, ListOrdered, Heading2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Version {
  id: string;
  page_key: string;
  html: string;
  title: string | null;
  version: number;
  is_published: boolean;
  edited_by: string | null;
  created_at: string;
}

const PAGES = [
  { key: "privacy", label: "Privacy Policy", path: "/privacy" },
  { key: "terms",   label: "Terms of Use",   path: "/terms"   },
  { key: "cookies", label: "Cookie Policy",  path: "/cookies" },
];

function Toolbar({ editor }: { editor: any }) {
  if (!editor) return null;
  const btn = "h-7 w-7 inline-flex items-center justify-center rounded text-crm-text-dim hover:text-emerald-400 hover:bg-crm-surface";
  const active = "text-emerald-400 bg-crm-surface";
  return (
    <div className="flex items-center gap-1 border-b border-crm-border pb-2 mb-2">
      <button className={`${btn} ${editor.isActive("bold") ? active : ""}`} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={13} /></button>
      <button className={`${btn} ${editor.isActive("italic") ? active : ""}`} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={13} /></button>
      <button className={`${btn} ${editor.isActive("underline") ? active : ""}`} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={13} /></button>
      <button className={`${btn} ${editor.isActive("heading", { level: 2 }) ? active : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={13} /></button>
      <button className={`${btn} ${editor.isActive("bulletList") ? active : ""}`} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={13} /></button>
      <button className={`${btn} ${editor.isActive("orderedList") ? active : ""}`} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={13} /></button>
    </div>
  );
}

function PageEditor({ pageKey }: { pageKey: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: versions = [], isLoading } = useQuery<Version[]>({
    queryKey: ["legal-versions", pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_page_versions")
        .select("*")
        .eq("page_key", pageKey)
        .order("version", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const latest = versions[0];
  const [title, setTitle] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: "",
    editorProps: { attributes: { class: "prose prose-sm prose-invert max-w-none min-h-[300px] focus:outline-none text-crm-text" } },
  });

  useEffect(() => {
    if (latest && editor) {
      editor.commands.setContent(latest.html || "");
      setTitle(latest.title ?? PAGES.find(p => p.key === pageKey)?.label ?? "");
      setIsPublished(latest.is_published);
    } else if (editor && !latest) {
      editor.commands.setContent("");
      setTitle(PAGES.find(p => p.key === pageKey)?.label ?? "");
      setIsPublished(false);
    }
  }, [latest?.id, pageKey, editor]);

  const save = useMutation({
    mutationFn: async () => {
      const html = editor?.getHTML() ?? "";
      const nextVersion = (latest?.version ?? 0) + 1;
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("legal_page_versions").insert({
        page_key: pageKey, html, title, version: nextVersion, is_published: isPublished, edited_by: user?.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["legal-versions", pageKey] });
      toast({ title: "New version saved" });
    },
    onError: (e: any) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const publishVersion = useMutation({
    mutationFn: async (versionId: string) => {
      await supabase.from("legal_page_versions").update({ is_published: false }).eq("page_key", pageKey);
      const { error } = await supabase.from("legal_page_versions").update({ is_published: true }).eq("id", versionId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["legal-versions", pageKey] });
      toast({ title: "Version published" });
    },
  });

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin mx-auto" />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="md:col-span-2">
          <Label className="text-[11px] text-crm-text-dim">Page title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)}
            className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 mt-1" />
        </div>
        <label className="flex items-center gap-2">
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          <span className="text-xs text-crm-text">Publish this version</span>
        </label>
      </div>

      <div className="bg-crm-card border border-crm-border rounded-xl p-3">
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1">
          <Save size={12} /> {save.isPending ? "Saving…" : "Save new version"}
        </Button>
        <a href={`/${pageKey}`} target="_blank" rel="noreferrer"
          className="flex items-center gap-1 text-[11px] text-crm-text-dim hover:text-emerald-400">
          <ExternalLink size={11} /> Preview public page
        </a>
      </div>

      {versions.length > 1 && (
        <div className="mt-6">
          <p className="text-[11px] text-crm-text-dim font-semibold uppercase tracking-wider mb-2 flex items-center gap-1"><History size={11} /> Version history</p>
          <div className="space-y-1.5">
            {versions.map(v => (
              <div key={v.id} className="flex items-center justify-between bg-crm-card border border-crm-border rounded-lg px-3 py-2">
                <div className="text-xs">
                  <span className="font-mono text-crm-text-dim">v{v.version}</span>
                  <span className="ml-2 text-crm-text">{v.title || "(no title)"}</span>
                  {v.is_published && <Badge className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-400 border-0">Live</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-crm-text-dim">{new Date(v.created_at).toLocaleString()}</span>
                  {!v.is_published && (
                    <Button size="sm" variant="ghost" className="text-[10px] h-6 text-emerald-400"
                      onClick={() => publishVersion.mutate(v.id)}>Publish</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const PAGE_SIZE = 25;

function ConsentLogTab() {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["cookie-consent-log", page],
    queryFn: async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error, count } = await supabase
        .from("cookie_consent_log")
        .select("id, choice, user_agent, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { rows: data ?? [], total: count ?? 0 };
    },
  });

  const { data: summary } = useQuery({
    queryKey: ["cookie-consent-summary"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("cookie_consent_log")
        .select("choice")
        .gte("created_at", since);
      const rows = data ?? [];
      return {
        accepted: rows.filter(r => r.choice === "accepted").length,
        declined: rows.filter(r => r.choice === "declined").length,
      };
    },
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {summary && (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-crm-text-dim">Last 30 days:</span>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-0">{summary.accepted} accepted</Badge>
          <Badge className="bg-red-500/20 text-red-400 border-0">{summary.declined} declined</Badge>
        </div>
      )}

      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
      ) : (
        <div className="space-y-1">
          {(data?.rows ?? []).length === 0 && (
            <p className="text-xs text-crm-text-muted text-center py-8">No consent events recorded yet.</p>
          )}
          {(data?.rows ?? []).map(r => (
            <div key={r.id} className="flex items-center gap-3 bg-crm-card border border-crm-border rounded-lg px-3 py-2">
              <Badge className={`text-[10px] border-0 flex-shrink-0 ${r.choice === "accepted" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                {r.choice}
              </Badge>
              <span className="text-[10px] font-mono text-crm-text-dim flex-shrink-0">
                {new Date(r.created_at).toLocaleString()}
              </span>
              <span className="text-[10px] text-crm-text-dim truncate min-w-0">
                {r.user_agent ?? "—"}
              </span>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-crm-text-dim pt-1">
          <span>Page {page + 1} of {totalPages} · {data?.total} total</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={13} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LegalPagesModule() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-crm-text">Legal Pages</h2>
        <p className="text-[12px] text-crm-text-muted mt-0.5">Rich-text editor for Privacy, Terms, and Cookie pages. Each save creates a new version; only the published version is shown on the public site.</p>
      </div>
      <Tabs defaultValue="privacy">
        <TabsList className="bg-crm-surface border border-crm-border h-8">
          {PAGES.map(p => <TabsTrigger key={p.key} value={p.key} className="text-xs h-7">{p.label}</TabsTrigger>)}
          <TabsTrigger value="consent-log" className="text-xs h-7">Consent Log</TabsTrigger>
        </TabsList>
        {PAGES.map(p => (
          <TabsContent key={p.key} value={p.key} className="mt-4"><PageEditor pageKey={p.key} /></TabsContent>
        ))}
        <TabsContent value="consent-log" className="mt-4"><ConsentLogTab /></TabsContent>
      </Tabs>
    </div>
  );
}
