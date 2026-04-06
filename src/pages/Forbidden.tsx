import { Link } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const Forbidden = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 text-center px-4">
    <ShieldOff size={48} className="text-muted-foreground opacity-40" />
    <h1 className="text-3xl font-black text-foreground">403 — Forbidden</h1>
    <p className="text-muted-foreground max-w-xs">
      You do not have permission to access this page. Contact a super admin if you believe this is an error.
    </p>
    <Button asChild>
      <Link to="/">Go Home</Link>
    </Button>
  </div>
);

export default Forbidden;
