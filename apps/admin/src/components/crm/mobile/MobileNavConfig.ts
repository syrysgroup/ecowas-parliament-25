import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, MessageSquare, CheckSquare, Users, LayoutGrid, Inbox, Calendar, FolderOpen } from "lucide-react";

export interface MobileTab {
  id: string;
  label: string;
  icon: LucideIcon;
  section: string | null;
  requiresSection?: string;
}

export const PRIMARY_TAB_PRIORITY: MobileTab[] = [
  { id: "home",     label: "Home",     icon: LayoutDashboard, section: "" },
  { id: "messages", label: "Chat",     icon: MessageSquare,   section: "comms",       requiresSection: "comms" },
  { id: "tasks",    label: "Tasks",    icon: CheckSquare,     section: "tasks",       requiresSection: "tasks" },
  { id: "people",   label: "People",   icon: Users,           section: "team",        requiresSection: "team" },
  { id: "email",    label: "Email",    icon: Inbox,           section: "email-inbox", requiresSection: "email-inbox" },
  { id: "calendar", label: "Calendar", icon: Calendar,        section: "calendar",    requiresSection: "calendar" },
  { id: "docs",     label: "Docs",     icon: FolderOpen,      section: "documents",   requiresSection: "documents" },
];

export const MORE_TAB: MobileTab = {
  id: "more", label: "More", icon: LayoutGrid, section: null,
};
