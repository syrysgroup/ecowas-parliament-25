import { useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, Clock, Users, TrendingUp, Calendar, MessageSquare,
  FileText, AlertTriangle, Star, Video, Bell, ChevronRight,
  Briefcase, Globe, Award, BookOpen, Mic, Palette, ShoppingBag,
  Plus, ArrowRight, Eye, Download, Send,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Priority = "critical" | "high" | "medium" | "low";
type TaskStatus = "backlog" | "in-progress" | "review" | "done";
type Tab = "overview" | "tasks" | "calendar" | "comms" | "sponsors" | "documents";

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  programme: string;
  assignee: string;
  assigneeInitials: string;
  due?: string;
  overdue?: boolean;
}

interface Meeting {
  title: string;
  date: string;
  time: string;
  attendees: string;
  meetLink: string;
  colour: string;
  badge?: string;
}

interface SponsorEntry {
  name: string;
  tier: "gold" | "silver" | "bronze";
  focus: string;
  status: "active" | "pending" | "review";
  impressions?: number;
  placements?: number;
  mentions?: number;
  note?: string;
}

interface DocEntry {
  id: string;
  title: string;
  type: string;
  date: string;
  size: string;
  category: string;
  restricted?: boolean;
  preview: { tag: string; heading: string; body: string };
}

// ─── Data ────────────────────────────────────────────────────────────────────
const tasks: Task[] = [
  { id:"t1",  title:"Trade Forum venue contracts — Abuja",              status:"in-progress", priority:"critical", programme:"Trade",       assignee:"Chidi Nwosu",    assigneeInitials:"CN", due:"30 Mar", overdue:false },
  { id:"t2",  title:"Update News — Trade Forum March recap",            status:"in-progress", priority:"critical", programme:"Website",     assignee:"Ngozi Eze",      assigneeInitials:"NE", due:"28 Mar", overdue:true  },
  { id:"t3",  title:"Women's Forum keynote speaker proposals",          status:"in-progress", priority:"high",     programme:"Women",       assignee:"Fatima Diallo",  assigneeInitials:"FD", due:"4 Apr"               },
  { id:"t4",  title:"Q1 financial reconciliation report",               status:"in-progress", priority:"high",     programme:"Finance",     assignee:"Emeka Obi",      assigneeInitials:"EO", due:"31 Mar"              },
  { id:"t5",  title:"Portuguese translation — all programme materials", status:"in-progress", priority:"medium",   programme:"Comms",       assignee:"Ibrahim Traore", assigneeInitials:"IT", due:"10 Apr"              },
  { id:"t6",  title:"Civic Education page draft",                       status:"in-progress", priority:"medium",   programme:"Civic",       assignee:"Aissatou Balde", assigneeInitials:"AB", due:"15 Apr"              },
  { id:"t7",  title:"Youth Parliament agenda — final draft",            status:"review",      priority:"high",     programme:"Youth Parl",  assignee:"Kwame Asante",   assigneeInitials:"KA", due:"Review"              },
  { id:"t8",  title:"AfDB Gold sponsorship agreement sign-off",         status:"review",      priority:"critical", programme:"Sponsors",    assignee:"Mariama Camara", assigneeInitials:"MC", due:"1 Apr"               },
  { id:"t9",  title:"Youth Innovation page — delegate profiles",        status:"review",      priority:"medium",   programme:"Website",     assignee:"Ngozi Eze",      assigneeInitials:"NE"                            },
  { id:"t10", title:"Multilingual content audit (FR/PT/EN)",           status:"backlog",     priority:"high",     programme:"Comms",       assignee:"Unassigned",     assigneeInitials:"?"                             },
  { id:"t11", title:"Event RSVP & attendance tracking system",         status:"backlog",     priority:"high",     programme:"Tech",        assignee:"Moussa Coulibaly",assigneeInitials:"MO"                           },
  { id:"t12", title:"Contact page — CRITICAL MISSING",                 status:"backlog",     priority:"critical", programme:"Website",     assignee:"Ngozi Eze",      assigneeInitials:"NE"                            },
  { id:"t13", title:"Press & media kit page",                          status:"backlog",     priority:"high",     programme:"Website",     assignee:"Unassigned",     assigneeInitials:"?"                             },
  { id:"t14", title:"Newsletter subscriber capture",                   status:"backlog",     priority:"high",     programme:"Website",     assignee:"Unassigned",     assigneeInitials:"?"                             },
  { id:"t15", title:"Q2 sponsor impact report template",               status:"backlog",     priority:"high",     programme:"Sponsors",    assignee:"Mariama Camara", assigneeInitials:"MC"                            },
  { id:"t16", title:"Press release — programme launch",                status:"done",        priority:"medium",   programme:"Comms",       assignee:"Ibrahim Traore", assigneeInitials:"IT", due:"5 Mar"               },
  { id:"t17", title:"12-country invitation letters",                   status:"done",        priority:"high",     programme:"Admin",       assignee:"Awa Sow",        assigneeInitials:"AS", due:"1 Mar"               },
  { id:"t18", title:"Parliamentary Awards page published",             status:"done",        priority:"medium",   programme:"Website",     assignee:"Seun Adesanya",  assigneeInitials:"SA", due:"15 Mar"              },
  { id:"t19", title:"Supabase RLS policy review",                      status:"done",        priority:"high",     programme:"Tech",        assignee:"Moussa Coulibaly",assigneeInitials:"MO", due:"14 Mar"             },
  { id:"t20", title:"Sponsor logos — asset library",                   status:"done",        priority:"medium",   programme:"Sponsors",    assignee:"Mariama Camara", assigneeInitials:"MC", due:"10 Mar"              },
];

