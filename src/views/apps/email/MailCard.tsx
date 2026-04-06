import { Star, Paperclip } from "lucide-react";
import { useDispatch } from "react-redux";
import { toggleStarEmail, getCurrentEmail } from "@/store/slices/email";
import type { Email } from "@/types/apps/emailTypes";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const labelColors: Record<string, string> = {
  personal: "bg-green-500",
  company: "bg-primary",
  important: "bg-amber-500",
  private: "bg-red-500",
};

type Props = {
  email: Email;
  isSelected: boolean;
  currentEmailId?: number;
};

const MailCard = ({ email, isSelected, currentEmailId }: Props) => {
  const dispatch = useDispatch();

  const handleCardClick = () => {
    dispatch(getCurrentEmail(email.id));
  };

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleStarEmail({ emailId: email.id }));
  };

  const timeStr = email.time
    ? format(new Date(email.time), "MMM d")
    : "";

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-border transition-colors hover:bg-muted/40",
        currentEmailId === email.id && "bg-primary/5",
        !email.isRead && "bg-muted/20"
      )}
    >
      <img
        src={email.from.avatar || `/images/avatars/1.png`}
        alt={email.from.name}
        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
        loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).src = "/images/avatars/1.png"; }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("text-sm truncate", !email.isRead ? "font-semibold text-foreground" : "text-muted-foreground")}>
            {email.from.name}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {email.attachments.length > 0 && <Paperclip size={11} className="text-muted-foreground" />}
            <span className="text-[10px] text-muted-foreground">{timeStr}</span>
          </div>
        </div>
        <p className={cn("text-xs truncate mt-0.5", !email.isRead ? "text-foreground" : "text-muted-foreground")}>
          {email.subject}
        </p>
        <div className="flex items-center gap-1 mt-1">
          {email.labels.map((lbl) => (
            <span key={lbl} className={cn("w-1.5 h-1.5 rounded-full", labelColors[lbl] || "bg-muted")} title={lbl} />
          ))}
        </div>
      </div>
      <button
        onClick={handleStar}
        className={cn("mt-0.5 shrink-0 transition-colors", email.isStarred ? "text-amber-400" : "text-muted-foreground hover:text-amber-400")}
      >
        <Star size={13} fill={email.isStarred ? "currentColor" : "none"} />
      </button>
    </div>
  );
};

export default MailCard;
