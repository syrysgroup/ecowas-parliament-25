/**
 * ProgrammeTimeline — Fullscreen vertical/horizontal timeline showing
 * each programme pillar's lifecycle from inception to completion.
 *
 * Stages: Planning → Development → Launch → Active → Review → Complete
 * Each programme pillar has its own colour and milestone set.
 */

import { useState } from "react";
import { CheckCircle2, Circle, Clock, AlertCircle, ChevronRight, Calendar, Users, Target } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";

// ── Types ─────────────────────────────────────────────────────────────────────
type StageStatus = "complete" | "active" | "upcoming" | "blocked";

interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  status: StageStatus;
  assignee?: string;
  deliverable?: string;
  kpi?: string;
}

interface PillarTimeline {
  id: string;
  emoji: string;
  label: string;
  colour: string;           // Tailwind gradient classes
  accent: string;           // Tailwind text colour
  border: string;           // Tailwind border colour
  bg: string;               // Tailwind bg colour
  description: string;
  milestones: Milestone[];
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<StageStatus, { icon: typeof CheckCircle2; label: string; color: string; dot: string }> = {
  complete: { icon: CheckCircle2, label: "Complete",  color: "text-emerald-400", dot: "bg-emerald-400" },
  active:   { icon: Clock,        label: "In Progress", color: "text-blue-400",    dot: "bg-blue-400 animate-pulse" },
  upcoming: { icon: Circle,       label: "Upcoming",  color: "text-crm-text-dim",  dot: "bg-crm-border" },
  blocked:  { icon: AlertCircle,  label: "Blocked",   color: "text-red-400",      dot: "bg-red-400" },
};

// ── Pillar definitions ────────────────────────────────────────────────────────
const PILLARS: PillarTimeline[] = [
  {
    id: "youth",
    emoji: "🚀",
    label: "Youth Innovation",
    colour: "from-violet-600 to-purple-700",
    accent: "text-violet-400",
    border: "border-violet-500/30",
    bg: "bg-violet-500/10",
    description: "Empowering young West Africans through digital skills, entrepreneurship and civic tech.",
    milestones: [
      { id: "y1", title: "Programme Design", description: "Define eligibility criteria, curriculum framework and selection methodology.", date: "Jan 2026", status: "complete", assignee: "Programme Lead", deliverable: "Design Document", kpi: "Framework approved by steering committee" },
      { id: "y2", title: "Partner Onboarding", description: "Sign MoUs with implementing partners and secure venue commitments.", date: "Feb 2026", status: "complete", assignee: "Sponsor Manager", deliverable: "Signed Agreements", kpi: "5+ partners confirmed" },
      { id: "y3", title: "Call for Applications", description: "Launch open call across 15 ECOWAS member states with multilingual outreach.", date: "Mar 2026", status: "complete", assignee: "Comms Officer", deliverable: "Application Portal", kpi: "500+ applications" },
      { id: "y4", title: "Selection & Shortlisting", description: "Panel review and selection of 60 participants across all member states.", date: "Apr 2026", status: "active", assignee: "Programme Lead", deliverable: "Participant List", kpi: "60 participants notified" },
      { id: "y5", title: "Bootcamp & Training", description: "Three-day intensive bootcamp with mentors and industry experts.", date: "May 2026", status: "upcoming", assignee: "Logistics Coordinator", deliverable: "Training Report", kpi: "95% attendance rate" },
      { id: "y6", title: "Showcase & Awards", description: "Public showcase of projects, pitch competition and award ceremony.", date: "Jun 2026", status: "upcoming", deliverable: "Event Report", kpi: "Media coverage in 5+ outlets" },
    ],
  },
  {
    id: "trade",
    emoji: "🤝",
    label: "Trade & SME",
    colour: "from-amber-500 to-orange-600",
    accent: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    description: "Facilitating cross-border trade, supporting SMEs and promoting economic integration.",
    milestones: [
      { id: "t1", title: "Market Research", description: "Analyse cross-border trade barriers and SME financing gaps across ECOWAS.", date: "Dec 2025", status: "complete", deliverable: "Research Report", kpi: "Report validated by ECOWAS Commission" },
      { id: "t2", title: "Stakeholder Consultation", description: "Roundtables with SME associations, chambers of commerce and government agencies.", date: "Jan 2026", status: "complete", deliverable: "Consultation Summary", kpi: "150+ stakeholders consulted" },
      { id: "t3", title: "Trade Fair Planning", description: "Secure venue, exhibitor slots and logistics for the Trade & Investment Fair.", date: "Feb 2026", status: "complete", deliverable: "Event Plan", kpi: "50 exhibitor slots confirmed" },
      { id: "t4", title: "Exhibitor Registration", description: "Open registration for SMEs and corporate exhibitors.", date: "Mar 2026", status: "active", deliverable: "Exhibitor List", kpi: "100% occupancy" },
      { id: "t5", title: "Trade Fair Execution", description: "3-day trade and investment fair with B2B matchmaking sessions.", date: "May 2026", status: "upcoming", deliverable: "Event Report", kpi: "$2M+ trade deals facilitated" },
      { id: "t6", title: "Impact Evaluation", description: "Measure trade connections, deals and policy recommendations.", date: "Jun 2026", status: "upcoming", deliverable: "Impact Report" },
    ],
  },
  {
    id: "women",
    emoji: "⚡",
    label: "Women's Forum",
    colour: "from-pink-500 to-rose-600",
    accent: "text-pink-400",
    border: "border-pink-500/30",
    bg: "bg-pink-500/10",
    description: "Advancing gender equality and women's economic empowerment across West Africa.",
    milestones: [
      { id: "w1", title: "Needs Assessment", description: "Survey women entrepreneurs and parliamentarians across member states.", date: "Nov 2025", status: "complete", deliverable: "Assessment Report" },
      { id: "w2", title: "Forum Design", description: "Define programme, speakers, breakout sessions and networking format.", date: "Jan 2026", status: "complete", deliverable: "Programme Design" },
      { id: "w3", title: "Speaker Outreach", description: "Confirm keynote speakers, panellists and workshop facilitators.", date: "Feb 2026", status: "complete", kpi: "15+ confirmed speakers" },
      { id: "w4", title: "Delegate Registration", description: "Open registration for delegates, observers and media.", date: "Mar 2026", status: "active", kpi: "300 delegates registered" },
      { id: "w5", title: "Women's Forum", description: "Two-day forum including plenary sessions, workshops and networking dinner.", date: "Apr 2026", status: "upcoming", deliverable: "Event Report" },
      { id: "w6", title: "Communiqué & Follow-up", description: "Publish forum communiqué and track policy commitments.", date: "May 2026", status: "upcoming", deliverable: "Policy Communiqué" },
    ],
  },
  {
    id: "civic",
    emoji: "🏛️",
    label: "Civic Education",
    colour: "from-emerald-500 to-teal-600",
    accent: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    description: "Strengthening democratic governance through civic awareness and parliamentary education.",
    milestones: [
      { id: "c1", title: "Curriculum Development", description: "Create age-appropriate civic education modules for schools.", date: "Oct 2025", status: "complete", deliverable: "Curriculum Kit" },
      { id: "c2", title: "School Partnerships", description: "Partner with Ministries of Education in all 15 member states.", date: "Dec 2025", status: "complete", kpi: "15 MoUs signed" },
      { id: "c3", title: "Teacher Training", description: "Train 300 teachers on civic education delivery.", date: "Feb 2026", status: "complete", kpi: "300 teachers certified" },
      { id: "c4", title: "Rollout Phase 1", description: "Deploy curriculum in 100 schools across 5 pilot countries.", date: "Mar 2026", status: "active", kpi: "10,000 students reached" },
      { id: "c5", title: "Mock Parliament Competition", description: "National and regional mock parliament competitions.", date: "May 2026", status: "upcoming", deliverable: "Competition Results" },
      { id: "c6", title: "Programme Evaluation", description: "Assess learning outcomes and expand to remaining countries.", date: "Jul 2026", status: "upcoming", deliverable: "Evaluation Report" },
    ],
  },
  {
    id: "parliament",
    emoji: "🌍",
    label: "Youth Parliament",
    colour: "from-blue-500 to-indigo-600",
    accent: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    description: "Simulating parliamentary proceedings to build the next generation of West African leaders.",
    milestones: [
      { id: "p1", title: "Country Nominations", description: "Each of 15 member states nominates 5 young delegates.", date: "Jan 2026", status: "complete", kpi: "75 delegates nominated" },
      { id: "p2", title: "Pre-Parliament Training", description: "Virtual orientation on parliamentary procedure and debate.", date: "Feb 2026", status: "complete", deliverable: "Training Certificates" },
      { id: "p3", title: "Agenda Setting", description: "Delegates propose and vote on bills for the parliamentary session.", date: "Mar 2026", status: "complete", deliverable: "Agenda Document" },
      { id: "p4", title: "Parliamentary Session", description: "3-day youth parliament session in the ECOWAS Parliament chamber.", date: "Apr 2026", status: "active", deliverable: "Hansard Record", kpi: "Live-streamed to 50,000+ viewers" },
      { id: "p5", title: "Communiqué & Resolutions", description: "Formal adoption and publication of youth parliament resolutions.", date: "Apr 2026", status: "upcoming", deliverable: "Resolutions Document" },
      { id: "p6", title: "Legacy Programme", description: "Connect alumni into a regional youth governance network.", date: "Jun 2026", status: "upcoming", deliverable: "Network Launch" },
    ],
  },
];

// ── Milestone card ────────────────────────────────────────────────────────────
function MilestoneCard({ milestone, accent, isLast }: { milestone: Milestone; accent: string; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[milestone.status];
  const Icon = cfg.icon;

  return (
    <div className="relative pl-10">
      {/* Vertical connector line */}
      {!isLast && (
        <div className="absolute left-3.5 top-6 bottom-0 w-px bg-crm-border" />
      )}

      {/* Status dot */}
      <div className={`absolute left-0 top-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-crm-card ${
        milestone.status === "complete" ? "bg-emerald-950 border-emerald-800" :
        milestone.status === "active"   ? "bg-blue-950 border-blue-800" :
        milestone.status === "blocked"  ? "bg-red-950 border-red-800" :
        "bg-crm-surface border-crm-border"
      }`}>
        <Icon size={14} className={cfg.color} />
      </div>

      {/* Card */}
      <div
        className={`mb-4 rounded-xl border ${
          milestone.status === "active" ? "border-blue-800/60 bg-blue-950/30" :
          milestone.status === "complete" ? "border-crm-border bg-crm-surface/50" :
          "border-crm-border bg-crm-card"
        } transition-all duration-200`}
      >
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                milestone.status === "complete" ? "bg-emerald-950 border border-emerald-800 text-emerald-400" :
                milestone.status === "active"   ? "bg-blue-950 border border-blue-800 text-blue-400" :
                milestone.status === "blocked"  ? "bg-red-950 border border-red-800 text-red-400" :
                "bg-crm-surface border border-crm-border text-crm-text-dim"
              }`}>
                {cfg.label}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-crm-text-dim">
                <Calendar size={11} />
                {milestone.date}
              </span>
            </div>
            <p className={`text-[13px] font-semibold mt-1.5 ${
              milestone.status === "complete" ? "text-crm-text-muted line-through opacity-70" :
              milestone.status === "active"   ? "text-crm-text" :
              "text-crm-text-secondary"
            }`}>
              {milestone.title}
            </p>
          </div>
          <ChevronRight size={14} className={`text-crm-text-dim flex-shrink-0 mt-1 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-crm-border/50 pt-3">
            <p className="text-[12px] text-crm-text-muted leading-relaxed">{milestone.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {milestone.assignee && (
                <div className="flex items-start gap-2 bg-crm-surface/60 rounded-lg px-3 py-2">
                  <Users size={12} className="text-crm-text-dim mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-crm-text-faint font-bold">Owner</p>
                    <p className="text-[12px] text-crm-text-muted">{milestone.assignee}</p>
                  </div>
                </div>
              )}
              {milestone.deliverable && (
                <div className="flex items-start gap-2 bg-crm-surface/60 rounded-lg px-3 py-2">
                  <CheckCircle2 size={12} className="text-crm-text-dim mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-crm-text-faint font-bold">Deliverable</p>
                    <p className="text-[12px] text-crm-text-muted">{milestone.deliverable}</p>
                  </div>
                </div>
              )}
              {milestone.kpi && (
                <div className="flex items-start gap-2 bg-crm-surface/60 rounded-lg px-3 py-2">
                  <Target size={12} className="text-crm-text-dim mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-crm-text-faint font-bold">KPI</p>
                    <p className="text-[12px] text-crm-text-muted">{milestone.kpi}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function PillarProgress({ milestones, accent }: { milestones: Milestone[]; accent: string }) {
  const done     = milestones.filter(m => m.status === "complete").length;
  const active   = milestones.filter(m => m.status === "active").length;
  const total    = milestones.length;
  const pct      = Math.round(((done + active * 0.5) / total) * 100);

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-1 h-2 rounded-full bg-crm-surface overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${
            accent.includes("violet") ? "from-violet-500 to-purple-600" :
            accent.includes("amber")  ? "from-amber-400 to-orange-500" :
            accent.includes("pink")   ? "from-pink-400 to-rose-500" :
            accent.includes("emerald")? "from-emerald-400 to-teal-500" :
            "from-blue-400 to-indigo-500"
          } transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[12px] font-bold ${accent} whitespace-nowrap`}>
        {done}/{total} complete
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProgrammeTimeline() {
  const [activePillar, setActivePillar] = useState("youth");
  const pillar = PILLARS.find(p => p.id === activePillar) ?? PILLARS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-crm-text">Programme Timelines</h2>
        <p className="text-[12px] text-crm-text-muted mt-0.5">
          Track every programme pillar from inception to completion. Click a milestone to expand details.
        </p>
      </div>

      {/* Pillar tabs */}
      <div className="flex gap-2 flex-wrap">
        {PILLARS.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePillar(p.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 border ${
              activePillar === p.id
                ? `bg-gradient-to-r ${p.colour} text-white border-transparent shadow-lg scale-105`
                : `${p.bg} ${p.border} ${p.accent} hover:scale-102`
            }`}
          >
            <span>{p.emoji}</span>
            <span className="hidden sm:inline">{p.label}</span>
          </button>
        ))}
      </div>

      {/* Active pillar content */}
      <AnimatedSection key={activePillar}>
        <div className={`rounded-2xl border ${pillar.border} ${pillar.bg} p-5 mb-5`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{pillar.emoji}</span>
            <div>
              <h3 className={`text-[15px] font-black ${pillar.accent}`}>{pillar.label}</h3>
              <p className="text-[12px] text-crm-text-muted">{pillar.description}</p>
            </div>
          </div>
          <PillarProgress milestones={pillar.milestones} accent={pillar.accent} />

          {/* Legend */}
          <div className="flex flex-wrap gap-4">
            {(Object.entries(STATUS_CONFIG) as [StageStatus, typeof STATUS_CONFIG[StageStatus]][]).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className={`text-[11px] font-medium ${cfg.color}`}>{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone timeline */}
        <div className="bg-crm-card border border-crm-border rounded-2xl p-5">
          {pillar.milestones.map((milestone, idx) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              accent={pillar.accent}
              isLast={idx === pillar.milestones.length - 1}
            />
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}
