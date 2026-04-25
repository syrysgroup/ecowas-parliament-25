import { getCommitteesForProgramme, type MemberPosition } from "@/data/committees";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface Props {
  programmeSlug: string;
}

const POSITION_STYLES: Record<MemberPosition, string> = {
  "Chairman":        "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Vice Chairman":   "bg-slate-100 text-slate-700 border-slate-200",
  "1st Rapporteur":  "bg-blue-100 text-blue-700 border-blue-200",
  "2nd Rapporteur":  "bg-blue-50 text-blue-600 border-blue-100",
  "Member":          "bg-muted text-muted-foreground border-border",
};

export default function CommitteeStakeholders({ programmeSlug }: Props) {
  const committees = getCommitteesForProgramme(programmeSlug);
  if (committees.length === 0) return null;

  const isJoint = committees.length > 1;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <AnimatedSection className="mb-10">
          <Badge variant="secondary" className="mb-3">
            {isJoint ? "Joint Committee" : "Committee Stakeholders"}
          </Badge>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {isJoint
                ? committees.map((c) => c.name).join(" & ")
                : committees[0].name}
            </h2>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Parliamentary committee members overseeing this programme
          </p>
        </AnimatedSection>

        {committees.map((committee, ci) => (
          <div key={committee.id} className={ci > 0 ? "mt-10" : undefined}>
            {isJoint && (
              <AnimatedSection className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  {committee.name}
                </p>
              </AnimatedSection>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {committee.members.map((member, mi) => (
                <AnimatedSection key={mi} delay={mi * 50}>
                  <Card className="h-full hover:shadow-md transition-shadow duration-300">
                    <CardContent className="pt-5 pb-4">
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border mb-3 ${POSITION_STYLES[member.position]}`}
                      >
                        {member.position}
                      </span>
                      <p className="font-semibold text-sm text-card-foreground leading-snug">
                        {member.name}
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