const meetings: Meeting[] = [
  { title:"Steering Committee Call",         date:"27 Mar", time:"14:00–15:00 WAT", attendees:"Full team",             meetLink:"https://meet.google.com", colour:"bg-primary",           badge:"Today"  },
  { title:"Youth Programme Planning",        date:"29 Mar", time:"10:00–11:00 WAT", attendees:"K. Asante + Youth team", meetLink:"https://meet.google.com", colour:"bg-blue-600"                         },
  { title:"Q1 Financial Report Deadline",    date:"31 Mar", time:"All-day",          attendees:"Finance team",           meetLink:"",                        colour:"bg-destructive",       badge:"Deadline"},
  { title:"AfDB Sponsor Touchpoint",         date:"1 Apr",  time:"11:00–12:00 WAT", attendees:"M. Camara + AfDB",       meetLink:"https://meet.google.com", colour:"bg-amber-500"                        },
  { title:"Editorial Board Review",          date:"2 Apr",  time:"09:00–10:00 WAT", attendees:"Website editors",        meetLink:"https://meet.google.com", colour:"bg-violet-600"                       },
  { title:"Women's Forum Planning",          date:"4 Apr",  time:"14:00–15:30 WAT", attendees:"F. Diallo + speakers",   meetLink:"https://meet.google.com", colour:"bg-destructive"                      },
];

const sponsors: SponsorEntry[] = [
  { name:"African Development Bank (AfDB)",    tier:"gold",   focus:"All 7 programme areas · 3 logo placements",          status:"pending",  impressions:47200, placements:12, mentions:8,  note:"Agreement pending signature — due 1 Apr" },
  { name:"European Union — ECOWAS Delegation", tier:"gold",   focus:"Democracy & governance · Youth + Civic + Awards",    status:"active",   impressions:38900, placements:9,  mentions:5  },
  { name:"UNDP West Africa",                   tier:"silver", focus:"Women + Youth · 2 logo placements",                  status:"active",   impressions:21100, placements:6,  mentions:3  },
  { name:"UN Women — West Africa",             tier:"silver", focus:"Women's Empowerment · Speaking slot",                status:"active",   impressions:18700, placements:5,  mentions:4  },
  { name:"Duchess International",              tier:"silver", focus:"Culture & Awards · Agreement under discussion",      status:"pending",  note:"Awaiting signed term sheet — follow up 31 Mar" },
  { name:"USAID West Africa Bureau",           tier:"silver", focus:"Civic Education + Trade · In internal review",      status:"review",   note:"USAID reviewing Q1 outcomes before confirming — ETA 5 Apr" },
  { name:"CMD Communications",                 tier:"bronze", focus:"Media partner · Digital & press coverage",           status:"active"   },
  { name:"Borderless Trade Alliance",          tier:"bronze", focus:"Trade programme · SME networking",                  status:"active"   },
];

