import { useState } from "react";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { useTranslation } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Send, Users, Megaphone, Globe, BookOpen, Music, Mic2 } from "lucide-react";

const AREAS = [
  { icon: Users,     label: "Event Support",          desc: "On-ground logistics, registration, delegate assistance, and venue coordination." },
  { icon: Megaphone, label: "Communications & PR",     desc: "Social media, content creation, press liaison, and media monitoring." },
  { icon: Globe,     label: "Translation & Interpretation", desc: "English, French, and Portuguese — written and live interpretation." },
  { icon: BookOpen,  label: "Research & Documentation", desc: "Programme research, report writing, and archiving." },
  { icon: Music,     label: "Culture & Arts",          desc: "Cultural programming, creative direction, and artistic coordination." },
  { icon: Mic2,      label: "Community Outreach",      desc: "Engagement with youth groups, civil society, and local communities." },
];

const COUNTRIES = [
  "Benin", "Cabo Verde", "Côte d'Ivoire", "The Gambia", "Ghana", "Guinea",
  "Guinea-Bissau", "Liberia", "Nigeria", "Senegal", "Sierra Leone", "Togo",
  "Other",
];

export default function Volunteer() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [selectedArea, setSelectedArea] = useState(AREAS[0].label);
  const [form, setForm] = useState({
    name: "", email: "", country: "", skills: "", message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Wire to Supabase volunteer_applications table or email provider
    setSubmitted(true);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <AnimatedSection>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">
              {t("volunteer.badge")}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black">{t("volunteer.title")}</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              {t("volunteer.subtitle")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Volunteer areas */}
      <section className="py-14 bg-muted/30 border-b border-border">
        <div className="container">
          <AnimatedSection>
            <h2 className="text-2xl font-bold mb-2">Ways to contribute</h2>
            <p className="text-muted-foreground mb-8 max-w-xl">
              Choose the area that best matches your skills and availability. You can indicate multiple areas in your application.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AREAS.map(area => {
                const Icon = area.icon;
                return (
                  <Card
                    key={area.label}
                    onClick={() => setSelectedArea(area.label)}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedArea === area.label ? "border-primary shadow-md ring-1 ring-primary/30" : ""
                    }`}
                  >
                    <CardContent className="pt-5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm font-bold mb-1">{area.label}</p>
                      <p className="text-xs text-muted-foreground">{area.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Application form */}
      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <AnimatedSection>
                <h2 className="text-2xl font-bold mb-2">{t("volunteer.formTitle")}</h2>
                <p className="text-muted-foreground mb-6">{t("volunteer.formDesc")}</p>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">{t("volunteer.successTitle")}</h3>
                    <p className="text-muted-foreground max-w-sm">{t("volunteer.successDesc")}</p>
                    <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", country: "", skills: "", message: "" }); }}>
                      {t("volunteer.another")}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Area of interest pills */}
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">{t("volunteer.area")}</Label>
                      <div className="flex flex-wrap gap-2">
                        {AREAS.map(area => (
                          <button
                            key={area.label}
                            type="button"
                            onClick={() => setSelectedArea(area.label)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              selectedArea === area.label
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            {area.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-semibold mb-1.5 block">{t("volunteer.name")} *</Label>
                        <Input
                          id="name" name="name" required
                          placeholder="Your full name"
                          value={form.name} onChange={handleChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm font-semibold mb-1.5 block">{t("volunteer.email")} *</Label>
                        <Input
                          id="email" name="email" type="email" required
                          placeholder="your@email.com"
                          value={form.email} onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country" className="text-sm font-semibold mb-1.5 block">{t("volunteer.country")} *</Label>
                      <select
                        id="country" name="country" required
                        value={form.country} onChange={handleChange}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="" disabled>Select your country</option>
                        {COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="skills" className="text-sm font-semibold mb-1.5 block">{t("volunteer.skills")}</Label>
                      <Input
                        id="skills" name="skills"
                        placeholder="e.g. Fluent French/English, video editing, event management"
                        value={form.skills} onChange={handleChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-sm font-semibold mb-1.5 block">{t("volunteer.message")} *</Label>
                      <Textarea
                        id="message" name="message" required rows={5}
                        placeholder="Tell us about your motivation and availability."
                        value={form.message} onChange={handleChange}
                        className="resize-none"
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      By submitting this form you agree to our privacy policy. Your information will only be used for volunteer coordination.
                    </p>

                    <Button type="submit" className="gap-2 w-full sm:w-auto">
                      <Send className="h-4 w-4" />
                      {t("volunteer.submit")}
                    </Button>
                  </form>
                )}
              </AnimatedSection>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <AnimatedSection delay={120}>
                <Card className="bg-primary text-primary-foreground border-0">
                  <CardContent className="pt-5">
                    <h4 className="font-bold mb-2">What to expect</h4>
                    <ul className="text-sm text-primary-foreground/80 space-y-2">
                      {[
                        "Flexible short-term assignments",
                        "Work alongside a diverse team across West Africa",
                        "Official volunteer certification",
                        "Access to exclusive programme events",
                        "Mentorship from programme leads",
                      ].map(item => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary-foreground/60" />
                          {item}
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
                    <p className="text-xs text-muted-foreground mb-3">
                      Reach our volunteer coordination team directly.
                    </p>
                    <p className="text-sm font-medium break-all">info@ecowasparliamentinitiatives.org</p>
                    <p className="text-xs text-muted-foreground mt-1">Subject: Volunteer Enquiry</p>
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
