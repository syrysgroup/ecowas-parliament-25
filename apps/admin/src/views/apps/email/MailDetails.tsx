import { useDispatch } from "react-redux";
import { ArrowLeft, ArrowRight, Trash2, Star, MailOpen, ChevronLeft, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  toggleStarEmail,
  moveEmailsToFolder,
  navigateEmails,
  toggleReadEmails,
} from "@/store/slices/email";
import type { Email, EmailState } from "@/types/apps/emailTypes";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Props = {
  email: Email;
  store: EmailState;
  onBack: () => void;
};

const MailDetails = ({ email, store, onBack }: Props) => {
  const dispatch = useDispatch();

  const handleStar = () => dispatch(toggleStarEmail({ emailId: email.id }));
  const handleDelete = () => dispatch(moveEmailsToFolder({ emailIds: [email.id], folder: "trash" }));
  const handleToggleRead = () => dispatch(toggleReadEmails({ emailIds: [email.id] }));
  const handleNav = (type: "prev" | "next") =>
    dispatch(navigateEmails({ type, emails: store.filteredEmails, currentEmailId: email.id }));

  const timeStr = email.time ? format(new Date(email.time), "MMM d, yyyy h:mm a") : "";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={onBack}>
          <ChevronLeft size={16} />
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleToggleRead} title="Toggle read">
          <MailOpen size={15} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete} title="Delete">
          <Trash2 size={15} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", email.isStarred ? "text-amber-400" : "")}
          onClick={handleStar}
          title="Star"
        >
          <Star size={15} fill={email.isStarred ? "currentColor" : "none"} />
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleNav("prev")}>
          <ArrowLeft size={15} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleNav("next")}>
          <ArrowRight size={15} />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">{email.subject}</h2>
          <div className="flex items-start gap-3 mb-6">
            <img
              src={email.from.avatar || "/images/avatars/1.png"}
              alt={email.from.name}
              className="w-10 h-10 rounded-full object-cover shrink-0"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).src = "/images/avatars/1.png"; }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-foreground">{email.from.name}</p>
                  <p className="text-xs text-muted-foreground">{email.from.email}</p>
                </div>
                <span className="text-xs text-muted-foreground">{timeStr}</span>
              </div>
              {email.to.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  To: {email.to.map((t) => t.email).join(", ")}
                </p>
              )}
            </div>
          </div>

          <div
            className="text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: email.message }}
          />

          {email.attachments.length > 0 && (
            <div className="mt-6">
              <Separator className="mb-4" />
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Attachments ({email.attachments.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {email.attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border">
                    <Paperclip size={13} className="text-muted-foreground" />
                    <span className="text-xs text-foreground">{att.fileName}</span>
                    <span className="text-[10px] text-muted-foreground">({att.size})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MailDetails;
