import { useState } from "react";
import { useDispatch } from "react-redux";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Search, MoreVertical, Trash2, MailOpen, Tag, Menu } from "lucide-react";
import { moveEmailsToFolder, deleteTrashEmails, toggleReadEmails, toggleLabel } from "@/store/slices/email";
import type { EmailState } from "@/types/apps/emailTypes";
import MailCard from "./MailCard";

type Props = {
  store: EmailState;
  folder?: string;
  label?: string;
  uniqueLabels: string[];
  onOpenSidebar: () => void;
};

const MailContentList = ({ store, folder, label, uniqueLabels, onOpenSidebar }: Props) => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const emails = store.filteredEmails.filter((e) =>
    !search ||
    e.subject.toLowerCase().includes(search.toLowerCase()) ||
    e.from.name.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = emails.length > 0 && selectedIds.length === emails.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : emails.map((e) => e.id));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleDelete = () => {
    if (folder === "trash") {
      dispatch(deleteTrashEmails({ emailIds: selectedIds }));
    } else {
      dispatch(moveEmailsToFolder({ emailIds: selectedIds, folder: "trash" }));
    }
    setSelectedIds([]);
  };

  const handleToggleRead = () => {
    dispatch(toggleReadEmails({ emailIds: selectedIds }));
    setSelectedIds([]);
  };

  const handleLabel = (lbl: string) => {
    dispatch(toggleLabel({ emailIds: selectedIds, label: lbl }));
    setSelectedIds([]);
  };

  return (
    <div className="flex flex-col h-full w-full md:w-72 lg:w-80 xl:w-96 border-r border-border shrink-0">
      {/* Search bar */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={onOpenSidebar}>
          <Menu size={16} />
        </Button>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 pl-7 text-sm"
            placeholder="Search mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Action bar when items selected */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-1 px-3 py-2 bg-muted/30 border-b border-border">
          <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} className="h-3.5 w-3.5" />
          <span className="text-xs text-muted-foreground ml-1">{selectedIds.length} selected</span>
          <div className="ml-auto flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDelete}>
              <Trash2 size={13} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleToggleRead}>
              <MailOpen size={13} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Tag size={13} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {uniqueLabels.map((lbl) => (
                  <DropdownMenuItem key={lbl} onClick={() => handleLabel(lbl)} className="capitalize">
                    {lbl}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical size={13} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => dispatch(moveEmailsToFolder({ emailIds: selectedIds, folder: "spam" }))}>
                  Mark as Spam
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Email list */}
      <ScrollArea className="flex-1">
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <MailOpen size={32} className="mb-2 opacity-30" />
            <p className="text-sm">No emails found</p>
          </div>
        ) : (
          emails.map((email) => (
            <div key={email.id} className="flex items-center">
              <div className="pl-3 pr-1 py-3 shrink-0">
                <Checkbox
                  checked={selectedIds.includes(email.id)}
                  onCheckedChange={() => toggleSelect(email.id)}
                  className="h-3.5 w-3.5"
                />
              </div>
              <div className="flex-1 min-w-0">
                <MailCard email={email} isSelected={selectedIds.includes(email.id)} currentEmailId={store.currentEmailId} />
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
};

export default MailContentList;
