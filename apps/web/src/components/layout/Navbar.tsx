import { useMemo, useState, useRef, useEffect } from "react";					
import { Link, useLocation } from "react-router-dom";					
import { Menu, X, ChevronDown } from "lucide-react";					
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";					
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";					
import { useTranslation, Locale } from "@/lib/i18n";					
import ThemeToggle from "@/components/shared/ThemeToggle";					
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";					
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSiteContent } from "@/hooks/useSiteContent";
					
const localeLabels: Record<Locale, string> = { en: "EN", fr: "FR", pt: "PT" };					
const localeOrder: Locale[] = ["en", "fr", "pt"];

type ProgrammeNavRow = {
  slug: string;
  title: string | null;
  route: string | null;
  is_active: boolean;
};
					
const Navbar = () => {					
const { t, locale, setLocale } = useTranslation();					
const location = useLocation();					
const { get } = useSiteSettings();					
const { data: navCms } = useSiteContent("nav");					
const dbLogoUrl = get("site_logo_url", "");					
const dbSiteName = get("site_name", "");					
const ctaLabel = navCms?.cta_label ?? t("nav.partnerWithUs");					
const ctaHref = navCms?.cta_href ?? "/sponsors";					
const siteNames: Record<Locale, string> = {
en: dbSiteName || "ECOWAS Parliament Initiatives",
fr: "Initiatives du Parlement de la CEDEAO",
pt: "Iniciativas do Parlamento da CEDEAO",
};
const primaryName = siteNames[locale];
const secondaryNames = (Object.keys(siteNames) as Locale[]).filter(l => l !== locale).map(l => siteNames[l]);
const [mobileOpen, setMobileOpen] = useState(false);					
const [openDrop, setOpenDrop] = useState<string | null>(null);					
const [langOpen, setLangOpen] = useState(false);					
const dropTimer = useRef<ReturnType<typeof setTimeout> | null>(null);					
const langTimer = useRef<ReturnType<typeof setTimeout> | null>(null);					
const navRef = useRef<HTMLDivElement>(null);					
const langRef = useRef<HTMLDivElement>(null);					
					
useEffect(() => {					
const handler = (e: MouseEvent) => {					
const outsideNav = !navRef.current?.contains(e.target as Node);					
const outsideLang = !langRef.current?.contains(e.target as Node);					
if (outsideNav) setOpenDrop(null);					
if (outsideNav && outsideLang) setLangOpen(false);					
};					
document.addEventListener("mousedown", handler);					
return () => document.removeEventListener("mousedown", handler);					
}, []);					
					
const fallbackProgrammeChildren = [
{ label: t("prog.youth"), to: "/programmes/youth" },
{ label: t("prog.parliament"), to: "/programmes/parliament" },
{ label: t("prog.women"), to: "/programmes/women" },
{ label: t("prog.trade"), to: "/programmes/trade" },
{ label: t("prog.civic"), to: "/programmes/civic" },
{ label: t("prog.culture"), to: "/programmes/culture" },
{ label: t("prog.awards"), to: "/programmes/awards" },
];

const queryClient = useQueryClient();
const { data: programmeRows = [] } = useQuery<ProgrammeNavRow[]>({
queryKey: ["navbar_programme_pillars"],
queryFn: async () => {
const { data, error } = await supabase
.from("programme_pillars")
.select("slug,title,route,is_active")
.eq("is_active", true)
.order("title", { ascending: true });
if (error) throw error;
return (data ?? []) as ProgrammeNavRow[];
},
staleTime: 30_000,
});

useEffect(() => {
const channel = supabase
.channel("programme_pillars_nav")
.on("postgres_changes", { event: "*", schema: "public", table: "programme_pillars" }, () => {
queryClient.invalidateQueries({ queryKey: ["navbar_programme_pillars"] });
})
.subscribe();
return () => { supabase.removeChannel(channel); };
}, [queryClient]);

const programmeChildren = useMemo(() => {
if (!programmeRows.length) return fallbackProgrammeChildren;
return [...programmeRows]
.sort((a, b) => (a.title ?? a.slug).localeCompare(b.title ?? b.slug, undefined, { sensitivity: "base" }))
.map((row) => ({
label: row.title?.trim() || row.slug,
to: row.route?.trim() || `/programmes/${row.slug}`,
}));
}, [programmeRows, fallbackProgrammeChildren]);

const navLinks = [
{ label: t("nav.home"), to: "/" },
{
label: t("nav.about"),
to: "/about",
children: [
{ label: t("nav.parliamentInitiative"), to: "/about" },
{ label: t("nav.ecowasParliament"), to: "/ecowas-parliament" },
{ label: t("nav.team"), to: "/team" },
{ label: t("nav.timeline"), to: "/timeline" },
],
},
{
label: t("nav.programmes"),
to: programmeChildren[0]?.to || "/programmes/youth",
children: programmeChildren,
},
{
label: t("nav.newsEvents"),
to: "/news",
children: [
{ label: t("nav.news"), to: "/news" },
{ label: t("nav.events"), to: "/events" },
{ label: t("common.mediaKit"), to: "/media-kit" },
{ label: t("nav.mediaPortal"), to: "/media-portal" },
],
},
{
label: t("nav.resources"),
to: "/documents",
children: [
{ label: t("nav.documents"), to: "/documents" },
{ label: t("nav.stakeholdersPartners"), to: "/stakeholders" },
{ label: t("nav.marketplace"), to: "/marketplace" },
{ label: t("nav.virtualTour"), to: "/parliament-tour" },
],
},
{
label: t("nav.getInvolved"),
to: "/volunteer",
children: [
{ label: t("nav.volunteer"), to: "/volunteer" },
{ label: t("nav.becomeSponsor"), to: "/sponsors" },
],
},
{ label: t("nav.contact"), to: "/contact" },
];
					
const isActive = (to: string) =>					
location.pathname === to || (to !== "/" && location.pathname.startsWith(to));					
					
return (					
<header className="sticky top-0 z-50 w-full">					
<div className="h-1 bg-gradient-ecowas" />					
<nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">					
<div className="container flex h-16 items-center justify-between">					
{/* Logo */}					
<Link to="/" className="flex items-center gap-3 flex-shrink-0">					
<div className="bg-muted rounded-full p-2 shadow-sm border-2 border-ecowas-green">					
<img					
src={dbLogoUrl || ecowasLogo}					
alt={dbSiteName || "ECOWAS Parliament Initiatives"}					
className="h-12 w-12 object-contain"					
width={48} height={48} decoding="async" fetchPriority="high"					
/>					
</div>					
<div className="hidden sm:block">
<p className="text-sm font-bold text-foreground leading-tight">{primaryName}</p>
{secondaryNames.map(name => (
<p key={name} className="text-[10px] text-muted-foreground leading-tight">{name}</p>
))}
</div>
</Link>					
					
{/* Desktop nav */}					
<div ref={navRef} className="hidden xl:flex items-center gap-1">					
{navLinks.map((link) => {					
if (!link.children) {					
return (					
<Link					
key={link.to}					
to={link.to}					
className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${					
isActive(link.to)					
? "text-primary bg-primary/8"					
: "text-foreground/80 hover:text-primary hover:bg-muted"					
}`}					
>					
{link.label}					
</Link>					
);					
}					
					
const isDropOpen = openDrop === link.label;					
					
return (					
<div					
key={link.label}					
className="relative"					
onMouseEnter={() => {					
if (dropTimer.current) clearTimeout(dropTimer.current);					
setOpenDrop(link.label);					
}}					
onMouseLeave={() => {					
dropTimer.current = setTimeout(() => setOpenDrop(null), 150);					
}}					
>					
<button					
onClick={() => setOpenDrop(v => v === link.label ? null : link.label)}					
className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${					
link.children.some(c => isActive(c.to))					
? "text-primary bg-primary/8"					
: "text-foreground/80 hover:text-primary hover:bg-muted"					
}`}					
>					
{link.label}					
<ChevronDown className={`h-3.5 w-3.5 transition-transform ${isDropOpen ? "rotate-180" : ""}`} />					
</button>					
{isDropOpen && (					
<div className="absolute top-full left-0 mt-1 w-60 bg-card border border-border rounded-xl shadow-lg p-2 animate-fade-in z-50">					
{link.children.map((child) => (					
<Link					
key={child.to}					
to={child.to}					
onClick={() => setOpenDrop(null)}					
className={`block px-3 py-2 text-sm rounded-lg transition-colors ${					
isActive(child.to)					
? "text-primary bg-primary/5"					
: "text-foreground/80 hover:bg-muted hover:text-primary"					
}`}					
>					
{child.label}					
</Link>					
))}					
</div>					
)}					
</div>					
);					
})}					
</div>					
					
{/* CTA + language switcher + mobile */}					
<div className="flex items-center gap-2">					
{/* Language dropdown */}					
<div
ref={langRef}
className="relative hidden xl:block"
onMouseEnter={() => {
if (langTimer.current) clearTimeout(langTimer.current);
setLangOpen(true);
}}
onMouseLeave={() => {
langTimer.current = setTimeout(() => setLangOpen(false), 150);
}}
>					
<button					
aria-label={t("nav.languageLabel")}					
onClick={() => setLangOpen(v => !v)}
className="flex items-center justify-center w-9 h-9 rounded-md border border-border text-xs font-bold text-foreground/70 hover:bg-muted transition-colors"					
>					
{localeLabels[locale]}					
</button>					
{langOpen && (					
<div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-1 animate-fade-in z-50 min-w-[80px]">					
{localeOrder.map((l) => (					
<button					
key={l}					
onClick={() => { setLocale(l); setLangOpen(false); }}					
className={`block w-full px-3 py-1.5 text-sm rounded-md text-left transition-colors ${					
l === locale ? "text-primary bg-primary/5 font-bold" : "text-foreground/70 hover:bg-muted"					
}`}					
>					
{localeLabels[l]}					
</button>					
))}					
</div>					
)}					
</div>					
					
<ThemeToggle variant="full" className="hidden xl:flex" />					
					
<Button asChild size="sm" className="hidden xl:flex">					
<Link to={ctaHref}>{ctaLabel}</Link>					
</Button>					
					
{/* Mobile hamburger */}					
<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>					
<SheetTrigger asChild>					
<Button variant="ghost" size="icon" className="xl:hidden">					
{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}					
<span className="sr-only">Toggle menu</span>					
</Button>					
</SheetTrigger>					
<SheetContent side="right" className="w-72 overflow-y-auto">					
<nav className="flex flex-col gap-1 mt-6">					
{navLinks.map((link) => (					
<div key={link.label}>					
<Link					
to={link.to}					
onClick={() => setMobileOpen(false)}					
className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${					
isActive(link.to)					
? "text-primary bg-primary/8"					
: "text-foreground/80 hover:text-primary hover:bg-muted"					
}`}					
>					
{link.label}					
</Link>					
{link.children && (					
<div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-3">					
{link.children.map((child) => (					
<Link					
key={child.to}					
to={child.to}					
onClick={() => setMobileOpen(false)}					
className="block px-2 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"					
>					
{child.label}					
</Link>					
))}					
</div>					
)}					
</div>					
))}					
<div className="pt-4 mt-2 border-t border-border space-y-2">					
{/* Language selector for mobile */}					
<div className="flex gap-1 px-3">					
{localeOrder.map((l) => (					
<button					
key={l}					
onClick={() => { setLocale(l); }}					
className={`flex-1 px-2 py-1.5 text-sm font-medium rounded-md transition-colors ${					
l === locale ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70 hover:bg-muted/80"					
}`}					
>					
{localeLabels[l]}					
</button>					
))}					
</div>					
{/* Theme toggle for mobile */}					
<div className="px-3">					
<ThemeToggle variant="full" className="w-full" />					
</div>					
<Button asChild className="w-full" onClick={() => setMobileOpen(false)}>					
<Link to={ctaHref}>{ctaLabel}</Link>					
</Button>					
</div>					
</nav>					
</SheetContent>					
</Sheet>					
</div>					
</div>					
</nav>					
</header>					
);					
};					
					
export default Navbar;					
					