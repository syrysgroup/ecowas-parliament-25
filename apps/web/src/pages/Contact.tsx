import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import SocialMediaBar from "@/components/shared/SocialMediaBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Mail, MapPin, Phone, Globe, Send } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import FlagImg from "@/components/shared/FlagImg";

interface ContactCard {
  type: "email" | "phone";
  label: string;
  value: string;
  desc: string;
}
interface Office {
  city: string;
  country: string;
  role: string;
  address: string;
}
interface ContactContent {
  cards?: ContactCard[];
  offices?: Office[];
}

export default function Contact() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const ENQUIRY_TYPES = [
    t("contact.enquiry.general"), t("contact.enquiry.press"), t("contact.enquiry.sponsorship"),
    t("contact.enquiry.event"), t("contact.enquiry.youth"), t("contact.enquiry.programme"),
    t("contact.enquiry.government"), t("contact.enquiry.other"),
  ];

  const [enquiryType, setEnquiryType] = useState(ENQUIRY_TYPES[0]);
  const [form, setForm] = useState({ name: "", organisation: "", email: "", phone: "", subject: "", message: "" });

  const { data: contactInfo, isLoading } = useQuery<ContactContent | null>({
    queryKey: ["site-content", "contact_info"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("site_content")
        .select("content")
        .eq("section_key", "contact_info")
        .maybeSingle();
      return (data?.content as ContactContent) ?? null;
    },
    staleTime: 10 * 60 * 1000,
  });

  const contactCards: ContactCard[] = contactInfo?.cards ?? [];
  const offices: Office[] = contactInfo?.offices ?? [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await (supabase as any).from("contact_submissions").insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        message: `[${enquiryType}] ${form.subject}\n\n${form.message}`,
        source_page: "/contact",
      });
    } catch (_) { /* fire and forget */ }
    setSubmitted(true);
  };

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <AnimatedSection>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">{t("contact.badge")}</Badge>
            <h1 className="text-4xl md:text-5xl font-black">{t("contact.heroTitle")}</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">{t("contact.heroDesc")}</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 bg-muted/30 border-b border-border">
        <div className="container">
          <AnimatedSection>
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {contactCards.map(c => {
                  const Icon = c.type === "phone" ? Phone : Mail;
                  const colour = c.label.toLowerCase().includes("press") ? "bg-blue-50 text-blue-700"
                    : c.label.toLowerCase().includes("sponsor") ? "bg-amber-50 text-amber-700"
                    : c.label.toLowerCase().includes("phone") || c.type === "phone" ? "bg-muted text-foreground"
                    : "bg-primary/5 text-primary";
                  return (
                    <Card key={c.label} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colour}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{c.label}</p>
                        <p className="text-sm font-bold break-all">{c.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <AnimatedSection>
                <h2 className="text-2xl font-bold mb-2">{t("contact.sendMessage")}</h2>
                <p className="text-muted-foreground mb-6">{t("contact.sendMessageDesc")}</p>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">{t("contact.successTitle")}</h3>
                    <p className="text-muted-foreground max-w-sm">{t("contact.successDesc")}</p>
                    <Button variant="outline" onClick={() => setSubmitted(false)}>{t("contact.sendAnother")}</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">{t("contact.enquiryAbout")}</Label>
                      <div className="flex flex-wrap gap-2">
                        {ENQUIRY_TYPES.map(tp => (
                          <button key={tp} type="button" onClick={() => setEnquiryType(tp)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${enquiryType === tp ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}>
                            {tp}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-semibold mb-1.5 block">{t("contact.fullName")}</Label>
                        <Input id="name" name="name" required placeholder={t("contact.fullNamePlaceholder")} value={form.name} onChange={handleChange} />
                      </div>
                      <div>
                        <Label htmlFor="organisation" className="text-sm font-semibold mb-1.5 block">{t("contact.organisation")}</Label>
                        <Input id="organisation" name="organisation" placeholder={t("contact.organisationPlaceholder")} value={form.organisation} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="text-sm font-semibold mb-1.5 block">{t("contact.emailLabel")}</Label>
                        <Input id="email" name="email" type="email" required placeholder={t("contact.emailPlaceholder")} value={form.email} onChange={handleChange} />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm font-semibold mb-1.5 block">{t("contact.phone")}</Label>
                        <Input id="phone" name="phone" type="tel" placeholder={t("contact.phonePlaceholder")} value={form.phone} onChange={handleChange} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-sm font-semibold mb-1.5 block">{t("contact.subject")}</Label>
                      <Input id="subject" name="subject" required placeholder={`Re: ${enquiryType}`} value={form.subject} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-sm font-semibold mb-1.5 block">{t("contact.message")}</Label>
                      <Textarea id="message" name="message" required rows={5} placeholder={t("contact.messagePlaceholder")} value={form.message} onChange={handleChange} className="resize-none" />
                    </div>
                    <p className="text-xs text-muted-foreground">{t("contact.privacyNote")}</p>
                    <Button type="submit" className="gap-2 w-full sm:w-auto">
                      <Send className="h-4 w-4" />{t("contact.sendBtn")}
                    </Button>
                  </form>
                )}
              </AnimatedSection>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <AnimatedSection delay={120}>
                <h3 className="text-lg font-bold mb-4">{t("contact.offices")}</h3>
                {isLoading ? (
                  <Skeleton className="h-28 rounded-xl" />
                ) : (
                  offices.map(o => (
                    <Card key={o.city} className="mb-4">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <FlagImg country={o.country} className="h-7 w-7" />
                          <div>
                            <p className="font-bold">{o.city}, {o.country}</p>
                            <p className="text-xs text-primary font-medium mt-0.5">{o.role}</p>
                            <div className="flex items-start gap-1.5 mt-2">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-muted-foreground">{o.address}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <h3 className="text-lg font-bold mb-4">{t("contact.followUs")}</h3>
                <SocialMediaBar variant="full" showParliamentLink={true} />
              </AnimatedSection>

              <AnimatedSection delay={240}>
                <h3 className="text-lg font-bold mb-4">{t("contact.web")}</h3>
                <div className="space-y-3">
                  {[
                    { icon: Globe, label: "ECOWAS Parliament Initiatives (Official)", value: "parl.ecowas.int", href: "https://parl.ecowas.int" },
                    { icon: Globe, label: "Initiatives Website", value: "ecowasparliamentinitiatives.org", href: "https://ecowasparliamentinitiatives.org" },
                  ].map(s => {
                    const Icon = s.icon;
                    return (
                      <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                          <p className="text-sm font-medium">{s.value}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={280}>
                <Card className="bg-primary text-primary-foreground border-0">
                  <CardContent className="pt-5">
                    <h4 className="font-bold mb-2">{t("contact.sponsorCardTitle")}</h4>
                    <p className="text-sm text-primary-foreground/75 mb-4">{t("contact.sponsorCardDesc")}</p>
                    <Button size="sm" variant="secondary" className="w-full gap-2">
                      <Mail className="h-4 w-4" />sponsors@ecowasparliamentinitiatives.org
                    </Button>
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
