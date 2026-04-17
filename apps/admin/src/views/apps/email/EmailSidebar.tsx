import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail, Send, Edit, Star, AlertOctagon, Trash2, Circle,
  X, Paperclip
} from "lucide-react";
import type { EmailState } from "@/types/apps/emailTypes";

const folderIcons: Record<string, React.ReactNode> = {
  inbox: <Mail size={16} />,
  sent: <Send size={16} />,
  draft: <Edit size={16} />,
  starred: <Star size={16} />,
  spam: <AlertOctagon size={16} />,
  trash: <Trash2 size={16} />,
};

const labelColors: Record<string, string> = {
  personal: "text-green-500",
  company: "text-primary",
  important: "text-amber-500",
  private: "text-red-500",
};

type ComposeMailProps = {
  open: boolean;
  onClose: () => void;
};

const ComposeMail = ({ open, onClose }: ComposeMailProps) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Compose Mail</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <div className="space-y-1">
          <Label className="text-xs">To</Label>
          <Input placeholder="recipient@email.com" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Subject</Label>
          <Input placeholder="Subject" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Message</Label>
          <Textarea placeholder="Write your message..." className="min-h-[160px] text-sm resize-none" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Button size="sm">Send</Button>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Attach file">
              <Paperclip size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={onClose}>
              <X size={14} />
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

type Props = {
  store: EmailState;
  folder?: string;
  label?: string;
  uniqueLabels: string[];
  open: boolean;
  onClose: () => void;
};

const EmailSidebar = ({ store, folder, label, uniqueLabels, open, onClose }: Props) => {
  const [composeOpen, setComposeOpen] = useState(false);

  const folderCounts = store.emails.reduce((counts: Record<string, number>, email) => {
    if (!email.isRead && email.folder !== "trash") {
      counts[email.folder] = (counts[email.folder] || 0) + 1;
    }
    if (email.folder === "draft") counts.draft = (counts.draft || 0) + 1;
    return counts;
  }, {});

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Button className="w-full" onClick={() => setComposeOpen(true)}>
          Compose
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(folderIcons).map(([key, icon]) => (
            <NavLink
              key={key}
              to={`/apps/email/${key}`}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-sm gap-2 transition-colors ${
                  isActive && !label ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                {icon}
                <span className="capitalize">{key}</span>
              </div>
              {folderCounts[key] ? (
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                  {folderCounts[key]}
                </Badge>
              ) : null}
            </NavLink>
          ))}
        </div>
        {uniqueLabels.length > 0 && (
          <div className="p-2 pt-0">
            <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider px-3 mb-2">Labels</p>
            {uniqueLabels.map((labelName) => (
              <NavLink
                key={labelName}
                to={`/apps/email/label/${labelName}`}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`
                }
              >
                <Circle size={8} className={labelColors[labelName] || "text-muted-foreground"} fill="currentColor" />
                <span className="capitalize">{labelName}</span>
              </NavLink>
            ))}
          </div>
        )}
      </ScrollArea>
      <ComposeMail open={composeOpen} onClose={() => setComposeOpen(false)} />
    </div>
  );

  return (
    <>
      {/* Mobile sheet */}
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
      {/* Desktop permanent sidebar */}
      <div className="hidden md:flex w-64 border-r border-border flex-col shrink-0">
        {sidebarContent}
      </div>
    </>
  );
};

export default EmailSidebar;
