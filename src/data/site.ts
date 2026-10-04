/**
 * Centralised content for Unity Welcome Settlement Agency.
 * All factual information here is taken from the organisation's existing site.
 * Do not add statistics, testimonials, partners or claims that are not verified.
 */

export const org = {
  name: "Unity Welcome Settlement Agency",
  shortName: "Unity Welcome",
  tagline: "Helping newcomers and multicultural communities thrive in Canada",
  intro:
    "Unity Welcome Settlement Agency supports refugees, immigrants and multicultural communities across Canada — from the first days of arrival to lasting, self-sufficient success.",
  vision:
    "A united and inclusive Canada where diverse communities thrive together in dignity, respect, and shared success.",
  mission:
    "To empower and support multicultural communities in Canada by promoting inclusion, cultural pride, equal opportunity, and meaningful community engagement.",
  focus:
    "We work to strengthen community engagement, support newcomer settlement, promote education and youth development, encourage economic empowerment, and build cross-cultural understanding.",
  aboutLead:
    "Unity Welcome Settlement Agency is dedicated to empowering refugees, immigrants, and vulnerable communities to build new lives with dignity, opportunity, and a true sense of belonging.",
  leadershipQuote:
    "At Unity Settlement, we believe that every person deserves a welcoming community, access to opportunity, and the support to thrive. Together, we are building bridges that connect cultures, create hope, and transform lives.",
  leadershipQuoteAuthor: "The Unity Settlement Leadership Team",
  phone: "+1 (519) 722-4339",
  phoneHref: "tel:+15197224339",
  email: "Dleiyu@yahoo.com",
  location: "Toronto, Ontario — accessible by public transit",
  closingStatement: "Building stronger communities, together.",
} as const;

export const nav = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Programs", to: "/programs" },
  { label: "Get Support", to: "/get-support" },
  { label: "Resources", to: "/resources" },
  { label: "Blog", to: "/blog" },
  { label: "Stories", to: "/stories" },
  { label: "Contact", to: "/contact" },
] as const;

export const values = [
  {
    name: "Inclusivity",
    body: "Embracing diversity and ensuring everyone feels welcomed, valued, and represented in our community.",
  },
  {
    name: "Empowerment",
    body: "Enabling individuals to achieve self-sufficiency and take control of their futures with confidence.",
  },
  {
    name: "Collaboration",
    body: "Working together with communities, partners, and stakeholders to maximize our collective impact.",
  },
  {
    name: "Compassion",
    body: "Leading with empathy and understanding in every interaction and service we provide.",
  },
  {
    name: "Equity",
    body: "Promoting fairness and ensuring equal access to opportunities and resources for all.",
  },
  {
    name: "Community Building",
    body: "Creating connections that transform strangers into neighbors and neighbors into family.",
  },
  {
    name: "Youth Empowerment",
    body: "Investing in education and leadership development for the next generation.",
  },
  {
    name: "Cultural Celebration",
    body: "Honoring heritage while embracing Canadian unity.",
  },
] as const;

export type Program = {
  slug: string;
  number: string;
  title: string;
  short: string;
  summary: string;
  offerings: string[];
  image: string;
  imageAlt: string;
};

