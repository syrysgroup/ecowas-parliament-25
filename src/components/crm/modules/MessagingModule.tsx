import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MessagingModule() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="h-16 w-16 rounded-2xl bg-[#111a14] border border-[#1e2d22] flex items-center justify-center">
        <MessageSquare className="h-7 w-7 text-[#4a6650]" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#c8e0cc]">Messaging</h2>
        <p className="text-sm text-[#6b8f72] mt-1 max-w-xs">
          7 team channels for real-time collaboration across programme pillars.
        </p>
      </div>
      <Badge variant="secondary" className="font-mono text-xs">Coming Soon</Badge>
    </div>
  );
}
