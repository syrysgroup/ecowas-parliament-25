import { useParams } from "react-router-dom";
import EmailWrapper from "@/views/apps/email/EmailWrapper";

const EmailPage = () => {
  const { folder, label } = useParams<{ folder?: string; label?: string }>();

  return (
    <div className="container py-6">
      <EmailWrapper folder={folder || "inbox"} label={label} />
    </div>
  );
};

export default EmailPage;
