import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTranslation } from "@/lib/i18n";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";

const Navbar = () => {
  const { t, locale, setLocale } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState<string | null>(null);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    {
      label: "Initiatives",
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
      label: "Resources",
      to: "/timeline",
      children: [
        { label: t("nav.timeline"), to: "/timeline" },
        { label: t("nav.news"), to: "/news" },
        { label: t("nav.documents"), to: "/documents" },
        { label: t("nav.events"), to: "/events" },
        { label: "Media Kit", to: "/media-kit" },
      ],
    },
    {
      label: "Get Involved",
      to: "/sponsors",
      children: [
        { label: "Sponsor Portal", to: "/sponsors" },
        { label: t("nav.stakeholders"), to: "/stakeholders" },
        { label: t("nav.team"), to: "/team" },
        { label: t("nav.contact"), to: "/contact" },
      ],
    },
  ];

  const isActive = (to: string) =>
    location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  const toggleLang = () => setLocale(locale === "en" ? "fr" : "en");

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="h-1 bg-gradient-ecowas" />
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo — only ECOWAS Parliament, in white circle */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-white rounded-full p-1.5 shadow-sm">
              <img src={ecowasLogo} alt="ECOWAS Parliament" className="h-9 w-9 object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-foreground leading-tight">ECOWAS Parliament</p>
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
                  onMouseEnter={() => setOpenDrop(link.label)}
                  onMouseLeave={() => setOpenDrop(null)}
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

          {/* CTA + language + mobile */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="hidden xl:flex items-center justify-center w-8 h-8 rounded-md border border-border text-xs font-bold text-foreground/70 hover:bg-muted transition-colors"
              title={locale === "en" ? "Passer en français" : "Switch to English"}
            >
              {locale === "en" ? "FR" : "EN"}
            </button>

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
                    <button
                      onClick={() => { toggleLang(); setMobileOpen(false); }}
                      className="w-full px-3 py-2 text-sm font-medium text-left rounded-lg hover:bg-muted transition-colors"
                    >
                      {locale === "en" ? "🇫🇷 Passer en français" : "🇬🇧 Switch to English"}
                    </button>
                    <Button asChild className="w-full" onClick={() => setMobileOpen(false)}>
                      <Link to="/sponsors">{t("nav.partnerWithUs")}</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full" onClick={() => setMobileOpen(false)}>
                      <Link to="/contact">{t("nav.contact")}</Link>
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
