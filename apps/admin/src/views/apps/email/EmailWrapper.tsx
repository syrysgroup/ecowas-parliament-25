import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { filterEmails } from "@/store/slices/email";
import type { RootState } from "@/store";
import EmailSidebar from "./EmailSidebar";
import MailContentList from "./MailContentList";
import MailDetails from "./MailDetails";
import { MailOpen } from "lucide-react";

type Props = {
  folder?: string;
  label?: string;
};

const EmailWrapper = ({ folder, label }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isInitialMount = useRef(true);
  const dispatch = useDispatch();
  const emailStore = useSelector((state: RootState) => state.emailReducer);

  const uniqueLabels = [...new Set(emailStore.emails.flatMap((e) => e.labels))];

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  useEffect(() => {
    dispatch(filterEmails({ emails: emailStore.emails, folder, label, uniqueLabels }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailStore.emails, folder, label]);

  const currentEmail = emailStore.currentEmailId
    ? emailStore.emails.find((e) => e.id === emailStore.currentEmailId)
    : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-card rounded-xl border border-border shadow-sm">
      <EmailSidebar
        store={emailStore}
        folder={folder}
        label={label}
        uniqueLabels={uniqueLabels}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <MailContentList
        store={emailStore}
        folder={folder}
        label={label}
        uniqueLabels={uniqueLabels}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
      {/* Detail pane */}
      <div className="flex-1 min-w-0 hidden md:flex flex-col">
        {currentEmail ? (
          <MailDetails email={currentEmail} store={emailStore} onBack={() => {}} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <MailOpen size={48} className="opacity-20" />
            <p className="text-sm">Select an email to read</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailWrapper;
