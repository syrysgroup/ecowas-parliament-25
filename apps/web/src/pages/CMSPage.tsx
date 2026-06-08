import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import SectionRenderer from "@/components/cms/SectionRenderer";
import { usePage } from "@/hooks/usePage";

/**
 * Generic admin-driven page. Any page row in `pages` (status='published')
 * becomes browsable at /p/<slug>. Lets admins create new pages from CRM
 * with no developer change.
 */
export default function CMSPage() {
 const { slug = "" } = useParams();
 const { data: page, isLoading } = usePage(slug);

 if (isLoading) {
 return (
 <Layout>
 <div className="container py-20 text-center text-muted-foreground">Loading…</div>
 </Layout>
 );
 }

 if (!page) {
 return (
 <Layout>
 <div className="container py-20 text-center">
 <h1 className="text-3xl font-bold mb-2">Page not found</h1>
 <p className="text-muted-foreground">The page “{slug}” is not published.</p>
 </div>
 </Layout>
 );
 }

 return (
 <Layout>
 <SEOHead
 title={page.title}
 description={page.description ?? undefined}
 image={page.og_image ?? undefined}
 />
 {page.sections.map((s) => (
 <SectionRenderer key={s.id} section={s} />
 ))}
 </Layout>
 );
}
