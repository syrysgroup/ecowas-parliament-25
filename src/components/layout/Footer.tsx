import { Link } from "react-router-dom";
import duchessLogo from "@/assets/duchess-logo.png";
import cmdLogo from "@/assets/cmd-logo.png";
import borderlessLogo from "@/assets/borderless-trade-logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-hero text-primary-foreground">
      {/* Co-Organisers strip */}
      <div className="border-b border-primary-foreground/10 py-10">
        <div className="container">
          <p className="text-center text-xs font-bold tracking-wider uppercase mb-4 text-primary-foreground/50">
            Programme Co-Organisers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <img src={duchessLogo} alt="Duchess NL" className="h-12 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity" />
            <img src={cmdLogo} alt="CMD Tourism & Trade" className="h-12 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity" />
            <img src={borderlessLogo} alt="Borderless Trade & Investment" className="h-12 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Footer content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">ECOWAS Parliament @25</h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              A year-long commemorative programme celebrating 25 years of service
              to the peoples of West Africa. January – November 2026.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              {[
                { label: "About the Programme", to: "/about" },
                { label: "Timeline", to: "/timeline" },
                { label: "Photo Gallery", to: "/gallery" },
                { label: "News & Updates", to: "/news" },
                { label: "Documents", to: "/documents" },
                { label: "Stakeholders", to: "/stakeholders" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <div className="text-sm text-primary-foreground/70 space-y-2">
              <p>ECOWAS Parliament</p>
              <p>International Conference Centre</p>
              <p>Abuja, Nigeria</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/10 text-center">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} ECOWAS Parliament. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
