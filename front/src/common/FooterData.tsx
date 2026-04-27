export const FooterStates = [
  {
    name: "Uttarakhand",
    href: "/college?state=india",
  },
  // {
  //   name: "Uttar Pradesh",
  //   href: "/college?state=united-states",
  // },
  // {
  //   name: "Nepal",
  //   href: "/college?state=nepal",
  // },
  // {
  //   name: "Canada",
  //   href: "/college?state=canada",
  // },
  // {
  //   name: "Russia",
  //   href: "/college?state=russia",
  // },
  // {
  //   name: "peru",
  //   href: "/college?state=peru",
  // },
  // {
  //   name: "Spain",
  //   href: "/college?state=spain",
  // },
  // {
  //   name: "Thailand",
  //   href: "/college?state=thailand",
  // },
  // {
  //   name: "Ireland",
  //   href: "/college?state=ireland",
  // },
];
export const CategoriesList = [
  {
    name: "University",
    href: "/college?category=univerisity",
  },
  { name: "College", href: "/college?category=college" },
  { name: "Schools", href: "/college?category=school" },
  {
    name: "Coaching",
    href: "/college?category=coaching",
  },
];

export const QuickLinks = [
  // { name: "Yoga Near Me", href: "/yoga-near-me", external: false },
  { name: "About Us", href: "/about-us", external: false },
  // { name: "News & Updates", href: "/news-and-updates", external: false },
  // { name: "Blog", href: "/blog", external: false },
  { name: "Compare", href: "/compare/select", external: false },
  // { name: "Events", href: "/events", external: false },
  {
    name: "Add Your Institute",
    href: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}`,
    external: true,
  },
  {
    name: "Ask Community",
    href: `${process.env.NEXT_PUBLIC_ASK_URL}`,
    external: true,
  },
  { name: "Contact Us", href: "/contact-us", external: false },
];

export const FEATURE_LINKS = [
  {
    name: "Ask Community",
    href: `${process.env.NEXT_PUBLIC_ASK_URL}`,
    external: true,
  },
  { name: "Compare", href: "/compare/select", external: false },
  // {
  //   name: "Yoga Near Me",
  //   href: "/yoga-near-me",
  //   badge: "On Site",
  //   external: false,
  // },
  // { name: "Professional", href: "/comming-soon", external: false },
  // {
  //   name: "Ask Prerna (AI)",
  //   href: "/ask-prerna",
  //   badge: "Beta",
  //   external: true,
  // },
];
