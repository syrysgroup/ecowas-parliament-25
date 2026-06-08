import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import DynamicForm from "@/components/cms/DynamicForm";

/** Generic standalone page for any admin-defined form. */
export default function CMSForm() {
 const { slug = "" } = useParams();
 return (
 <Layout>
 <SEOHead title={slug} />
 <section className="py-16">
 <div className="container max-w-2xl">
 <DynamicForm slug={slug} />
 </div>
 </section>
 </Layout>
 );
}
