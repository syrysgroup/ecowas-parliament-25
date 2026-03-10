import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";
import anniversary25Logo from "@/assets/parliament-25-logo.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Programmes", to: "/programmes/youth", children: [
    { label: "Youth Innovation", to: "/programmes/youth" },
    { label: "Trade & SME Forums", to: "/programmes/trade" },
    { label: "Women's Empowerment", to: "/programmes/women" },
    { label: "Civic Education", to: "/programmes/civic" },
    { label: "Culture & Creativity", to: "/programmes/culture" },
    { label: "Youth Parliament", to: "/programmes/parliament" },
  ]},
  { label: "Timeline", to: "/timeline" },
  { label: "News", to: "/news" },
  { label: "Documents", to: "/documents" },
  { label: "Stakeholders", to: "/stakeholders" },
  { label: "Team", to: "/team" },
];

const Navbar = () => {
  const [programmesOpen, setProgrammesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Green top bar */}
      <div className="h-1 bg-gradient-ecowas" />
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          {/* Logos */}
          <Link to="/" className="flex items-center gap-3">
            <img src={ecowasLogo} alt="ECOWAS Parliament" className="h-10 w-auto" />
            <img src={anniversary25Logo} alt="25th Anniversary" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative group"
                  onMouseEnter={() => setProgrammesOpen(true)}
                  onMouseLeave={() => setProgrammesOpen(false)}
                >
                  <Link
                    to={link.to}
                    className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-md hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                  {programmesOpen && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-lg shadow-lg p-2 animate-fade-in">
                      {link.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className="block px-3 py-2 text-sm rounded-md hover:bg-muted text-foreground/80 hover:text-primary transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-md hover:bg-muted"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon" className="border-primary/30 hover:bg-primary/10">
                <Menu className="h-5 w-5 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex items-center gap-2 mb-8 mt-4">
                <img src={ecowasLogo} alt="ECOWAS Parliament" className="h-8 w-auto" />
                <img src={anniversary25Logo} alt="25th Anniversary" className="h-8 w-auto" />
              </div>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) =>
                  link.children ? (
                    <div key={link.label}>
                      <p className="px-3 py-2 text-sm font-semibold text-primary">{link.label}</p>
                      {link.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className="block px-6 py-2 text-sm text-foreground/70 hover:text-primary hover:bg-muted rounded-md transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-muted rounded-md transition-colors"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
