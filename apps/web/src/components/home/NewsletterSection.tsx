import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

const NewsletterSection = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email });
      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success(t("newsletter.success"));
      }
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-20 bg-muted/30 border-t border-b border-border text-center">
      <div className="container max-w-lg mx-auto">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">{t("newsletter.badge")}</Badge>
        <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3">
          {t("newsletter.title")}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-7">
          {t("newsletter.subtitle")}
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder={t("newsletter.placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" className="font-bold whitespace-nowrap" disabled={loading}>
            {loading ? "…" : t("newsletter.submit")}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;
