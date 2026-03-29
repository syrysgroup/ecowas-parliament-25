import { FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DocumentsModule() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="h-16 w-16 rounded-2xl bg-[#111a14] border border-[#1e2d22] flex items-center justify-center">
        <FolderOpen className="h-7 w-7 text-[#4a6650]" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#c8e0cc]">Documents</h2>
        <p className="text-sm text-[#6b8f72] mt-1 max-w-xs">
          Shared files, MoU templates, budget documents, and e-signature workflows.
        </p>
      </div>
      <Badge variant="secondary" className="font-mono text-xs">Coming Soon</Badge>
    </div>
  );
}
