import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import teamPortrait1 from "@/assets/team-portrait-1.jpg";
import teamPortrait2 from "@/assets/team-portrait-2.jpg";
import teamPortrait3 from "@/assets/team-portrait-3.jpg";
import teamPortrait4 from "@/assets/team-portrait-4.jpg";
import representative1 from "@/assets/representative-1.jpg";
import representative2 from "@/assets/representative-2.jpg";
import representative3 from "@/assets/representative-3.jpg";
import representative4 from "@/assets/representative-4.jpg";
import { Badge } from "@/components/ui/badge";

const departments = [
  {
    name: "Executive leadership",
    members: [
      { name: "Dr. Victoria Akai IIPM", role: "Programme Director", org: "Duchess NL", image: teamPortrait1 },
      { name: "Dr. Olori Boye-Ajayi", role: "Regional Strategy Lead", org: "Borderless Trade & Investment", image: teamPortrait2 },
      { name: "Madam Cecile Mambo Doumbe", role: "Operations Lead", org: "CMD Tourism & Trade Enterprises", image: teamPortrait3 },
      { name: "Amina Toure", role: "Stakeholder Relations Director", org: "Regional Partnerships Desk", image: teamPortrait4 },
    ],
  },
  {
    name: "Programme delivery",
    members: [
      { name: "Temile Emmanuel", role: "Parliament Programme Manager", org: "Youth Parliament Secretariat", image: representative2 },
      { name: "Nene Coker", role: "Community Mobilisation Lead", org: "National Outreach Unit", image: representative3 },
      { name: "Joseph Toe", role: "Monitoring & Learning Manager", org: "Programme Quality Unit", image: representative4 },
      { name: "Aissatou Mensah", role: "Volunteer Network Coordinator", org: "Regional Volunteer Corps", image: representative1 },
    ],
  },
  {
    name: "Communications and media",
    members: [
      { name: "Fatou Sarr", role: "Creative Content Lead", org: "Communications Studio", image: teamPortrait4 },
      { name: "Moussa Diallo", role: "Press & Editorial Coordinator", org: "Media Relations", image: teamPortrait2 },
      { name: "Elena Doe", role: "Digital Campaign Manager", org: "Audience Growth Desk", image: teamPortrait1 },
      { name: "Kossi Amouzou", role: "Visual Storytelling Producer", org: "Parliament Media Lab", image: teamPortrait3 },
    ],
  },
];

const Team = () => {
  return (
    <Layout>
      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="container">
          <AnimatedSection>
            <Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">Expanded Team</Badge>
            <h1 className="mt-4 text-4xl font-black md:text-5xl">Implementation Team</h1>
            <p className="mt-4 max-w-3xl text-lg text-primary-foreground/75">
              A larger cross-functional team now powers stakeholder engagement, parliament operations, communications, curation, and delegate support across the ECOWAS commemorative programme.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container space-y-14">
          {departments.map((department, departmentIndex) => (
            <div key={department.name}>
              <AnimatedSection>
                <h2 className="text-2xl font-black text-foreground">{department.name}</h2>
              </AnimatedSection>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {department.members.map((member, index) => (
                  <AnimatedSection key={member.name} delay={(departmentIndex * 4 + index) * 50}>
                    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-transform duration-300 hover:-translate-y-1">
                      <img src={member.image} alt={member.name} className="aspect-[4/4.4] w-full object-cover" loading="lazy" />
                      <div className="p-5">
                        <h3 className="text-lg font-black text-card-foreground">{member.name}</h3>
                        <p className="text-sm text-primary">{member.role}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{member.org}</p>
                      </div>
                    </article>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Team;