const docs: DocEntry[] = [
  {
    id:"pr", title:"Press Release — 25th Anniversary Launch", type:"PDF", date:"2 Mar 2026", size:"120 KB", category:"Comms",
    preview:{
      tag:"Press Release · For Immediate Release · 2 March 2026",
      heading:"ECOWAS Parliament Launches Year-Long 25th Anniversary Commemorative Programme",
      body:`Abuja, 2 March 2026 — The ECOWAS Parliament has officially launched a comprehensive year-long programme marking its 25th anniversary. Spanning all 12 member states and seven programme pillars, the initiative will mobilise youth leaders, trade practitioners, women entrepreneurs, and civic educators across West Africa throughout 2026.\n\nThe programme — titled "25 Years of Parliamentary Democracy in West Africa" — features the Youth Innovation Summit, Trade & SME Forums, Women's Empowerment Platform, Cultural Festivals, Civic Education campaigns, the inaugural Parliamentary Excellence Awards, and the flagship Youth Parliament Simulation. Events will take place across Abuja, Accra, Dakar, Lagos, and additional national capitals.\n\nThe programme is supported by the African Development Bank, the European Union, UNDP, UN Women, and a growing consortium of regional partners.`,
    }
  },
  {
    id:"vision", title:"ECOWAS Vision 2050 Document", type:"PDF", date:"2023", size:"2.4 MB", category:"Reference",
    preview:{
      tag:"Policy Document · ECOWAS Commission · 2023",
      heading:"ECOWAS Vision 2050: Towards a Prosperous and Peaceful West Africa",
      body:`The ECOWAS Vision 2050 articulates the community's long-term aspirations across four strategic pillars: a prosperous West Africa; a united and cohesive region; a politically stable, democratic, and well-governed community; and a peaceful and secure West Africa free from violence.\n\nThis document serves as the strategic reference framework for all 2026 anniversary programming. Each programme pillar maps directly to one or more Vision 2050 objectives, ensuring the commemorative year drives real regional impact rather than ceremony.\n\nKey themes include the free movement of people and goods, democratic consolidation, gender equality, youth employment, and the digital transformation of West African institutions.`,
    }
  },
  {
    id:"prog", title:"Programme of Events — Media Announcement", type:"PDF", date:"5 Mar 2026", size:"85 KB", category:"Comms",
    preview:{
      tag:"Programme · 5 March 2026",
      heading:"Programme of Events — 25th Anniversary Media Announcement",
      body:`This document outlines the full schedule of events for the ECOWAS Parliament 25th Anniversary year. Events span all 12 member states from January through December 2026. Flagship moments include the Opening Ceremony (Abuja, March), Youth Innovation Summit (Accra, May), Trade Forums (Lagos/Dakar, June), Women's Forum (Freetown, July), Cultural Festivals (August–September), and the Anniversary Gala (Abuja, December).\n\nAll events are open to media accreditation. Photography guidelines and interview requests should be directed to the Communications Director. Event registration links will be published on the official website.`,
    }
  },
  {
    id:"budget", title:"Q1 Financial Report & Budget Tracking", type:"XLS", date:"Mar 2026", size:"245 KB", category:"Finance", restricted:true,
    preview:{
      tag:"Restricted · Finance Team · March 2026",
      heading:"Q1 Financial Report & Budget Tracking",
      body:"Q1 budget reconciliation covering Jan–Mar 2026 programme expenditure across all 7 programme areas. Includes actuals vs. projections, sponsor income received, and outstanding commitments. Access restricted to Finance team and Director level.",
    }
  },
  {
    id:"partner", title:"Strategic Partnerships Framework", type:"PDF", date:"Feb 2026", size:"210 KB", category:"Sponsors",
    preview:{
      tag:"Internal Framework · February 2026 · Sponsor Team",
      heading:"Strategic Partnerships Framework — Sponsorship Tiers & Benefits",
      body:`This framework governs all sponsor engagements for the 25th Anniversary Programme. It defines Gold, Silver, and Bronze tier benefits including logo placements, speaking slots, co-branding rights, delegate list access (subject to consent), and the quarterly impact reporting cadence.\n\nAll sponsors receive access to a dedicated Sponsor Portal showing real-time visibility metrics, event placement confirmations, and audience reach data. Quarterly touchpoint meetings via Google Meet are scheduled for all Gold and Silver sponsors.`,
    }
  },
  {
    id:"youth-rules", title:"Youth Parliament Rules of Procedure", type:"DOC", date:"Mar 2026", size:"180 KB", category:"Youth Parl",
    preview:{
      tag:"Youth Parliament · Rules of Procedure · March 2026",
      heading:"Youth Parliament Simulation — Rules of Procedure",
      body:"The Rules of Procedure govern all aspects of the Youth Parliament Simulation including delegate accreditation, committee formation, debate procedure, resolution drafting, voting rules, and appeals. The simulation is modelled on the actual ECOWAS Parliament rules with modifications appropriate for youth delegates aged 18–30 from all 12 member states.",
    }
  },
  {
    id:"sponsor-pack", title:"Sponsor Visibility Package — Gold Tier", type:"PDF", date:"Feb 2026", size:"1.2 MB", category:"Sponsors",
    preview:{
      tag:"Sponsor Package · Gold Tier · February 2026",
      heading:"ECOWAS Parliament 25th Anniversary — Gold Sponsor Visibility Package",
      body:"The Gold Sponsor package provides the highest level of visibility across all programme materials, website, events, and media coverage. Benefits include: primary logo placement on homepage and all programme pages; speaking opportunity at minimum 3 flagship events; co-branded press releases; dedicated sponsor spotlight section; monthly impact reports; and exclusive invitation to the December Gala Dinner.",
    }
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const priorityConfig: Record<Priority, { label: string; class: string }> = {
  critical: { label:"Critical", class:"bg-destructive/10 text-destructive" },
  high:     { label:"High",     class:"bg-amber-100 text-amber-800"        },
  medium:   { label:"Medium",   class:"bg-blue-100 text-blue-700"          },
  low:      { label:"Low",      class:"bg-muted text-muted-foreground"     },
};

const tierConfig = {
  gold:   { label:"Gold",   class:"bg-amber-100 text-amber-800",  accent:"border-l-amber-400"  },
  silver: { label:"Silver", class:"bg-slate-100 text-slate-700",  accent:"border-l-slate-400"  },
  bronze: { label:"Bronze", class:"bg-orange-100 text-orange-800",accent:"border-l-orange-400" },
};

const statusDot: Record<string, string> = {
  active:  "bg-primary",
  pending: "bg-amber-400",
  review:  "bg-blue-500",
};

function AvatarChip({ initials, colour = "bg-primary/10 text-primary" }: { initials: string; colour?: string }) {
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${colour}`}>
      {initials}
    </span>
  );
}

function TaskCard({ task }: { task: Task }) {
  const p = priorityConfig[task.priority];
  return (
    <div className={`bg-card border rounded-lg p-3 mb-2 hover:shadow-sm transition-shadow ${task.overdue ? "border-destructive/30" : "border-border"}`}>
      <p className="text-sm font-medium text-card-foreground leading-snug mb-2">{task.title}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.class}`}>{p.label}</span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{task.programme}</span>
        <AvatarChip initials={task.assigneeInitials} />
      </div>
      {task.due && (
        <p className={`text-[11px] mt-2 flex items-center gap-1 ${task.overdue ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
          {task.overdue ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {task.overdue ? `Overdue — was due ${task.due}` : `Due ${task.due}`}
        </p>
      )}
    </div>
  );
}

const programmeProgress = [
  { label:"Youth Innovation",            pct:52, icon:Star       },
  { label:"Trade & SME Forums",          pct:41, icon:ShoppingBag},
  { label:"Women's Empowerment",         pct:35, icon:Award      },
  { label:"Civic Education",             pct:28, icon:BookOpen   },
  { label:"Culture & Creativity",        pct:22, icon:Palette    },
  { label:"Parliamentary Awards",        pct:60, icon:Award      },
  { label:"Youth Parliament Simulation", pct:45, icon:Mic        },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProjectDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [activeDoc, setActiveDoc] = useState<string>("pr");
  const [commsTab, setCommsTab] = useState<"announcements"|"activity"|"mentions">("announcements");
  const [dmOpen, setDmOpen] = useState(false);

  const byStatus = useMemo(() => ({
    backlog:     tasks.filter(t => t.status === "backlog"),
    "in-progress": tasks.filter(t => t.status === "in-progress"),
    review:      tasks.filter(t => t.status === "review"),
    done:        tasks.filter(t => t.status === "done"),
  }), []);

  const activeDocData = docs.find(d => d.id === activeDoc);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id:"overview",   label:"Overview",         icon:TrendingUp    },
    { id:"tasks",      label:"Task Board",        icon:CheckCircle2  },
    { id:"calendar",   label:"Calendar",          icon:Calendar      },
    { id:"comms",      label:"Communications",    icon:MessageSquare },
    { id:"sponsors",   label:"Sponsor Portal",    icon:Star          },
    { id:"documents",  label:"Documents",         icon:FileText      },
  ];

  return (
    <Layout>
      {/* Page hero */}
      <section className="bg-gradient-hero text-primary-foreground py-14">
        <div className="container">
          <AnimatedSection>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">
              Project Command Centre
            </Badge>
            <h1 className="text-3xl md:text-4xl font-black">25th Anniversary — Management Dashboard</h1>
            <p className="mt-3 text-primary-foreground/70 max-w-2xl">
              Task board · Sponsor portal · Calendar · Communications · Document preview. One place for the entire team and sponsors.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div className="container py-6">
        {/* Tab bar */}
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto pb-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ══════════ OVERVIEW ══════════ */}
        {activeTab === "overview" && (
          <AnimatedSection>
            {/* Alert */}
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <Bell className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Today — 27 March 2026:</strong> Steering Committee at 14:00 WAT today ·{" "}
                <span className="underline cursor-pointer" onClick={() => setActiveTab("calendar")}>Join Google Meet →</span>
                &nbsp;·&nbsp; AfDB agreement pending signature &nbsp;·&nbsp; 2 overdue tasks
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label:"Active tasks",            value:"47",  delta:"12 due this week · 2 overdue",  colour:"text-primary"     },
                { label:"Team members",             value:"14",  delta:"4 open positions",               colour:""                 },
                { label:"Sponsors onboarded",       value:"8",   delta:"3 Gold · 3 Silver · 2 Bronze",  colour:"text-amber-600"   },
                { label:"Overall progress",         value:"38%", delta:"Q1 complete · Jan–Dec 2026",    colour:""                 },
              ].map(s => (
                <Card key={s.label} className="border-border">
                  <CardContent className="pt-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{s.label}</p>
                    <p className={`text-3xl font-black ${s.colour}`}>{s.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{s.delta}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Programme progress */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Programme progress</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {programmeProgress.map(({ label, pct, icon: Icon }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-2 text-sm">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                          {label}
                        </span>
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-4">
                {/* Upcoming meetings */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Upcoming meetings</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {meetings.slice(0, 4).map(m => (
                      <div key={m.title} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium">{m.title}</p>
                          <p className="text-xs text-muted-foreground">{m.date} · {m.time}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {m.badge && <Badge className="text-[10px]" variant={m.badge === "Today" ? "default" : "outline"}>{m.badge}</Badge>}
                          {m.meetLink && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
                              <a href={m.meetLink} target="_blank" rel="noreferrer">
                                <Video className="h-3 w-3" /> Join
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick actions */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Quick actions</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label:"+ Assign task",       tab:"tasks"    as Tab },
                        { label:"📅 Schedule meeting", tab:"calendar" as Tab },
                        { label:"📄 Upload document",  tab:"documents"as Tab },
                        { label:"🤝 Invite sponsor",   tab:"sponsors" as Tab },
                        { label:"📣 Announcement",     tab:"comms"    as Tab },
                      ].map(a => (
                        <Button key={a.label} size="sm" variant="outline" className="text-xs h-7"
                          onClick={() => setActiveTab(a.tab)}>
                          {a.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* ══════════ TASK BOARD ══════════ */}
        {activeTab === "tasks" && (
          <AnimatedSection>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Task Board</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {tasks.length} tasks · Assign, track, and resolve across all 7 programme areas
                </p>
              </div>
              <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> New task</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {(["backlog","in-progress","review","done"] as TaskStatus[]).map(col => {
                const titles: Record<TaskStatus, string> = {
                  backlog:"Backlog", "in-progress":"In Progress", review:"In Review", done:"Done",
                };
                const colours: Record<TaskStatus, string> = {
                  backlog:"text-muted-foreground", "in-progress":"text-blue-600", review:"text-amber-600", done:"text-primary",
                };
                return (
                  <div key={col} className="bg-muted/40 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold uppercase tracking-wide ${colours[col]}`}>{titles[col]}</span>
                      <Badge variant="outline" className="text-[10px]">{byStatus[col].length}</Badge>
                    </div>
                    {byStatus[col].map(t => <TaskCard key={t.id} task={t} />)}
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        )}

        {/* ══════════ CALENDAR ══════════ */}
        {activeTab === "calendar" && (
          <AnimatedSection>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Calendar & Meetings</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Google Meet sync · All times in West Africa Time (WAT, UTC+1)</p>
              </div>
              <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Schedule meeting</Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Mini calendar */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">March 2026</CardTitle>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-xs">◀ Feb</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs">Apr ▶</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-muted-foreground mb-2">
                    {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({length:31},(_,i)=>i+1).map(d => {
                      const hasEvent = [7,10,14,17,21,24,27,28,29,31].includes(d);
                      const isToday  = d === 27;
                      return (
                        <div key={d}
                          className={`min-h-[36px] rounded-md text-xs flex flex-col items-center pt-1 cursor-pointer transition-colors ${
                            isToday ? "bg-primary text-primary-foreground font-bold" :
                            "hover:bg-muted"
                          }`}>
                          {d}
                          {hasEvent && !isToday && (
                            <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Meeting list */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">Scheduled events</p>
                {meetings.map(m => (
                  <div key={m.title} className={`border-l-4 ${m.colour.replace("bg-","border-l-")} border border-border rounded-xl p-3`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{m.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{m.date} · {m.time}</p>
                        <p className="text-xs text-muted-foreground">{m.attendees}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {m.badge && (
                          <Badge variant={m.badge === "Today" ? "default" : "destructive"} className="text-[10px]">{m.badge}</Badge>
                        )}
                        {m.meetLink && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
                            <a href={m.meetLink} target="_blank" rel="noreferrer">
                              <Video className="h-3 w-3" /> Join Meet
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                  <strong>Recurring:</strong> Steering Committee (Mon weekly) · Editorial (Wed weekly) · Sponsor Touchpoint (1st Tue monthly) · Youth planning (Thu weekly) · All-team standup (Fri 09:00 WAT)
                </p>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* ══════════ COMMUNICATIONS ══════════ */}
        {activeTab === "comms" && (
          <AnimatedSection>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Communications</h2>
              <Button size="sm" className="gap-1"><Send className="h-3.5 w-3.5" /> Post announcement</Button>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-1 border-b border-border mb-4">
              {(["announcements","activity","mentions"] as const).map(t => (
                <button key={t} onClick={() => setCommsTab(t)}
                  className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                    commsTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}>
                  {t === "announcements" ? "📣 Announcements" : t === "activity" ? "⚡ Activity feed" : "@ Mentions"}
                </button>
              ))}
            </div>

            {commsTab === "announcements" && (
              <div className="grid md:grid-cols-2 gap-5">
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    {[
                      { init:"AO", colour:"bg-primary/10 text-primary",      name:"Adaora Okafor",   time:"Today 09:15",  tag:"All Team",     tagClass:"bg-destructive/10 text-destructive",  msg:"Steering Committee at 14:00 WAT today. Please have programme updates ready. Q1 closure items will be discussed — financial reconciliation and Trade Forum contracts." },
                      { init:"MC", colour:"bg-rose-100 text-rose-700",        name:"Mariama Camara",  time:"Yesterday",    tag:"Sponsor Team", tagClass:"bg-amber-100 text-amber-700",         msg:"AfDB has confirmed Gold tier commitment. Agreement in legal review. Logo placements go live once signed — expected 1 April announcement." },
                      { init:"IT", colour:"bg-violet-100 text-violet-700",    name:"Ibrahim Traore",  time:"25 Mar 11:00", tag:"All Team",     tagClass:"bg-blue-100 text-blue-700",           msg:"French translations complete. Press release and programme overview uploaded to Documents. Portuguese versions due 10 April — translator assigned." },
                      { init:"MO", colour:"bg-blue-100 text-blue-700",        name:"Moussa Coulibaly",time:"24 Mar 14:00", tag:"Tech Team",    tagClass:"bg-blue-100 text-blue-700",           msg:"Supabase RSVP + media_uploads migration deployed to staging. All editors: please test the new CMS upload flow before Friday." },
                    ].map(a => (
                      <div key={a.name} className="flex gap-3">
                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold flex-shrink-0 ${a.colour}`}>{a.init}</span>
                        <div>
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <span className="text-sm font-semibold">{a.name}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.tagClass}`}>{a.tag}</span>
                            <span className="text-xs text-muted-foreground">{a.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{a.msg}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm">Direct messages</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { init:"KA", col:"bg-blue-100 text-blue-700",       name:"Kwame Asante",    preview:"Agenda ready for director review...",  badge:2, badgeClass:"bg-destructive" },
                        { init:"NE", col:"bg-primary/10 text-primary",      name:"Ngozi Eze",       preview:"Trade page ready for your review",     badge:1, badgeClass:"bg-amber-500"   },
                        { init:"EO", col:"bg-amber-100 text-amber-700",     name:"Emeka Obi",       preview:"Q1 budget summary attached",           badge:0, badgeClass:""               },
                        { init:"MC", col:"bg-rose-100 text-rose-700",       name:"Mariama Camara",  preview:"AfDB signed term sheet sent",          badge:0, badgeClass:""               },
                      ].map(d => (
                        <div key={d.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => setDmOpen(!dmOpen)}>
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0 ${d.col}`}>{d.init}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{d.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{d.preview}</p>
                          </div>
                          {d.badge > 0 && (
                            <span className={`${d.badgeClass} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full`}>{d.badge}</span>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {dmOpen && (
                    <Card className="border-primary/30">
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Kwame Asante</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="bg-muted rounded-lg p-3 text-sm">Hi Adaora, the Youth Parliament agenda (42pp) is ready for your review. I've proposed adding a West Africa trade debate session for Day 2 afternoon.</div>
                        <div className="bg-primary/10 rounded-lg p-3 text-sm text-right">Thanks Kwame — I'll review tonight. Trade debate sounds excellent. Let's discuss in tomorrow's call.</div>
                        <div className="bg-muted rounded-lg p-3 text-sm">Perfect. Should I follow up with Awa to confirm which 12-country delegations are confirmed for logistics?</div>
                        <div className="flex gap-2 pt-1">
                          <input className="flex-1 text-sm border border-border rounded-lg px-3 py-1.5 bg-background" placeholder="Type a reply…" />
                          <Button size="sm" className="gap-1"><Send className="h-3.5 w-3.5" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {commsTab === "activity" && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  {[
                    { dot:"bg-primary",        text:"Ngozi Eze published changes to Youth Innovation page — new delegate profiles added",   time:"2h ago"      },
                    { dot:"bg-amber-500",       text:"Mariama Camara updated AfDB Gold sponsor status to In Legal Review",                   time:"4h ago"      },
                    { dot:"bg-blue-600",        text:"Kwame Asante submitted Youth Parliament simulation agenda (42pp) for director review", time:"Yesterday"   },
                    { dot:"bg-violet-500",      text:"Ibrahim Traore uploaded French translations (press release + overview) to Documents",  time:"25 Mar"      },
                    { dot:"bg-primary",         text:"Chidi Nwosu completed Trade Forum Abuja venue assessment report",                      time:"24 Mar"      },
                    { dot:"bg-blue-600",        text:"Moussa Coulibaly deployed Supabase RSVP + media_uploads migration to staging",        time:"24 Mar"      },
                    { dot:"bg-secondary",       text:"Seun Adesanya marked Parliamentary Awards page as published",                          time:"23 Mar"      },
                    { dot:"bg-amber-500",       text:"Mariama Camara onboarded UNDP West Africa as Silver sponsor — agreement signed",      time:"20 Mar"      },
                  ].map((a,i) => (
                    <div key={i} className="flex gap-3 items-start border-b border-border last:border-0 pb-3 last:pb-0">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{a.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {commsTab === "mentions" && (
              <div className="space-y-3">
                {[
                  { tag:"@Adaora",   msg:"Kwame tagged you in Youth Parliament agenda review task",          ctx:"Task Board",    time:"27 Mar" },
                  { tag:"@All Team", msg:"Awa sent Google Meet calendar invites for all Q2 recurring meetings", ctx:"Calendar",    time:"26 Mar" },
                  { tag:"@Adaora",   msg:"Mariama: AfDB term sheet requires your countersignature before 1 Apr", ctx:"Sponsors",   time:"25 Mar" },
                  { tag:"@Adaora",   msg:"Emeka has submitted Q1 financial summary for director sign-off",    ctx:"Documents",    time:"24 Mar" },
                ].map((m,i) => (
                  <Card key={i} className="border-blue-200">
                    <CardContent className="py-3 px-4 flex items-start gap-3">
                      <Bell className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm"><strong>{m.tag}</strong> — {m.msg}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{m.time} · {m.ctx}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </AnimatedSection>
        )}

        {/* ══════════ SPONSORS ══════════ */}
        {activeTab === "sponsors" && (
          <AnimatedSection>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Sponsor Portal</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Visibility tracking · ROI dashboards · Touchpoint scheduling · Impact reporting</p>
              </div>
              <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Invite sponsor</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label:"Total sponsors",           value:"8",    sub:"3 Gold · 3 Silver · 2 Bronze" },
                { label:"Combined audience reach",  value:"2.4M", sub:"Across 12 member states"      },
                { label:"Logo impressions (Q1)",    value:"186K", sub:"+28% vs projection"            },
                { label:"Pending sign-offs",        value:"2",    sub:"AfDB · Duchess International"  },
              ].map(s => (
                <Card key={s.label}><CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{s.sub}</p>
                </CardContent></Card>
              ))}
            </div>

            <div className="space-y-3">
              {(["gold","silver","bronze"] as const).map(tier => {
                const tierSponsors = sponsors.filter(s => s.tier === tier);
                const cfg = tierConfig[tier];
                return (
                  <div key={tier}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${cfg.class}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {tierSponsors.map(sp => (
                        <div key={sp.name}
                          className={`border border-border rounded-xl p-4 bg-card border-l-4 ${cfg.accent}`}>
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="text-sm font-bold">{sp.name}</h3>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.class}`}>{cfg.label}</span>
                                <span className="flex items-center gap-1 text-[10px]">
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot[sp.status]}`} />
                                  <span className="text-muted-foreground capitalize">{sp.status}</span>
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{sp.focus}</p>
                              {sp.note && (
                                <p className="text-xs mt-1 text-amber-700 bg-amber-50 rounded-md px-2 py-1 inline-block">{sp.note}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                                <Eye className="h-3 w-3" /> Report
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                                <Video className="h-3 w-3" /> Call
                              </Button>
                            </div>
                          </div>

                          {sp.impressions !== undefined && (
                            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border">
                              {[
                                { label:"Logo impressions",  value: sp.impressions?.toLocaleString() },
                                { label:"Event placements",  value: String(sp.placements)            },
                                { label:"Press mentions",    value: String(sp.mentions)              },
                              ].map(m => (
                                <div key={m.label} className="bg-muted/60 rounded-lg px-3 py-2 text-center">
                                  <p className="text-base font-bold text-primary">{m.value}</p>
                                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        )}

        {/* ══════════ DOCUMENTS ══════════ */}
        {activeTab === "documents" && (
          <AnimatedSection>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Documents & Reports</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Click any document to preview inline · Authorising documents load on tab open</p>
              </div>
              <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Upload</Button>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Document list */}
              <div>
                {docs.map(doc => (
                  <div key={doc.id}
                    onClick={() => setActiveDoc(doc.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border mb-2 cursor-pointer transition-all ${
                      activeDoc === doc.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:bg-muted/50"
                    }`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                      doc.type === "PDF" ? "bg-destructive/10 text-destructive" :
                      doc.type === "DOC" ? "bg-blue-100 text-blue-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>{doc.type}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{doc.date} · {doc.size}</span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{doc.category}</span>
                        {doc.restricted && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Restricted</span>}
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-colors ${activeDoc === doc.id ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                ))}
              </div>

              {/* Preview panel */}
              <div>
                {activeDocData && (
                  <Card className="border-primary/20">
                    <CardContent className="pt-4">
                      {activeDocData.restricted && (
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800">This document is restricted to Finance team and Director access level.</p>
                        </div>
                      )}
                      <div className="bg-muted/40 rounded-lg p-4 mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                          {activeDocData.preview.tag}
                        </p>
                        <h3 className="text-base font-bold leading-snug mb-1">
                          {activeDocData.preview.heading}
                        </h3>
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {activeDocData.preview.body}
                      </div>
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Button size="sm" className="gap-1">
                          <Download className="h-3.5 w-3.5" /> Download
                        </Button>
                        <Button size="sm" variant="outline">Share link</Button>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="h-3.5 w-3.5" /> Full view
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Gap reminder strip */}
        <div className="mt-8 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">23 gaps remaining — see full Gap Analysis</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Contact page · FR/PT website · Newsletter · Sponsor login portal · RSVP system · Volunteer management · Social media · Media kit page · Budget dashboard · Risk register · Accessibility audit.
            </p>
          </div>
          <Button size="sm" variant="outline" className="flex-shrink-0 border-amber-400 text-amber-800 hover:bg-amber-100 ml-auto gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
