import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const documents = [
  { title: "Press Release — 25th Anniversary Programme Launch", type: "Press Release", date: "2 March 2026", size: "120 KB" },
  { title: "ECOWAS Vision 2050 Document", type: "Policy Document", date: "2023", size: "2.4 MB" },
  { title: "Programme of Events — Media Announcement", type: "Programme", date: "5 March 2026", size: "85 KB" },
  { title: "Year-Long Commemorative Programme Overview", type: "Overview", date: "January 2026", size: "340 KB" },
  { title: "Strategic Partnerships Framework", type: "Framework", date: "February 2026", size: "210 KB" },
];

const Documents = () => {
  return (
    <Layout>
      <section className="relative bg-gradient-hero text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('/announcement/19.jpg')" }} />
        <div className="container relative">
          <AnimatedSection>
            <h1 className="text-4xl md:text-5xl font-black">Documents & Reports</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              Access official documents, reports, and publications from the programme.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="space-y-4">
            {documents.map((doc, i) => (
              <AnimatedSection key={i} delay={i * 80}>
                <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-card-foreground truncate">{doc.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{doc.type}</Badge>
                      <span className="text-xs text-muted-foreground">{doc.date}</span>
                      <span className="text-xs text-muted-foreground">· {doc.size}</span>
                    </div>
                  </div>
                  <Button size="sm" className="flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Documents;
