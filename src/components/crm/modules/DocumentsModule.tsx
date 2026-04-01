import { useQuery } from "@tanstack/react-query";
import { FolderOpen, FileText, Lock, Download, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";

interface Doc {
  id: string;
  title: string;
  category: string;
  file_type: string;
  file_size_kb: number | null;
  restricted: boolean;
  created_at: string;
  uploader_name: string | null;
}

const TYPE_STYLE: Record<string, string> = {
  PDF: "bg-red-950 text-red-400 border-red-800",
  DOC: "bg-blue-950 text-blue-400 border-blue-800",
  XLS: "bg-emerald-950 text-emerald-400 border-emerald-800",
};

export default function DocumentsModule() {
  const { data, isLoading, error } = useQuery<Doc[] | null>({
    queryKey: ["crm-documents"],
    queryFn: async () => {
      const res = await (supabase as any)
        .from("documents")
        .select("id, title, category, file_type, file_size_kb, restricted, created_at, uploader:profiles!documents_uploaded_by_fkey(full_name)")
        .order("created_at", { ascending: false })
        .limit(50);

      // If table doesn't exist, Supabase returns a specific error code
      if (res.error?.code === "42P01") return null; // table does not exist

      return (res.data ?? []).map((d: any) => ({
        id: d.id,
        title: d.title,
        category: d.category ?? "General",
        file_type: d.file_type ?? "PDF",
        file_size_kb: d.file_size_kb ?? null,
        restricted: d.restricted ?? false,
        created_at: d.created_at,
        uploader_name: d.uploader?.full_name ?? null,
      }));
    },
  });

  // Table not set up yet
  if (!isLoading && data === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-[#111a14] border border-[#1e2d22] flex items-center justify-center">
          <AlertCircle className="h-7 w-7 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#c8e0cc]">Documents table not set up</h2>
          <p className="text-sm text-[#6b8f72] mt-2 max-w-sm">
            Create a <span className="font-mono text-emerald-500">documents</span> table in Supabase with columns:
            <br />
            <span className="font-mono text-[11px] text-[#4a6650]">
              id, title, category, file_type, file_size_kb, restricted, uploaded_by (FK → profiles), created_at
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#c8e0cc]">Documents</h2>
        <p className="text-[12px] text-[#6b8f72] mt-0.5">
          Shared files, MoU templates, budget documents, and reports
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && Array.isArray(data) && data.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
          <div className="h-14 w-14 rounded-2xl bg-[#111a14] border border-[#1e2d22] flex items-center justify-center">
            <FolderOpen className="h-6 w-6 text-[#4a6650]" />
          </div>
          <p className="text-sm text-[#6b8f72]">No documents uploaded yet.</p>
        </div>
      )}

      {/* Document list */}
      {!isLoading && Array.isArray(data) && data.length > 0 && (
        <div className="space-y-2">
          {data.map(doc => {
            const typeStyle = TYPE_STYLE[doc.file_type] ?? TYPE_STYLE["PDF"];
            const sizeStr = doc.file_size_kb
              ? doc.file_size_kb >= 1024
                ? `${(doc.file_size_kb / 1024).toFixed(1)} MB`
                : `${doc.file_size_kb} KB`
              : null;

            return (
              <div
                key={doc.id}
                className="bg-[#0d1610] border border-[#1e2d22] rounded-xl p-4 flex items-center gap-3 hover:border-[#2a3d2d] transition-colors"
              >
                {/* File type badge */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 border ${typeStyle}`}>
                  {doc.file_type}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold text-[#c8e0cc] truncate">{doc.title}</p>
                    {doc.restricted && (
                      <span className="flex items-center gap-0.5 text-[9px] font-mono text-amber-400 bg-amber-950 border border-amber-800 rounded px-1.5 py-0.5 flex-shrink-0">
                        <Lock size={8} /> Restricted
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-mono text-[#4a6650] bg-[#111a14] border border-[#1e2d22] rounded px-1.5 py-0.5">
                      {doc.category}
                    </span>
                    {sizeStr && <span className="text-[10px] text-[#4a6650]">{sizeStr}</span>}
                    <span className="text-[10px] text-[#4a6650]">
                      {format(parseISO(doc.created_at), "d MMM yyyy")}
                    </span>
                    {doc.uploader_name && (
                      <span className="text-[10px] text-[#4a6650]">by {doc.uploader_name}</span>
                    )}
                  </div>
                </div>

                {/* Download button */}
                <button
                  className="flex items-center gap-1.5 text-[11px] text-[#4a6650] hover:text-[#a0c4a8] bg-[#111a14] border border-[#1e2d22] rounded-lg px-2.5 py-1.5 transition-colors flex-shrink-0"
                  title="Download"
                >
                  <Download size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
