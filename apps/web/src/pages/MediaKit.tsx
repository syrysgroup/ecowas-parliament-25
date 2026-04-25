import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ExternalLink, FileText, ImageIcon, Mic, Mail, Clock } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface MediaKitItem {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  url: string | null;
  metadata: Record<string, any>;
  display_order: number;
}

function useMediaKitItems(type: string) {
  return useQuery<MediaKitItem[]>({
    queryKey: ["media-kit-items", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_kit_items")
        .select("*")
        .eq("type", type)
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

function cms(data: Record<string, string> | null | undefined, key: string, fallback: string): string {
  return data?.[key] || fallback;
}

export default function MediaKit() {
  const { t } = useTranslation();

  const { data: releases = [],    isLoading: releasesLoading } = useMediaKitItems("press_release");
  const { data: spokespeople = [], isLoading: spokesLoading   } = useMediaKitItems("spokesperson");
  const { data: eventCalendar = [], isLoading: calLoading     } = useMediaKitItems("event_calendar");
  const { data: assetPacks = [],   isLoading: assetsLoading   } = useMediaKitItems("asset_pack");
  const { data: keyFacts = [],     isLoading: factsLoading    } = useMediaKitItems("key_fact");

  const { data: heroCms }    = useSiteContent("media_kit_hero");
  const { data: contactCms } = useSiteContent("media_contact");

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <AnimatedSection>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">
              {cms(heroCms, "badge", t("mediaKit.badge"))}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black">
              {cms(heroCms, "hero_title", t("mediaKit.heroTitle"))}
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              {cms(heroCms, "hero_desc", t("mediaKit.heroDesc"))}
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {heroCms?.full_pack_url ? (
                <Button variant="secondary" className="gap-2" asChild>
                  <a href={heroCms.full_pack_url} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4" /> {t("mediaKit.fullPack")}
                  </a>
                </Button>
              ) : (
                <Button variant="secondary" className="gap-2">
                  <Download className="h-4 w-4" /> {t("mediaKit.fullPack")}
                </Button>
              )}
              <Button variant="secondary" className="gap-2 bg-primary-foreground/15 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/25">
                <Mail className="h-4 w-4" />
                {cms(heroCms, "contact_email", "media@ecowasparliamentinitiatives.org")}
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Accreditation alert */}
      <section className="py-5 bg-amber-50 dark:bg-amber-950/20 border-y border-amber-200 dark:border-amber-800">
        <div className="container">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>{t("mediaKit.accreditation")}</strong> {t("mediaKit.accreditationDesc")}
              </p>
              <Button asChild variant="link" size="sm" className="text-amber-700 dark:text-amber-400 p-0 h-auto mt-1 text-xs">
                <Link to="/media-portal">Access Accredited Media Portal →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container space-y-14">

          {/* Key Facts */}
          {(factsLoading || keyFacts.length > 0) && (
            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6">{t("mediaKit.keyFacts") || "Key Facts"}</h2>
              {factsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {keyFacts.map(f => (
                    <div key={f.id} className="rounded-xl border border-border bg-card p-5 text-center">
                      <p className="text-3xl font-black text-primary leading-none">
                        {f.metadata?.value ?? ""}
                        <span className="text-lg font-semibold text-muted-foreground ml-0.5">{f.metadata?.unit ?? ""}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 leading-snug">{f.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </AnimatedSection>
          )}

          {/* Press Releases */}
          <AnimatedSection>
            <h2 className="text-2xl font-bold mb-6">{t("mediaKit.pressReleases")}</h2>
            {releasesLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : (
              <div className="space-y-3">
                {releases.map(r => {
                  const isHighlight = r.metadata?.highlight === true;
                  return (
                    <div key={r.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-shadow hover:shadow-sm ${isHighlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
                      <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-snug">{r.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                          {r.metadata?.release_type && <Badge variant="outline" className="text-[10px]">{r.metadata.release_type}</Badge>}
                          {r.metadata?.language && <Badge variant="secondary" className="text-[10px]">{r.metadata.language}</Badge>}
                          {isHighlight && <Badge className="text-[10px]">{t("mediaKit.latest")}</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {r.url && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
                            <a href={r.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" /> {t("mediaKit.view")}</a>
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                          <Download className="h-3 w-3" /> PDF
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AnimatedSection>

          {/* Event Calendar */}
          <AnimatedSection>
            <h2 className="text-2xl font-bold mb-6">{t("mediaKit.eventCalendar")}</h2>
            {calLoading ? (
              <Skeleton className="h-64 rounded-xl" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left pb-3 font-semibold text-muted-foreground pr-6">{t("mediaKit.month")}</th>
                      <th className="text-left pb-3 font-semibold text-muted-foreground pr-6">{t("mediaKit.event")}</th>
                      <th className="text-left pb-3 font-semibold text-muted-foreground">{t("mediaKit.location")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventCalendar.map(e => (
                      <tr key={e.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="py-3 pr-6 font-medium text-primary whitespace-nowrap">{e.subtitle}</td>
                        <td className="py-3 pr-6">{e.title}</td>
                        <td className="py-3 text-muted-foreground">{e.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">{t("mediaKit.calendarNote")}</p>
          </AnimatedSection>

          {/* Spokespeople + Asset Packs */}
          <div className="grid lg:grid-cols-2 gap-10">
            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6">{t("mediaKit.spokespeople")}</h2>
              {spokesLoading ? (
                <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
              ) : (
                <div className="space-y-4">
                  {spokespeople.map(s => (
                    <Card key={s.id}>
                      <CardContent className="pt-4">
                        <div className="flex gap-4">
                          <span className={`inline-flex items-center justify-center w-11 h-11 rounded-full text-sm font-bold flex-shrink-0 ${s.metadata?.colour ?? "bg-primary/10 text-primary"}`}>
                            {s.metadata?.initials ?? s.title?.charAt(0) ?? "?"}
                          </span>
                          <div>
                            <p className="font-bold text-sm">{s.title}</p>
                            <p className="text-xs text-primary font-medium mb-2">{s.subtitle}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                            <Button size="sm" variant="outline" className="mt-2 h-7 text-xs gap-1">
                              <Mic className="h-3 w-3" /> {t("mediaKit.requestInterview")}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h2 className="text-2xl font-bold mb-6">{t("mediaKit.assets")}</h2>
              {assetsLoading ? (
                <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
              ) : (
                <div className="space-y-3">
                  {assetPacks.map(a => {
                    const isImage = a.metadata?.icon === "image";
                    const Icon = isImage ? ImageIcon : FileText;
                    return (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{a.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {a.metadata?.size && <span className="text-[10px] text-muted-foreground">{a.metadata.size}</span>}
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild={!!a.url}>
                            {a.url
                              ? <a href={a.url} target="_blank" rel="noreferrer"><Download className="h-3 w-3" /></a>
                              : <span><Download className="h-3 w-3" /></span>}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button className="w-full mt-4 gap-2" variant="outline">
                <Download className="h-4 w-4" /> {t("mediaKit.downloadAll")}
              </Button>
            </AnimatedSection>
          </div>

          {/* Media Contact */}
          <AnimatedSection>
            <Card className="bg-gradient-hero text-primary-foreground border-0 overflow-hidden">
              <CardContent className="py-8 px-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
                  <div>
                    <CardTitle className="text-xl text-primary-foreground mb-2">
                      {cms(contactCms, "section_title", t("mediaKit.mediaContact"))}
                    </CardTitle>
                    <p className="text-primary-foreground/75 text-sm max-w-md">
                      {cms(contactCms, "section_desc", t("mediaKit.mediaContactDesc"))}
                    </p>
                    <p className="text-primary-foreground font-semibold mt-3">
                      {cms(contactCms, "contact_name", t("mediaKit.contactName"))}
                    </p>
                    <p className="text-primary-foreground/75 text-sm">
                      {cms(contactCms, "contact_response_time", t("mediaKit.contactResponse"))}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {contactCms?.contact_email ? (
                      <Button variant="secondary" className="gap-2 whitespace-nowrap" asChild>
                        <a href={`mailto:${contactCms.contact_email}`}>
                          <Mail className="h-4 w-4" /> {t("mediaKit.emailMediaTeam")}
                        </a>
                      </Button>
                    ) : (
                      <Button variant="secondary" className="gap-2 whitespace-nowrap">
                        <Mail className="h-4 w-4" /> {t("mediaKit.emailMediaTeam")}
                      </Button>
                    )}
                    {contactCms?.full_pack_url ? (
                      <Button variant="secondary" className="gap-2 whitespace-nowrap bg-primary-foreground/15 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/25" asChild>
                        <a href={contactCms.full_pack_url} target="_blank" rel="noreferrer">
                          <Download className="h-4 w-4" /> {t("mediaKit.fullMediaPack")}
                        </a>
                      </Button>
                    ) : (
                      <Button variant="secondary" className="gap-2 whitespace-nowrap bg-primary-foreground/15 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/25">
                        <Download className="h-4 w-4" /> {t("mediaKit.fullMediaPack")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

        </div>
      </section>
    </Layout>
  );
}
