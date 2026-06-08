import { cleanText } from "@/lib/text";
import type { PageSection } from "@/hooks/usePage";
import DynamicForm from "./DynamicForm";

/** Render a CMS section. Maps `kind` → markup. Falls back to generic text. */
export default function SectionRenderer({ section }: { section: PageSection }) {
  const p = section.props ?? {};
  switch (section.kind) {
    case "hero":
      return (
        <section className="relative bg-gradient-hero text-primary-foreground py-20">
          {p.background_image && (
            <img src={p.background_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
          <div className="container relative">
            {p.eyebrow && <p className="uppercase tracking-wide text-xs mb-3 opacity-80">{cleanText(p.eyebrow)}</p>}
            {p.title && <h1 className="text-4xl md:text-6xl font-black">{cleanText(p.title)}</h1>}
            {p.subtitle && <p className="mt-4 text-lg max-w-2xl cms-body">{cleanText(p.subtitle)}</p>}
            {p.cta_label && p.cta_href && (
              <a href={p.cta_href} className="inline-block mt-6 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold">
                {cleanText(p.cta_label)}
              </a>
            )}
          </div>
        </section>
      );
    case "text":
      return (
        <section className="py-12">
          <div className="container max-w-3xl">
            {p.title && <h2 className="text-2xl font-bold mb-4">{cleanText(p.title)}</h2>}
            {p.body && (
              <div
                className="cms-body prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: p.body }}
              />
            )}
          </div>
        </section>
      );
    case "stats":
      return (
        <section className="py-12 bg-muted/20">
          <div className="container grid grid-cols-2 md:grid-cols-4 gap-4">
            {section.items.map((it) => (
              <div key={it.id} className="bg-card border border-border rounded-xl p-5">
                <p className="text-3xl font-black text-primary">{cleanText(it.data.value)}</p>
                <p className="text-xs text-muted-foreground mt-1">{cleanText(it.data.label)}</p>
              </div>
            ))}
          </div>
        </section>
      );
    case "cards":
      return (
        <section className="py-12">
          <div className="container">
            {p.title && <h2 className="text-2xl font-bold mb-6">{cleanText(p.title)}</h2>}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((it) => (
                <div key={it.id} className="bg-card border border-border rounded-xl p-5">
                  {it.image_url && <img src={it.image_url} alt={cleanText(it.data.title)} className="w-full h-40 object-cover rounded-lg mb-3" />}
                  <h3 className="font-bold mb-1">{cleanText(it.data.title)}</h3>
                  <p className="text-sm text-muted-foreground cms-body">{cleanText(it.data.description)}</p>
                  {it.data.href && it.data.cta && (
                    <a href={it.data.href} className="inline-block mt-3 text-primary text-sm font-semibold">
                      {cleanText(it.data.cta)} →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case "gallery":
      return (
        <section className="py-12">
          <div className="container grid grid-cols-2 md:grid-cols-4 gap-3">
            {section.items.map((it) => (
              <img key={it.id} src={it.image_url ?? ""} alt={cleanText(it.data.alt) ?? ""} className="w-full h-40 object-cover rounded-lg" loading="lazy" />
            ))}
          </div>
        </section>
      );
    case "cta":
      return (
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center max-w-2xl">
            {p.title && <h2 className="text-3xl font-black">{cleanText(p.title)}</h2>}
            {p.subtitle && <p className="mt-3 cms-body opacity-90">{cleanText(p.subtitle)}</p>}
            {p.cta_label && p.cta_href && (
              <a href={p.cta_href} className="inline-block mt-6 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold">
                {cleanText(p.cta_label)}
              </a>
            )}
          </div>
        </section>
      );
    case "form":
      return (
        <section className="py-12">
          <div className="container max-w-2xl">
            {p.title && <h2 className="text-2xl font-bold mb-2">{cleanText(p.title)}</h2>}
            {p.subtitle && <p className="text-sm text-muted-foreground mb-6 cms-body">{cleanText(p.subtitle)}</p>}
            <DynamicForm slug={p.form_slug} hideHeader />
          </div>
        </section>
      );
    case "html":
      return (
        <section className="py-8">
          <div className="container cms-body" dangerouslySetInnerHTML={{ __html: p.body ?? "" }} />
        </section>
      );
    default:
      return null;
  }
}