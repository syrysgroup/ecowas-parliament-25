import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Plus, Download, Lock, Pencil, Trash2, Upload } from "lucide-react";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  PageHeaderV2,
  FilterBar,
  DataTable,
  EmptyStateV2,
  QuickActions,
  urlFlag,
  type Column,
  type FilterChip,
} from "../_kit";
import { StatusPill } from "@/components/shell/primitives";
import LegacyDocumentsModule, {
  AddDocumentDialog,
  EditDocumentDialog,
} from "./DocumentsModule.legacy";

interface Doc {
  id: string;
  title: string;
  category: string;
  file_type: string;
  file_size_kb: number | null;
  restricted: boolean;
  file_url: string | null;
  language: string;
  created_at: string;
  uploader_name: string | null;
}

const FILE_TYPES = ["PDF", "DOC", "XLS", "PPT", "ZIP"];
const LANGS = [
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
  { value: "pt", label: "PT" },
];

function DocumentsModuleV2() {
  const { isAdmin } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Doc | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [langFilter, setLangFilter] = useState<string | null>(null);

  const { data, isLoading } = useQuery<Doc[] | null>({
    queryKey: ["crm-documents"],
    queryFn: async () => {
      const res = await supabase
        .from("documents")
        .select("id, title, category, file_type, file_size_kb, restricted, file_url, language, created_at, uploader:profiles!documents_uploaded_by_fkey(full_name)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (res.error?.code === "42P01") return null;
      return (res.data ?? []).map((d: any) => ({
        id: d.id,
        title: d.title,
        category: d.category ?? "General",
        file_type: d.file_type ?? "PDF",
        file_size_kb: d.file_size_kb ?? null,
        restricted: d.restricted ?? false,
        file_url: d.file_url ?? null,
        language: d.language ?? "en",
        created_at: d.created_at,
        uploader_name: d.uploader?.full_name ?? null,
      }));
    },
  });

  const deleteDoc = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("documents").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-documents"] });
      toast({ title: "Document deleted" });
    },
  });

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (data ?? []).filter((d) => {
      if (typeFilter && d.file_type !== typeFilter) return false;
      if (langFilter && d.language !== langFilter) return false;
      if (s && !d.title.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [data, search, typeFilter, langFilter]);

  if (!isLoading && data === null) {
    return (
      <EmptyStateV2
        icon={FolderOpen}
        title="Documents table not set up"
        description="The documents table needs to be created in Supabase."
      />
    );
  }

  const filters: FilterChip[] = [
    ...FILE_TYPES.map((t) => ({
      key: t,
      label: t,
      active: typeFilter === t,
      onClick: () => setTypeFilter((c) => (c === t ? null : t)),
      onClear: () => setTypeFilter(null),
    })),
    ...LANGS.map((l) => ({
      key: `lang-${l.value}`,
      label: l.label,
      active: langFilter === l.value,
      onClick: () => setLangFilter((c) => (c === l.value ? null : l.value)),
      onClear: () => setLangFilter(null),
    })),
  ];

  const columns: Column<Doc>[] = [
    {
      key: "title",
      header: "Name",
      render: (d) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-md bg-[hsl(var(--surface-3))] flex items-center justify-center text-[10px] font-bold text-[hsl(var(--text-2))] flex-shrink-0">
            {d.file_type}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-medium text-[hsl(var(--text-1))] truncate">{d.title}</span>
              {d.restricted && (
                <Lock className="h-3 w-3 text-[hsl(var(--brand-yellow))] flex-shrink-0" />
              )}
            </div>
            <span className="text-[11px] text-[hsl(var(--text-3))]">{d.category}</span>
          </div>
        </div>
      ),
    },
    { key: "language", header: "Lang", width: "70px", render: (d) => <StatusPill>{d.language.toUpperCase()}</StatusPill> },
    {
      key: "file_size_kb",
      header: "Size",
      width: "90px",
      render: (d) =>
        d.file_size_kb
          ? d.file_size_kb >= 1024
            ? `${(d.file_size_kb / 1024).toFixed(1)} MB`
            : `${d.file_size_kb} KB`
          : "—",
    },
    {
      key: "uploader_name",
      header: "Owner",
      width: "160px",
      render: (d) => <span className="text-[12px] text-[hsl(var(--text-2))]">{d.uploader_name ?? "—"}</span>,
    },
    {
      key: "created_at",
      header: "Modified",
      width: "120px",
      render: (d) => (
        <span className="text-[12px] text-[hsl(var(--text-3))]">
          {format(parseISO(d.created_at), "d MMM yyyy")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeaderV2
        icon={FolderOpen}
        title="Documents"
        description="Shared files, MoU templates, budget documents, reports"
        meta={
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[hsl(var(--surface-3))] text-[hsl(var(--text-3))]">
            {filtered.length}
          </span>
        }
        actions={
          isAdmin && (
            <Button
              size="sm"
              onClick={() => setAddOpen(true)}
              className="bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green)/0.85)] text-white text-xs gap-1.5 h-8"
            >
              <Upload className="h-3.5 w-3.5" /> Upload
            </Button>
          )
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search documents…"
        filters={filters}
      />

      <DataTable<Doc>
        columns={columns}
        rows={filtered}
        rowKey={(d) => d.id}
        loading={isLoading}
        empty={
          <EmptyStateV2
            icon={FolderOpen}
            title="No documents"
            description={isAdmin ? "Upload your first document." : "Documents will appear once uploaded."}
            primaryAction={
              isAdmin && (
                <Button
                  size="sm"
                  onClick={() => setAddOpen(true)}
                  className="bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green)/0.85)] text-white text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Upload Document
                </Button>
              )
            }
          />
        }
        rowActions={(d) => (
          <QuickActions
            items={[
              ...(d.file_url
                ? [{
                    key: "dl",
                    icon: Download,
                    label: "Download",
                    onClick: () => window.open(d.file_url!, "_blank", "noopener"),
                  }]
                : []),
              ...(isAdmin
                ? [
                    { key: "edit", icon: Pencil, label: "Edit", onClick: () => setEditTarget(d) },
                    {
                      key: "del",
                      icon: Trash2,
                      label: "Delete",
                      onClick: () => {
                        if (confirm(`Delete "${d.title}"?`)) deleteDoc.mutate(d.id);
                      },
                    },
                  ]
                : []),
            ]}
          />
        )}
      />

      <AddDocumentDialog open={addOpen} onClose={() => setAddOpen(false)} />
      {editTarget && (
        <EditDocumentDialog doc={editTarget} open={!!editTarget} onClose={() => setEditTarget(null)} />
      )}
    </div>
  );
}

export default function DocumentsModule() {
  if (urlFlag("v2")) return <DocumentsModuleV2 />;
  return <LegacyDocumentsModule />;
}
