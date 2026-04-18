import { useState } from "react";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { FileText, Eye, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";

interface DocVersion {
  lang: string;
  label: string;
  url: string;
}

interface DocEntry {
  title: string;
  type: string;
  date: string;
  versions: DocVersion[];
}

const documents: DocEntry[] = [
  {
    title: "Press Release — 25th Anniversary Programme Launch",
    type: "Press Release",
    date: "2 March 2026",
    versions: [
      { lang: "EN", label: "English", url: "/docs/press-release-launch-en.pdf" },
      { lang: "FR", label: "Français", url: "/docs/press-release-launch-fr.pdf" },
      { lang: "PT", label: "Português", url: "/docs/press-release-launch-pt.pdf" },
    ],
  },
  {
    title: "ECOWAS Vision 2050 Document",
    type: "Policy Document",
    date: "2023",
    versions: [
      { lang: "EN", label: "English", url: "/docs/vision-2050-en.pdf" },
      { lang: "FR", label: "Français", url: "/docs/vision-2050-fr.pdf" },
    ],
  },
  {
    title: "Programme of Events — Media Announcement",
    type: "Programme",
    date: "5 March 2026",
    versions: [
      { lang: "EN", label: "English", url: "/docs/programme-events-en.pdf" },
      { lang: "FR", label: "Français", url: "/docs/programme-events-fr.pdf" },
      { lang: "PT", label: "Português", url: "/docs/programme-events-pt.pdf" },
    ],
  },
  {
    title: "Year-Long Commemorative Programme Overview",
    type: "Overview",
    date: "January 2026",
    versions: [
      { lang: "EN", label: "English", url: "/docs/programme-overview-en.pdf" },
      { lang: "FR", label: "Français", url: "/docs/programme-overview-fr.pdf" },
    ],
  },
  {
    title: "Strategic Partnerships Framework",
    type: "Framework",
    date: "February 2026",
    versions: [
      { lang: "EN", label: "English", url: "/docs/partnerships-framework-en.pdf" },
    ],
  },
];

const Documents = () => {
  const { t } = useTranslation();
  const [viewerDoc, setViewerDoc] = useState<{ title: string; url: string } | null>(null);
  const [activeLangs, setActiveLangs] = useState<Record<number, string>>({});

  const getActiveLang = (idx: number, doc: DocEntry) =>
    activeLangs[idx] || doc.versions[0]?.lang || "EN";

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <AnimatedSection>
            <h1 className="text-4xl md:text-5xl font-black">{t("documents.heroTitle")}</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">{t("documents.heroDesc")}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="space-y-4">
            {documents.map((doc, i) => {
              const lang = getActiveLang(i, doc);
              const activeVersion = doc.versions.find(v => v.lang === lang) || doc.versions[0];
              return (
                <AnimatedSection key={i} delay={i * 80}>
                  <div className="p-5 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-card-foreground">{doc.title}</h3>
                        <div className="flex items-center gap-2 mt-1 mb-3">
                          <Badge variant="secondary" className="text-xs">{doc.type}</Badge>
                          <span className="text-xs text-muted-foreground">{doc.date}</span>
                        </div>

                        {/* Language tabs */}
                        <div className="flex items-center flex-wrap gap-1 mb-3">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                          {doc.versions.map(v => (
                            <button
                              key={v.lang}
                              onClick={() => setActiveLangs(prev => ({ ...prev, [i]: v.lang }))}
                              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                                v.lang === lang
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              {v.lang}
                            </button>
                          ))}
                        </div>

                        {/* View button — inline on sm+, below on mobile */}
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-1 w-full sm:hidden"
                          onClick={() => setViewerDoc({ title: `${doc.title} (${lang})`, url: activeVersion.url })}
                        >
                          <Eye className="h-4 w-4" />
                          View Document
                        </Button>
                      </div>

                      {/* View button — hidden on mobile, shown on sm+ */}
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-shrink-0 gap-1 hidden sm:flex"
                        onClick={() => setViewerDoc({ title: `${doc.title} (${lang})`, url: activeVersion.url })}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Document viewer modal */}
      <Dialog open={!!viewerDoc} onOpenChange={() => setViewerDoc(null)}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold pr-8">{viewerDoc?.title}</DialogTitle>
              <Button variant="outline" size="sm" onClick={() => setViewerDoc(null)} className="gap-1">
                <X className="h-3 w-3" />Close
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 px-6 pb-6 min-h-0">
            {viewerDoc && (
              <iframe
                src={viewerDoc.url}
                title={viewerDoc.title}
                className="w-full h-full rounded-lg border border-border bg-muted"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Documents;
