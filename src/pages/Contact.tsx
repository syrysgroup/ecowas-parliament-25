import { useState } from "react";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Mail, MapPin, Phone, Globe, Send } from "lucide-react";

const ENQUIRY_TYPES = [
  "General enquiry",
  "Press / media accreditation",
  "Sponsorship & partnerships",
  "Event attendance / RSVP",
  "Youth Parliament application",
  "Programme collaboration",
  "Government / delegation",
  "Other",
];

const offices = [
  {
    city: "Abuja",
    country: "Nigeria",
    role: "Headquarters — ECOWAS Parliament",
    address: "ECOWAS Parliament Complex, Abuja, Nigeria",
    flag: "🇳🇬",
  },
  {
    city: "Lagos",
    country: "Nigeria",
    role: "Programme Operations Hub",
    address: "c/o Duchess NL, Victoria Island, Lagos",
    flag: "🇳🇬",
  },
];

const contactCards = [
  {
    icon: Mail,
    label: "Press & media",
    value: "media@ecowasparliamentinitiatives.org",
    desc: "Accreditation · Interviews · Statements",
    colour: "bg-blue-50 text-blue-700",
  },
  {
    icon: Mail,
    label: "Sponsorship enquiries",
    value: "sponsors@ecowasparliamentinitiatives.org",
    desc: "Partnerships · Tier packages · Agreements",
    colour: "bg-amber-50 text-amber-700",
  },
  {
    icon: Mail,
    label: "General programme",
    value: "info@ecowasparliamentinitiatives.org",
    desc: "Events · Participation · Delegations",
    colour: "bg-primary/5 text-primary",
  },
  {
    icon: Phone,
    label: "Direct line",
    value: "+234 (0) 9 — 770 0000",
    desc: "Mon–Fri · 09:00–17:00 WAT",
    colour: "bg-muted text-foreground",
  },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [enquiryType, setEnquiryType] = useState(ENQUIRY_TYPES[0]);
  const [form, setForm] = useState({
    name: "", organisation: "", email: "", phone: "", subject: "", message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Wire to Supabase contact_submissions table or email provider
    setSubmitted(true);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <AnimatedSection>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">
              Get in touch
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black">Contact Us</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              Reach the ECOWAS Parliament 25th Anniversary Initiatives team for press accreditation, sponsorship, event enquiries, programme collaboration, or general information.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact channels */}
      <section className="py-12 bg-muted/30 border-b border-border">
        <div className="container">
          <AnimatedSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {contactCards.map(c => {
                const Icon = c.icon;
                return (
                  <Card key={c.label} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.colour}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        {c.label}
                      </p>
                      <p className="text-sm font-bold break-all">{c.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Form + offices */}
      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-2">
              <AnimatedSection>
                <h2 className="text-2xl font-bold mb-2">Send us a message</h2>
                <p className="text-muted-foreground mb-6">
                  We aim to respond to all enquiries within 2 working days. For urgent media requests, please call our direct line.
                </p>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Message received</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Thank you for reaching out. A member of the team will respond within 2 working days.
                    </p>
                    <Button variant="outline" onClick={() => setSubmitted(false)}>
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Enquiry type pills */}
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">What is your enquiry about?</Label>
                      <div className="flex flex-wrap gap-2">
                        {ENQUIRY_TYPES.map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setEnquiryType(t)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              enquiryType === t
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-semibold mb-1.5 block">Full name *</Label>
                        <Input
                          id="name"
                          name="name"
                          required
                          placeholder="Your full name"
                          value={form.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="organisation" className="text-sm font-semibold mb-1.5 block">Organisation</Label>
                        <Input
                          id="organisation"
                          name="organisation"
                          placeholder="Company, institution, or media outlet"
                          value={form.organisation}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="text-sm font-semibold mb-1.5 block">Email address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={form.email}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm font-semibold mb-1.5 block">Phone (optional)</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+234 000 0000 000"
                          value={form.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-sm font-semibold mb-1.5 block">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        required
                        placeholder={`Re: ${enquiryType}`}
                        value={form.subject}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-sm font-semibold mb-1.5 block">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        placeholder="Tell us what you need. Include any relevant dates, event names, or specific programme areas."
                        value={form.message}
                        onChange={handleChange}
                        className="resize-none"
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      By submitting this form you agree to our privacy policy. Your information will only be used to respond to your enquiry.
                    </p>

                    <Button type="submit" className="gap-2 w-full sm:w-auto">
                      <Send className="h-4 w-4" />
                      Send message
                    </Button>
                  </form>
                )}
              </AnimatedSection>
            </div>

            {/* Offices + socials */}
            <div className="space-y-6">
              <AnimatedSection delay={120}>
                <h3 className="text-lg font-bold mb-4">Our offices</h3>
                {offices.map(o => (
                  <Card key={o.city} className="mb-4">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{o.flag}</span>
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
                ))}
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <h3 className="text-lg font-bold mb-4">Social & web</h3>
                <div className="space-y-3">
                  {[
                    { icon: Globe,  label:"Official website",  value:"ecowasparliament.net",       href:"https://www.ecowasparliament.net" },
                    { icon: Globe,  label:"Programme website", value:"ecowasparliament25.org",      href:"#" },
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
                    <h4 className="font-bold mb-2">For sponsorship enquiries</h4>
                    <p className="text-sm text-primary-foreground/75 mb-4">
                      Contact Mariama Camara, Sponsor Relations Manager, directly for tailored partnership packages.
                    </p>
                    <Button size="sm" variant="secondary" className="w-full gap-2">
                      <Mail className="h-4 w-4" />
                      sponsors@ecowasparliament25.org
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