export const programs: Program[] = [
  {
    slug: "settlement-assistance",
    number: "01",
    title: "Settlement Assistance",
    short: "Housing support and essential resources for newcomers",
    summary:
      "We help newcomers find safe, affordable housing and navigate the essentials of settling into a new community. Our settlement workers provide one-on-one support with finding accommodation, setting up utilities, accessing healthcare, and understanding local systems and services.",
    offerings: [
      "Housing search assistance and referrals",
      "Orientation to local services and resources",
      "Help with opening bank accounts",
      "Public transit navigation",
      "School registration for children",
    ],
    image: "settlement",
    imageAlt:
      "A settlement worker handing apartment keys to a newcomer family arriving with their suitcases",
  },
  {
    slug: "language-and-skills-training",
    number: "02",
    title: "Language & Skills Training",
    short: "English classes and vocational programs",
    summary:
      "Language is the key to integration. Our comprehensive language programs help newcomers gain confidence in English while also developing valuable job skills. We offer classes at all levels, from complete beginners to advanced professional English.",
    offerings: [
      "ESL classes for all proficiency levels",
      "Workplace language training",
      "Computer literacy programs",
      "Job-specific skills workshops",
      "Credential recognition support",
    ],
    image: "language",
    imageAlt: "Adult learners in an English language class in a community centre",
  },
  {
    slug: "community-integration",
    number: "03",
    title: "Community Integration Programs",
    short: "Cultural events and community building",
    summary:
      "Building connections is essential for feeling at home. Our community programs create opportunities for newcomers to meet their neighbors, learn about local culture, and share their own traditions. We believe that integration is a two-way process that enriches everyone.",
    offerings: [
      "Cultural orientation workshops",
      "Community mentorship matching",
      "Social and recreational activities",
      "Multicultural festivals and events",
      "Volunteer opportunities",
    ],
    image: "community",
    imageAlt: "Families sharing food together at an outdoor multicultural community festival",
  },
  {
    slug: "legal-and-documentation",
    number: "04",
    title: "Legal & Documentation Support",
    short: "Immigration guidance and paperwork assistance",
    summary:
      "Navigating immigration systems can be overwhelming. Our team provides guidance on documentation, helps with paperwork, and connects individuals with legal professionals when needed. We ensure that everyone understands their rights and options.",
    offerings: [
      "Immigration document assistance",
      "Status application support",
      "Legal rights education",
      "Referrals to immigration lawyers",
      "Form completion assistance",
    ],
    image: "legal",
    imageAlt: "A caseworker reviewing immigration documents with a young man at a desk",
  },
  {
    slug: "mental-health-and-wellness",
    number: "05",
    title: "Mental Health & Wellness",
    short: "Counseling and emotional support services",
    summary:
      "The journey of displacement can take a significant toll on mental health. Our culturally-sensitive counseling services provide a safe space for individuals and families to process their experiences, build resilience, and work toward healing.",
    offerings: [
      "Individual counseling sessions",
      "Family therapy services",
      "Support groups for trauma survivors",
      "Youth mental health programs",
      "Wellness workshops and activities",
    ],
    image: "wellness",
    imageAlt: "A small, quiet support group sitting in a circle in a warm room",
  },
  {
    slug: "employment-services",
    number: "06",
    title: "Employment Services",
    short: "Job search support and career development",
    summary:
      "Finding meaningful employment is often a top priority for newcomers. Our employment team provides comprehensive support from resume building to job placement, helping individuals find work that matches their skills and experience.",
    offerings: [
      "Resume and cover letter writing",
      "Interview preparation coaching",
      "Job search strategies and resources",
      "Networking opportunities",
      "Connection with employers",
    ],
    image: "employment",
    imageAlt: "A newcomer greeting a mentor at a job skills workshop",
  },
];

export const boardMembers = [
  { name: "Daraje Leiyu", photo: "3" },
  { name: "Michael Benti", photo: "4" },
  { name: "Sammy Gebrael", photo: "5" },
  { name: "Mesi Haileyesus", photo: "6" },
] as const;

export type Story = {
  slug: string;
  quote: string;
  name: string;
  role: string;
  category: string;
  title: string;
};

/** Community voices published on the organisation's existing website. */
export const stories: Story[] = [
  {
    slug: "mikiyas-g-finding-a-community",
    title: "Finding not just a home, but a community",
    quote:
      "Unity Welcome Settlement helped my family find not just a home, but a community. After fleeing our country, we thought we had lost everything. They showed us that hope and kindness still exist.",
    name: "Mikiyas G.",
    role: "Refugee from Ethiopia",
    category: "Settlement",
  },
  {
    slug: "miguel-r-from-no-english-to-a-first-job",
    title: "From no English to a first job in one year",
    quote:
      "The language training program changed my life. Within a year, I went from knowing no English to landing my first job. The staff treated me like family every step of the way.",
    name: "Miguel R.",
    role: "Immigrant from Venezuela",
    category: "Language & Skills",
  },
  {
    slug: "fatima-a-support-for-the-whole-person",
    title: "Support for the whole person",
    quote:
      "When I needed legal help with my documentation, they were there. When I needed someone to talk to, they listened. This organization truly cares about the whole person.",
    name: "Fatima A.",
    role: "Refugee from Afghanistan",
    category: "Legal & Wellness",
  },
];

export const contactSubjects = [
  "Service Inquiry",
  "Volunteer Opportunity",
  "Donation Question",
  "Partnership Proposal",
  "Media Inquiry",
  "Other",
] as const;
