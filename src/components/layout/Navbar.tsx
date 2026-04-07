import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTranslation, Locale } from "@/lib/i18n";
import ThemeToggle from "@/components/shared/ThemeToggle";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const localeLabels: Record<Locale, string> = { en: "EN", fr: "FR", pt: "PT" };
const localeOrder: Locale[] = ["en", "fr", "pt"];

const Navbar = () => {
  const { t, locale, setLocale } = useTranslation();
  const location = useLocation();
  const { get } = useSiteSettings();
  const dbLogoUrl = get("site_logo_url", "");
  const dbSiteName = get("site_name", "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const dropTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const langTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navLinks = [
    { label: t("nav.home"), to: "/" },
    { label: t("nav.about"), to: "/about" },
    {
      label: t("nav.programmes"),
      to: "/programmes/youth",
      children: [
        { label: t("prog.youth"), to: "/programmes/youth" },
        { label: t("prog.trade"), to: "/programmes/trade" },
        { label: t("prog.women"), to: "/programmes/women" },
        { label: t("prog.civic"), to: "/programmes/civic" },
        { label: t("prog.culture"), to: "/programmes/culture" },
        { label: t("prog.awards"), to: "/programmes/awards" },
        { label: t("prog.parliament"), to: "/programmes/parliament" },
      ],
    },
    {
      label: t("nav.eventsMedia"),
      to: "/events",
      children: [
        { label: t("nav.events"), to: "/events" },
        { label: t("nav.timeline"), to: "/timeline" },
        { label: t("nav.news"), to: "/news" },
        { label: t("nav.documents"), to: "/documents" },
        { label: t("common.mediaKit"), to: "/media-kit" },
      ],
    },
    {
      label: t("nav.stakeholdersPartners"),
      to: "/stakeholders",
      children: [
        { label: t("nav.stakeholdersPartners"), to: "/stakeholders" },
        { label: "Sponsors", to: "/sponsors" },
      ],
    },
    { label: t("nav.team"), to: "/team" },
    { label: t("nav.volunteer"), to: "/volunteer" },
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
            <div className="bg-gray-200 rounded-full p-2 shadow-sm border-2 border-ecowas-green">
              <img
                src={dbLogoUrl || ecowasLogo}
                alt={dbSiteName || "ECOWAS Parliament"}
                className="h-12 w-12 object-contain"
                width={48} height={48} decoding="async" fetchPriority="high"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-foreground leading-tight">{dbSiteName || "ECOWAS Parliament"}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Parlement de la CEDEAO</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden xl:flex items-center gap-1">
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

            <ThemeToggle className="hidden xl:flex" />

            <Button asChild size="sm" className="hidden xl:flex">
              <Link to="/sponsors">{t("nav.partnerWithUs")}</Link>
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
                      <Link to="/sponsors">{t("nav.partnerWithUs")}</Link>
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
