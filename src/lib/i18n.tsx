import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Locale = "en" | "fr";

// Flat key-value translation dictionaries
const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.about": "About",
    "nav.programmes": "Programmes",
    "nav.timeline": "Timeline",
    "nav.news": "News",
    "nav.documents": "Documents",
    "nav.stakeholders": "Stakeholders",
    "nav.team": "Team",
    "nav.getInvolved": "Get involved",
    "nav.partnerWithUs": "Partner with us",
    "nav.contact": "Contact",
    "nav.events": "Events",
    // Programme names
    "prog.youth": "Youth Innovation",
    "prog.trade": "Trade & SME Forums",
    "prog.women": "Women's Empowerment",
    "prog.civic": "Civic Education",
    "prog.culture": "Culture & Creativity",
    "prog.awards": "Parliamentary Awards",
    "prog.parliament": "Youth Parliament",
    // Footer
    "footer.programme": "Programme",
    "footer.organisation": "Organisation",
    "footer.getInvolved": "Get involved",
    "footer.subscribe": "Stay informed — subscribe to programme updates",
    "footer.subscribeDesc": "Event announcements · News · Sponsor spotlights · Delegate updates",
    "footer.email": "Your email address",
    "footer.subscribeBtn": "Subscribe",
    "footer.copyright": "© 2026 ECOWAS Parliament 25th Anniversary Programme. All rights reserved.",
    "footer.tagline": "Celebrating 25 years of parliamentary democracy in West Africa. A year-long programme across all 12 ECOWAS Parliament member states — 2026.",
    // Hero
    "hero.subtitle": "A Year-Long Movement",
    "hero.description": "Not a celebration confined to a date, but a year-long movement across borders, generations, and sectors — reaffirming the promise of a more connected, inclusive, and prosperous West Africa.",
    "hero.explore": "Explore the Programme",
    "hero.viewTimeline": "View Timeline",
    // Common
    "common.learnMore": "Learn more",
    "common.readMore": "Read more",
    "common.contact": "Contact Us",
    "common.sponsor": "Sponsor the Programme",
    "common.mediaKit": "Press & Media Kit",
    // Events
    "events.title": "Events & Registration",
    "events.subtitle": "Register for upcoming ECOWAS Parliament 25th Anniversary events across West Africa.",
    "events.register": "Register",
    "events.registered": "Registered",
    "events.upcoming": "Upcoming Events",
    "events.noEvents": "No upcoming events at the moment. Check back soon.",
  },
  fr: {
    // Navbar
    "nav.home": "Accueil",
    "nav.about": "À propos",
    "nav.programmes": "Programmes",
    "nav.timeline": "Calendrier",
    "nav.news": "Actualités",
    "nav.documents": "Documents",
    "nav.stakeholders": "Parties prenantes",
    "nav.team": "Équipe",
    "nav.getInvolved": "Participer",
    "nav.partnerWithUs": "Devenir partenaire",
    "nav.contact": "Contact",
    "nav.events": "Événements",
    // Programme names
    "prog.youth": "Innovation Jeunesse",
    "prog.trade": "Commerce & PME",
    "prog.women": "Autonomisation des Femmes",
    "prog.civic": "Éducation Civique",
    "prog.culture": "Culture & Créativité",
    "prog.awards": "Prix Parlementaires",
    "prog.parliament": "Parlement des Jeunes",
    // Footer
    "footer.programme": "Programme",
    "footer.organisation": "Organisation",
    "footer.getInvolved": "Participer",
    "footer.subscribe": "Restez informé — abonnez-vous aux mises à jour",
    "footer.subscribeDesc": "Annonces d'événements · Actualités · Partenaires · Délégués",
    "footer.email": "Votre adresse e-mail",
    "footer.subscribeBtn": "S'abonner",
    "footer.copyright": "© 2026 Programme du 25e anniversaire du Parlement de la CEDEAO. Tous droits réservés.",
    "footer.tagline": "Célébrant 25 ans de démocratie parlementaire en Afrique de l'Ouest. Un programme d'un an à travers les 12 États membres du Parlement de la CEDEAO — 2026.",
    // Hero
    "hero.subtitle": "Un Mouvement d'Une Année Entière",
    "hero.description": "Pas une célébration limitée à une date, mais un mouvement d'un an à travers les frontières, les générations et les secteurs — réaffirmant la promesse d'une Afrique de l'Ouest plus connectée, inclusive et prospère.",
    "hero.explore": "Explorer le Programme",
    "hero.viewTimeline": "Voir le Calendrier",
    // Common
    "common.learnMore": "En savoir plus",
    "common.readMore": "Lire la suite",
    "common.contact": "Contactez-nous",
    "common.sponsor": "Parrainer le Programme",
    "common.mediaKit": "Kit Presse & Médias",
    // Events
    "events.title": "Événements & Inscription",
    "events.subtitle": "Inscrivez-vous aux événements du 25e anniversaire du Parlement de la CEDEAO à travers l'Afrique de l'Ouest.",
    "events.register": "S'inscrire",
    "events.registered": "Inscrit",
    "events.upcoming": "Événements à venir",
    "events.noEvents": "Aucun événement à venir pour le moment. Revenez bientôt.",
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = localStorage.getItem("locale");
    return (stored === "fr" ? "fr" : "en") as Locale;
  });

  const changeLocale = useCallback((l: Locale) => {
    setLocale(l);
    localStorage.setItem("locale", l);
  }, []);

  const t = useCallback(
    (key: string) => translations[locale]?.[key] ?? translations.en[key] ?? key,
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale: changeLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
