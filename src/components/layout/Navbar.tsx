import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";
import anniversary25Logo from "@/assets/parliament-25-logo.png";

const navLinks = [
  { label: "Home",         to: "/"          },
  { label: "About",        to: "/about"     },
  {
    label: "Programmes",
    to: "/programmes/youth",
    children: [
      { label: "Youth Innovation",        to: "/programmes/youth"      },
      { label: "Trade & SME Forums",      to: "/programmes/trade"      },
      { label: "Women's Empowerment",     to: "/programmes/women"      },
      { label: "Civic Education",         to: "/programmes/civic"      },
      { label: "Culture & Creativity",    to: "/programmes/culture"    },
      { label: "Parliamentary Awards",    to: "/programmes/awards"     },
      { label: "Youth Parliament",        to: "/programmes/parliament" },
    ],
  },
  { label: "Timeline",     to: "/timeline"  },
  { label: "News",         to: "/news"      },
  { label: "Documents",    to: "/documents" },
  { label: "Stakeholders", to: "/stakeholders" },
  { label: "Team",         to: "/team"      },
  {
    label: "Get involved",
    to: "/sponsors",
    children: [
      { label: "Sponsor the Programme",   to: "/sponsors"    },
      { label: "Press & Media Kit",       to: "/media-kit"   },
      { label: "Contact Us",              to: "/contact"     },
    ],
  },
];

const Navbar = () => {
  const [programmesOpen, setProgrammesOpen] = useState(false);
  const [involvedOpen, setInvolvedOpen]     = useState(false);
  const [mobileOpen, setMobileOpen]         = useState(false);
  const location = useLocation();

  const isActive = (to: string) =>
    location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ECOWAS colour bar */}
      <div className="h-1 bg-gradient-ecowas" />
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="container flex h-16 items-center justify-between">

          {/* Logos */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img src={ecowasLogo}       alt="ECOWAS Parliament"  className="h-10 w-auto" />
            <img src={anniversary25Logo} alt="25th Anniversary" className="h-10 w-auto" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden xl:flex items-center gap-0.5">
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

              const isDropOpen = link.label === "Programmes" ? programmesOpen : involvedOpen;
              const setOpen    = link.label === "Programmes" ? setProgrammesOpen : setInvolvedOpen;

              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setOpen(true)}
                  onMouseLeave={() => setOpen(false)}
                >
                  <Link
                    to={link.to}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(link.to)
                        ? "text-primary bg-primary/8"
                        : "text-foreground/80 hover:text-primary hover:bg-muted"
                    }`}
                  >
                    {link.label}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isDropOpen ? "rotate-180" : ""}`} />
                  </Link>
                  {isDropOpen && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-xl shadow-lg p-2 animate-fade-in">
                      {link.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className="block px-3 py-2 text-sm rounded-lg hover:bg-muted text-foreground/80 hover:text-primary transition-colors"
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

          {/* CTA + mobile */}
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden xl:flex">
              <Link to="/sponsors">Partner with us</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="hidden xl:flex">
              <Link to="/contact">Contact</Link>
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
                    <Button asChild className="w-full" onClick={() => setMobileOpen(false)}>
                      <Link to="/sponsors">Partner with us</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full" onClick={() => setMobileOpen(false)}>
                      <Link to="/contact">Contact</Link>
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
