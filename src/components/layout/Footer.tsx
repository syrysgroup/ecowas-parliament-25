import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";
import anniversary25Logo from "@/assets/parliament-25-logo.png";
import SocialMediaBar from "@/components/shared/SocialMediaBar";


const Footer = () => {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const { get } = useSiteSettings();

  const contactEmail = get("contact_email", "info@ecowasparliamentinitiatives.org");

  const footerLinks = [
    {
      heading: t("footer.programme"),
      links: [
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
      heading: t("footer.organisation"),
      links: [
        { label: t("nav.about"), to: "/about" },
        { label: t("nav.timeline"), to: "/timeline" },
        { label: t("nav.team"), to: "/team" },
        { label: t("nav.stakeholders"), to: "/stakeholders" },
        { label: t("nav.news"), to: "/news" },
        { label: t("nav.documents"), to: "/documents" },
        { label: t("nav.events"), to: "/events" },
      ],
    },
    {
      heading: t("footer.getInvolved"),
      links: [
        { label: t("common.sponsor"), to: "/sponsors" },
        { label: t("common.mediaKit"), to: "/media-kit" },
        { label: t("common.contact"), to: "/contact" },
        { label: t("common.volunteer"), to: "/volunteer" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white rounded-full p-1.5 shadow-sm">
                <img src={ecowasLogo} alt="ECOWAS Parliament" className="h-8 w-8 object-contain" width={32} height={32} loading="lazy" decoding="async" />
              </div>
              <div className="bg-white rounded-full p-1.5 shadow-sm">
                <img src={anniversary25Logo} alt="25th Anniversary" className="h-8 w-auto object-contain" width={32} height={32} loading="lazy" decoding="async" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t("footer.tagline")}</p>
            <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
              <p>📍 Herbert Macaulay Way, Garki, Abuja 900103, Federal Capital Territory</p>
              <p>📧 {contactEmail}</p>
              <p>📧 media@ecowasparliamentinitiatives.org</p>
              <p>📧 sponsors@ecowasparliamentinitiatives.org</p>
            </div>
            <SocialMediaBar variant="full" showParliamentLink={true} />

          </div>

          {footerLinks.map(col => (
            <div key={col.heading}>
              <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">{col.heading}</h4>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{t("footer.copyright")}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">{t("footer.disclaimer")}</p>
            <p className="text-[10px] text-muted-foreground/40 mt-0.5">{t("footer.builtBy")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("nav.contact")}</Link>
            <Link to="/media-kit" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("common.mediaKit")}</Link>
            <Link to="/sponsors" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("common.sponsor")}</Link>
            <a href="https://parl.ecowas.int" target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              {t("footer.officialSite")} ↗
            </a>
            {user ? (
              <Link to="/crm" className="text-xs font-medium px-3 py-1.5 rounded-md border border-border text-foreground/70 hover:text-primary hover:border-primary transition-colors">{t("footer.dashboard")}</Link>
            ) : (
              <Link to="/auth" className="text-xs font-medium px-3 py-1.5 rounded-md border border-border text-foreground/70 hover:text-primary hover:border-primary transition-colors">{t("footer.signIn")}</Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
