import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thank you for subscribing!");
    setEmail("");
  };

  return (
    <section className="py-16 md:py-20 bg-muted/30 border-t border-b border-border text-center">
      <div className="container max-w-lg mx-auto">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">Stay Informed</Badge>
        <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3">
          Follow the Anniversary
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-7">
          Receive programme updates, event dates, and news. Available in English, French, and
          Portuguese.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="font-bold whitespace-nowrap">
            Subscribe →
          </Button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;
