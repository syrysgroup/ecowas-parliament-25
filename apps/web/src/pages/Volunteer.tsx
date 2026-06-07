import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Send, Loader2 } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useToast } from "@/hooks/use-toast";

interface FormField {
  id: string; key: string; label: string; field_type: string;
  options: any; required: boolean; position: number; active: boolean;
}

export default function Volunteer() {
  const { toast } = useToast();
  const { data: cms } = useSiteContent("volunteer");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  const { data: fields = [], isLoading } = useQuery<FormField[]>({
    queryKey: ["volunteer-form-fields"],
    queryFn: async () => {
      const { data } = await supabase
        .from("volunteer_form_fields")
        .select("*")
        .eq("active", true)
        .order("position");
      return data ?? [];
    },
  });

  const get = (k: string, fb = "") => cms?.[k] || fb;

  const handleChange = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        full_name: form.full_name ?? "",
        email: form.email ?? "",
        phone: form.phone ?? null,
        country: form.country ?? null,
        availability: form.availability ?? null,
        motivation: form.motivation ?? "",
        interests: Array.isArray(form.interests) ? form.interests : null,
        status: "new",
      };
      const { error } = await supabase.from("volunteer_applications").insert(payload);
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (f: FormField) => {
    const v = form[f.key] ?? "";
    if (f.field_type === "textarea") {
      return <Textarea id={f.key} required={f.required} rows={5} value={v} onChange={e => handleChange(f.key, e.target.value)} className="resize-none" />;
    }
    if (f.field_type === "select") {
      const opts = Array.isArray(f.options) ? f.options : [];
      return (
        <select id={f.key} required={f.required} value={v} onChange={e => handleChange(f.key, e.target.value)}
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="" disabled>Select…</option>
          {opts.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    return <Input id={f.key} type={f.field_type === "email" ? "email" : f.field_type === "tel" ? "tel" : "text"}
      required={f.required} value={v} onChange={e => handleChange(f.key, e.target.value)} />;
  };

  const expectations = (get("expectations_list", "We respond within 5 working days\nFlexible time commitment\nTraining and mentorship\nCertificate of contribution\nGrow with a pan-African mission"))
    .split("\n").filter(Boolean);

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-20 relative overflow-hidden"
        style={get("hero_image") ? { backgroundImage: `linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)), url(${get("hero_image")})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
        <div className="container">
          <AnimatedSection>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">
              {get("badge", "Get Involved")}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black">{get("title", "Volunteer with us")}</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              {get("subtitle", "Join the team driving ECOWAS Parliament Initiatives across West Africa.")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <AnimatedSection>
                <h2 className="text-2xl font-bold mb-2">{get("form_title", "Tell us about yourself")}</h2>
                <p className="text-muted-foreground mb-6">{get("form_desc", "Share a few details and our team will be in touch.")}</p>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">{get("success_title", "Thank you!")}</h3>
                    <p className="text-muted-foreground max-w-sm">{get("success_desc", "Your application has been received. We'll be in touch soon.")}</p>
                    <Button variant="outline" onClick={() => { setSubmitted(false); setForm({}); }}>Submit another</Button>
                  </div>
                ) : isLoading ? (
                  <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {fields.map(f => (
                      <div key={f.id}>
                        <Label htmlFor={f.key} className="text-sm font-semibold mb-1.5 block">
                          {f.label} {f.required && "*"}
                        </Label>
                        {renderField(f)}
                      </div>
                    ))}
                    {get("privacy_note") && <p className="text-xs text-muted-foreground">{get("privacy_note")}</p>}
                    <Button type="submit" disabled={submitting} className="gap-2 w-full sm:w-auto">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Submit application
                    </Button>
                  </form>
                )}
              </AnimatedSection>
            </div>

            <div className="space-y-6">
              <AnimatedSection delay={120}>
                <Card className="bg-primary text-primary-foreground border-0">
                  <CardContent className="pt-5">
                    <h4 className="font-bold mb-2">{get("expectations_title", "What to expect")}</h4>
                    <ul className="text-sm text-primary-foreground/80 space-y-2">
                      {expectations.map((e, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary-foreground/60" />{e}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </AnimatedSection>
              <AnimatedSection delay={200}>
                <Card>
                  <CardContent className="pt-5">
                    <h4 className="font-bold mb-1">Questions?</h4>
                    <p className="text-sm font-medium break-all">{get("contact_email", "info@ecowasparliamentinitiatives.org")}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
