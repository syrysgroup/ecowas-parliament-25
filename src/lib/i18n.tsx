import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Locale = "en" | "fr" | "pt";

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
    "nav.eventsMedia": "Events & Media",
    "nav.people": "People",
    "nav.volunteer": "Volunteer",
    "nav.partners": "Partners",
    // Programme names
    "prog.youth": "Youth Innovation",
    "prog.trade": "Trade & SME Forums",
    "prog.women": "Women's Empowerment",
    "prog.civic": "Civic Education",
    "prog.culture": "Culture & Creativity",
    "prog.awards": "AWALCO Parliamentary Awards",
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
    "footer.tagline": "Celebrating 25 years of parliamentary representation in West Africa. A year-long programme across all 12 ECOWAS Parliament member states — 2026.",
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
    "common.volunteer": "Volunteer",
    // Footer extra
    "footer.builtBy": "Built by Resident Technology Ltd",
    "footer.signIn": "Sign In",
    "footer.dashboard": "Dashboard",
    // Volunteer page
    "volunteer.badge": "Get Involved",
    "volunteer.title": "Volunteer with Us",
    "volunteer.subtitle": "Join the team behind the ECOWAS Parliament 25th Anniversary Programme. Volunteers play a vital role across events, communications, translation, community outreach, and more.",
    "volunteer.formTitle": "Volunteer Application",
    "volunteer.formDesc": "Tell us about yourself and how you'd like to contribute. We'll be in touch within 5 working days.",
    "volunteer.name": "Full name",
    "volunteer.email": "Email address",
    "volunteer.country": "Country",
    "volunteer.area": "Area of interest",
    "volunteer.skills": "Skills & experience",
    "volunteer.message": "Why do you want to volunteer?",
    "volunteer.submit": "Submit application",
    "volunteer.successTitle": "Application received",
    "volunteer.successDesc": "Thank you for your interest in volunteering. A member of the team will be in touch within 5 working days.",
    "volunteer.another": "Submit another application",
    // Events
    "events.title": "Events & Registration",
    "events.subtitle": "Register for upcoming ECOWAS Parliament 25th Anniversary events across West Africa.",
    "events.register": "Register",
    "events.registered": "Registered",
    "events.upcoming": "Upcoming Events",
    "events.noEvents": "No upcoming events at the moment. Check back soon.",
    // Speaker
    "speaker.badge": "Speaker of ECOWAS Parliament",
    "speaker.name": "Rt. Hon. Hadja Mémounatou Ibrahima",
    "speaker.title": "Speaker, ECOWAS Parliament",
    "speaker.quote": "The Speaker launched these initiatives to foster Parliament's mandate of representation of the people, in line with the ECOWAS 2050 Vision — the historic shift from an",
    "speaker.ecowasStates": "ECOWAS of States",
    "speaker.ecowasTo": "to an",
    "speaker.ecowasPeople": "ECOWAS of the People",
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
    "nav.eventsMedia": "Événements & Médias",
    "nav.people": "Personnes",
    "nav.volunteer": "Bénévolat",
    "nav.partners": "Partenaires",
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
    "footer.tagline": "Célébrant 25 ans de représentation parlementaire en Afrique de l'Ouest. Un programme d'un an à travers les 12 États membres du Parlement de la CEDEAO — 2026.",
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
    "common.volunteer": "Bénévolat",
    // Footer extra
    "footer.builtBy": "Créé par Resident Technology Ltd",
    "footer.signIn": "Connexion",
    "footer.dashboard": "Tableau de bord",
    // Volunteer page
    "volunteer.badge": "Participer",
    "volunteer.title": "Devenez bénévole",
    "volunteer.subtitle": "Rejoignez l'équipe du Programme du 25e anniversaire du Parlement de la CEDEAO. Les bénévoles jouent un rôle essentiel lors des événements, dans les communications, la traduction, la sensibilisation communautaire et bien plus encore.",
    "volunteer.formTitle": "Candidature bénévole",
    "volunteer.formDesc": "Parlez-nous de vous et de la manière dont vous souhaitez contribuer. Nous vous contacterons dans les 5 jours ouvrables.",
    "volunteer.name": "Nom complet",
    "volunteer.email": "Adresse e-mail",
    "volunteer.country": "Pays",
    "volunteer.area": "Domaine d'intérêt",
    "volunteer.skills": "Compétences et expérience",
    "volunteer.message": "Pourquoi souhaitez-vous faire du bénévolat ?",
    "volunteer.submit": "Soumettre la candidature",
    "volunteer.successTitle": "Candidature reçue",
    "volunteer.successDesc": "Merci de l'intérêt que vous portez au bénévolat. Un membre de l'équipe vous contactera dans les 5 jours ouvrables.",
    "volunteer.another": "Soumettre une autre candidature",
    // Events
    "events.title": "Événements & Inscription",
    "events.subtitle": "Inscrivez-vous aux événements du 25e anniversaire du Parlement de la CEDEAO à travers l'Afrique de l'Ouest.",
    "events.register": "S'inscrire",
    "events.registered": "Inscrit",
    "events.upcoming": "Événements à venir",
    "events.noEvents": "Aucun événement à venir pour le moment. Revenez bientôt.",
    // Speaker
    "speaker.badge": "Présidente du Parlement de la CEDEAO",
    "speaker.name": "Hon. Hadja Mémounatou Ibrahima",
    "speaker.title": "Présidente du Parlement de la CEDEAO",
    "speaker.quote": "La Présidente a lancé ces initiatives pour renforcer le mandat de représentation du Parlement au service des peuples, conformément à la Vision 2050 de la CEDEAO — le passage historique d'une",
    "speaker.ecowasStates": "CEDEAO des États",
    "speaker.ecowasTo": "à une",
    "speaker.ecowasPeople": "CEDEAO des Peuples",
  },
  pt: {
    // Navbar
    "nav.home": "Início",
    "nav.about": "Sobre",
    "nav.programmes": "Programas",
    "nav.timeline": "Cronograma",
    "nav.news": "Notícias",
    "nav.documents": "Documentos",
    "nav.stakeholders": "Partes Interessadas",
    "nav.team": "Equipa",
    "nav.getInvolved": "Participar",
    "nav.partnerWithUs": "Seja parceiro",
    "nav.contact": "Contacto",
    "nav.events": "Eventos",
    // Programme names
    "prog.youth": "Inovação Juvenil",
    "prog.trade": "Comércio & PME",
    "prog.women": "Empoderamento das Mulheres",
    "prog.civic": "Educação Cívica",
    "prog.culture": "Cultura & Criatividade",
    "prog.awards": "Prémios Parlamentares",
    "prog.parliament": "Parlamento da Juventude",
    // Footer
    "footer.programme": "Programa",
    "footer.organisation": "Organização",
    "footer.getInvolved": "Participar",
    "footer.subscribe": "Mantenha-se informado — subscreva as atualizações",
    "footer.subscribeDesc": "Anúncios de eventos · Notícias · Patrocinadores · Delegados",
    "footer.email": "O seu endereço de e-mail",
    "footer.subscribeBtn": "Subscrever",
    "footer.copyright": "© 2026 Programa do 25.º Aniversário do Parlamento da CEDEAO. Todos os direitos reservados.",
    "footer.tagline": "Celebrando 25 anos de representação parlamentar na África Ocidental. Um programa anual em todos os 12 Estados-membros do Parlamento da CEDEAO — 2026.",
    // Hero
    "hero.subtitle": "Um Movimento de Um Ano",
    "hero.description": "Não uma celebração confinada a uma data, mas um movimento de um ano através de fronteiras, gerações e setores — reafirmando a promessa de uma África Ocidental mais conectada, inclusiva e próspera.",
    "hero.explore": "Explorar o Programa",
    "hero.viewTimeline": "Ver Cronograma",
    // Common
    "common.learnMore": "Saiba mais",
    "common.readMore": "Ler mais",
    "common.contact": "Contacte-nos",
    "common.sponsor": "Patrocinar o Programa",
    "common.mediaKit": "Kit de Imprensa & Media",
    "common.volunteer": "Voluntariado",
    // Footer extra
    "footer.builtBy": "Desenvolvido por Resident Technology Ltd",
    "footer.signIn": "Entrar",
    "footer.dashboard": "Painel",
    // Volunteer page
    "volunteer.badge": "Participar",
    "volunteer.title": "Voluntarie-se connosco",
    "volunteer.subtitle": "Junte-se à equipa do Programa do 25.º Aniversário do Parlamento da CEDEAO. Os voluntários desempenham um papel vital em eventos, comunicações, tradução, sensibilização comunitária e muito mais.",
    "volunteer.formTitle": "Candidatura a voluntário",
    "volunteer.formDesc": "Fale-nos sobre si e como gostaria de contribuir. Entraremos em contacto nos próximos 5 dias úteis.",
    "volunteer.name": "Nome completo",
    "volunteer.email": "Endereço de e-mail",
    "volunteer.country": "País",
    "volunteer.area": "Área de interesse",
    "volunteer.skills": "Competências e experiência",
    "volunteer.message": "Por que razão deseja ser voluntário?",
    "volunteer.submit": "Enviar candidatura",
    "volunteer.successTitle": "Candidatura recebida",
    "volunteer.successDesc": "Obrigado pelo interesse em ser voluntário. Um membro da equipa entrará em contacto nos próximos 5 dias úteis.",
    "volunteer.another": "Enviar outra candidatura",
    // Events
    "events.title": "Eventos & Inscrição",
    "events.subtitle": "Inscreva-se nos eventos do 25.º aniversário do Parlamento da CEDEAO na África Ocidental.",
    "events.register": "Inscrever-se",
    "events.registered": "Inscrito",
    "events.upcoming": "Próximos Eventos",
    "events.noEvents": "Nenhum evento próximo de momento. Volte em breve.",
    // Speaker
    "speaker.badge": "Presidente do Parlamento da CEDEAO",
    "speaker.name": "Excelentíssima Hadja Mémounatou Ibrahima",
    "speaker.title": "Presidente do Parlamento da CEDEAO",
    "speaker.quote": "A Presidente lançou estas iniciativas para promover o mandato de representação do Parlamento ao serviço dos povos, em conformidade com a Visão 2050 da CEDEAO — a mudança histórica de uma",
    "speaker.ecowasStates": "CEDEAO de Estados",
    "speaker.ecowasTo": "para uma",
    "speaker.ecowasPeople": "CEDEAO dos Povos",
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

function detectBrowserLocale(): Locale {
  const lang = (navigator.language || "").toLowerCase();
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("pt")) return "pt";
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = localStorage.getItem("locale");
    if (stored === "en" || stored === "fr" || stored === "pt") return stored;
    return detectBrowserLocale();
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
