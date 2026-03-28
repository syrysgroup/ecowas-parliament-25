import { Link } from "react-router-dom";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";
import anniversary25Logo from "@/assets/parliament-25-logo.png";

const footerLinks = [
  {
    heading: "Programme",
    links: [
      { label: "Youth Innovation",     to: "/programmes/youth"      },
      { label: "Trade & SME Forums",   to: "/programmes/trade"      },
      { label: "Women's Empowerment",  to: "/programmes/women"      },
      { label: "Civic Education",      to: "/programmes/civic"      },
      { label: "Culture & Creativity", to: "/programmes/culture"    },
      { label: "Parliamentary Awards", to: "/programmes/awards"     },
      { label: "Youth Parliament",     to: "/programmes/parliament" },
    ],
  },
  {
    heading: "Organisation",
    links: [
      { label: "About the programme",  to: "/about"        },
      { label: "Timeline",             to: "/timeline"     },
      { label: "Team",                 to: "/team"         },
      { label: "Stakeholders",         to: "/stakeholders" },
      { label: "News & updates",       to: "/news"         },
      { label: "Documents",            to: "/documents"    },
    ],
  },
  {
    heading: "Get involved",
    links: [
      { label: "Sponsor the programme", to: "/sponsors"  },
      { label: "Press & media kit",     to: "/media-kit" },
      { label: "Contact us",            to: "/contact"   },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand block */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={ecowasLogo}       alt="ECOWAS Parliament"  className="h-9 w-auto" />
              <img src={anniversary25Logo} alt="25th Anniversary" className="h-9 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Celebrating 25 years of parliamentary democracy in West Africa. A year-long programme across all 15 ECOWAS member states — 2026.
            </p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>📧 info@ecowasparliament25.org</p>
              <p>📧 media@ecowasparliament25.org</p>
              <p>📧 sponsors@ecowasparliament25.org</p>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map(col => (
            <div key={col.heading}>
              <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">{col.heading}</h4>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter strip */}
        <div className="mt-10 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <p className="font-bold text-sm">Stay informed — subscribe to programme updates</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Event announcements · News · Sponsor spotlights · Delegate updates
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 md:w-56 text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © 2026 ECOWAS Parliament 25th Anniversary Programme. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            <Link to="/media-kit" className="text-xs text-muted-foreground hover:text-primary transition-colors">Media Kit</Link>
            <Link to="/sponsors" className="text-xs text-muted-foreground hover:text-primary transition-colors">Sponsors</Link>
            <a href="https://www.ecowasparliament.net" target="_blank" rel="noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Official ECOWAS Parliament site ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
