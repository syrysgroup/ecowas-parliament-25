import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMember {
  id: string;
  full_name: string;
  title: string | null;
  organisation: string | null;
  avatar_url: string | null;
  bio: string | null;
  display_order?: number;
  category?: string;
  source: "profile" | "manual";
}

const CATEGORY_ORDER = ["leadership", "implementing_team", "consultant", "volunteer"] as const;

const Team = () => {
  const { t } = useTranslation();

  // Auth users who toggled show_on_website = true in their CRM profile
  const { data: profileMembers = [], isLoading: loadingProfiles } = useQuery<TeamMember[]>({
    queryKey: ["team-members-profiles"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, title, organisation, avatar_url, bio")
        .eq("show_on_website", true)
        .order("full_name");
      if (error) throw error;
      return (data ?? []).map((m: any) => ({ ...m, source: "profile" as const, category: "implementing_team" }));
    },
  });

  // Manually added team members (external people, no login required)
  const { data: manualMembers = [], isLoading: loadingManual } = useQuery<TeamMember[]>({
    queryKey: ["team-members-manual"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("team_members")
        .select("id, full_name, title, organisation, avatar_url, bio, display_order, category")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return (data ?? []).map((m: any) => ({ ...m, source: "manual" as const }));
    },
  });

  const isLoading = loadingProfiles || loadingManual;
  const allMembers: TeamMember[] = [...manualMembers, ...profileMembers];

  // Group by category
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = allMembers.filter(m => (m.category ?? "implementing_team") === cat);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  const categoryLabel = (cat: string) => {
    switch (cat) {
      case "leadership": return t("team.leadership");
      case "implementing_team": return t("team.implementingTeam");
      case "consultant": return t("team.consultants");
      case "volunteer": return t("team.volunteers");
      default: return cat;
    }
  };

  const renderMemberCard = (member: TeamMember, index: number) => (
    <AnimatedSection key={member.id} delay={index * 50}>
      <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-transform duration-300 hover:-translate-y-1">
        <div className="aspect-[4/4.4] w-full bg-muted flex items-center justify-center">
          {member.avatar_url ? (
            <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span className="text-4xl font-black text-muted-foreground/30">
              {member.full_name.charAt(0)}
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-black text-card-foreground">{member.full_name}</h3>
          {member.title && <p className="text-sm text-primary">{member.title}</p>}
          {member.organisation && <p className="mt-1 text-sm text-muted-foreground">{member.organisation}</p>}
          {member.bio && <p className="mt-2 text-xs text-muted-foreground/70 leading-relaxed line-clamp-3">{member.bio}</p>}
        </div>
      </article>
    </AnimatedSection>
  );

  return (
    <Layout>
      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="container">
          <AnimatedSection>
            <Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">{t("team.badge")}</Badge>
            <h1 className="mt-4 text-4xl font-black md:text-5xl">{t("team.heroTitle")}</h1>
            <p className="mt-4 max-w-3xl text-lg text-primary-foreground/75">{t("team.heroDesc")}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-border bg-card overflow-hidden">
                  <Skeleton className="aspect-[4/4.4] w-full" />
                  <div className="p-5 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : allMembers.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Team members will be announced soon.</p>
          ) : (
            <div className="space-y-12">
              {CATEGORY_ORDER.map(cat => {
                const members = grouped[cat];
                if (!members || members.length === 0) return null;
                return (
                  <div key={cat}>
                    <AnimatedSection>
                      <h2 className="text-2xl font-black text-foreground mb-6">{categoryLabel(cat)}</h2>
                    </AnimatedSection>
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                      {members.map((member, index) => renderMemberCard(member, index))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Team;
