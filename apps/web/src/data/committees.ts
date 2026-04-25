export type MemberPosition = "Chairman" | "Vice Chairman" | "1st Rapporteur" | "2nd Rapporteur" | "Member";

export interface CommitteeMember {
  name: string;
  position: MemberPosition;
}

export interface Committee {
  id: string;
  name: string;
  members: CommitteeMember[];
}

function assignPositions(names: string[]): CommitteeMember[] {
  const positions: MemberPosition[] = ["Chairman", "Vice Chairman", "1st Rapporteur", "2nd Rapporteur"];
  return names.map((name, i) => ({
    name,
    position: i < positions.length ? positions[i] : "Member",
  }));
}

export const COMMITTEES: Committee[] = [
  {
    id: "administration-finance-budget",
    name: "Committee on Administration, Finance and Budget",
    members: assignPositions([
      "Hon. Benjamin Okezie KALU",
      "Hon. Fatma GUEYE",
      "Hon. Shiaka Musa SAMA",
      "Hon. Emmanuel Kwasi BEDZRAH",
      "Hon. Nassirou Bako ARIFARI",
      "Hon. Isa Filomena Pereira Soares DA COSTA",
      "Hon. Yapo Germain AKE",
      "Hon. Gabriela Alfredo FERNANDES",
      "Hon. Taa Z WONGBE",
      "Hon. Senanu Koku ALIPUI",
    ]),
  },
  {
    id: "agriculture-environment-natural-resources",
    name: "Committee on Agriculture, Environment and Natural Resources",
    members: assignPositions([
      "Hon. Mohammed Ali NDUME",
      "Hon. Laadi Ayii AYAMBA",
      "Hon. Bademba BALDÉ",
      "Hon. Mamadou DIOMANDÉ",
      "Hon. Bio Sika Abdel Kamel OUASSAGARI",
      "Hon. Nazifi SANI",
      "Hon. Lawal Adamu USMAN",
    ]),
  },
  {
    id: "energy-mines",
    name: "Committee on Energy and Mines",
    members: assignPositions([
      "Hon. Fanta CONTÉ",
      "Hon. Saa Emerson LAMINA",
      "Hon. Cécile Ségbégnon AHOUMENOU",
      "Hon. Eric AFFUL",
      "Hon. Natasha AKPOTI-UDUAGHAN",
      "Hon. Jimoh IBRAHIM",
    ]),
  },
  {
    id: "education-science-culture",
    name: "Committee on Education, Science and Culture",
    members: assignPositions([
      "Hon. Kweku George RICKETTS-HAGAN",
      "Hon. Onyeka Peter NWEBONYI",
      "Hon. Fatou BA",
      "Hon. Sékou DORÉ",
      "Hon. Usman Auyo IBRAHIM",
    ]),
  },
  {
    id: "health",
    name: "Committee on Health",
    members: assignPositions([
      "Hon. Orlando PEREIRA DIAS",
      "Hon. Osita NGWU",
      "Hon. Herve AKA",
      "Hon. Nelson MOREIRA",
      "Hon. Rev. Samuel Reagan ENDERS",
      "Hon. Ipalibo Harry BANIGO",
    ]),
  },
  {
    id: "industry-private-sector",
    name: "Committee on Industry and Private Sector",
    members: assignPositions([
      "Hon. Califa SEIDI",
      "Hon. Amadou CAMARA",
      "Hon. Kwame ANYIMADU-ANTWI",
      "Hon. Uleji Y. M. Innocent KAGBARA",
      "Hon. Peter Udogalanya AIEKWE",
      "Hon. Paschal A. AGBODIKE",
    ]),
  },
  {
    id: "infrastructure",
    name: "Committee on Infrastructure",
    members: assignPositions([
      "Hon. Mamadou SAKO",
      "Hon. Ahmed Mohammed MUNIR",
      "Hon. Carlos Alberto DOS SANTOS TAVARES",
      "Hon. Idiat Oluranti ADEBULE",
      "Hon. Bamidele SALAM",
      "Hon. Abdul KAROBO",
    ]),
  },
  {
    id: "legal-affairs-human-rights",
    name: "Committee on Legal Affairs and Human Rights",
    members: assignPositions([
      "Hon. Jérémie ADOMAHOU",
      "Hon. Jenekai Alex TYLER SR.",
      "Hon. Marciano INDI",
      "Hon. Ismaila Mamadou Abdoul WONE",
      "Hon. Canice Moore Chukwugozie NWACHUKWU",
      "Hon. Zainab GIMBA",
      "Hon. Mabinty Fatmata FUNNA",
    ]),
  },
  {
    id: "macro-economic-policy",
    name: "Committee on Macro-Economic Policy and Economic Research",
    members: assignPositions([
      "Hon. Alhagie S. DARBO",
      "Hon. Koné GNANGADJOMON",
      "Hon. Sheriff S. SARR",
      "Hon. Bashiru Ayinla DAWODU",
      "Hon. Sadiq Suleiman UMAR",
      "Hon. Zakaria Dauda NYAMPA",
    ]),
  },
  {
    id: "political-affairs-peace-security",
    name: "Committee on Political Affairs, Peace, Security & APRM",
    members: assignPositions([
      "Hon. Edwin Melvin SNOWE JR.",
      "Hon. Salifou ISSA",
      "Hon. Awaji-Inobek Dagomie ABIANTE",
      "Hon. Dominic NAPARE",
      "Hon. Rosa Lopes ROCHA",
      "Hon. Abdoulaye KEITA",
      "Hon. Ireti Heebah KINGIBE",
      "Hon. Mamadou DIAW",
    ]),
  },
  {
    id: "public-accounts",
    name: "Committee on Public Accounts",
    members: assignPositions([
      "Hon. Guy Marius SAGNA",
      "Hon. Moussokoura Chantal FANNY",
      "Hon. Osita Bonaventure IZUNASO",
      "Hon. Nelson DO ROSÁRIO DE BRITO",
      "Hon. Sharafadeen Abiodun ALLI",
      "Hon. Aniekan Etim BASSEY",
    ]),
  },
  {
    id: "social-affairs-gender-women",
    name: "Committee on Social Affairs, Gender, Women Empowerment and Persons with Disabilities",
    members: assignPositions([
      "Hon. Veronica Kadie SESAY",
      "Hon. Fatoumata Yebhé BAH",
      "Hon. Blessing Onyeche ONUH",
      "Hon. Moima Dabah BRIGGS MENSAH",
      "Hon. Maimuna CEESAY",
      "Hon. Blessing Chigeru AMADI",
    ]),
  },
  {
    id: "trade-customs-free-movement",
    name: "Committee on Trade, Customs and Free Movement",
    members: assignPositions([
      "Hon. Amdiatta DIABY",
      "Hon. Senou SOKLINGBÉ",
      "Hon. Sulaiman Gumi ABUBAKAR",
      "Hon. David S.U. JIMKITU",
      "Hon. Manuel Iré Do Nascimento LOPES",
      "Hon. Bryan ACHEAMPONG",
      "Hon. Abubakar Ahmad MOHAMMAD",
    ]),
  },
  {
    id: "gender-women-development",
    name: "Committee on Gender and Women Development",
    members: assignPositions([
      "Hon. Veronica Kadie SESAY",
      "Hon. Fatoumata Yebhé BAH",
      "Hon. Blessing Onyeche ONUH",
      "Hon. Moima Dabah BRIGGS MENSAH",
      "Hon. Maimuna CEESAY",
      "Hon. Blessing Chigeru AMADI",
    ]),
  },
];

const committeeIndex = Object.fromEntries(COMMITTEES.map((c) => [c.id, c]));

export const PROGRAMME_COMMITTEES: Record<string, string[]> = {
  youth:      ["education-science-culture"],
  trade:      ["trade-customs-free-movement"],
  women:      ["social-affairs-gender-women"],
  civic:      ["political-affairs-peace-security"],
  culture:    ["education-science-culture"],
  awards:     ["administration-finance-budget"],
  parliament: ["legal-affairs-human-rights", "macro-economic-policy"],
};

export function getCommitteesForProgramme(slug: string): Committee[] {
  const ids = PROGRAMME_COMMITTEES[slug] ?? [];
  return ids.map((id) => committeeIndex[id]).filter(Boolean);
}
