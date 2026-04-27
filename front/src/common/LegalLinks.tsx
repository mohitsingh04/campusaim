import Link from "next/link";

export const LEGAL_LINKS = [
  { name: "Terms & Conditions", href: "/terms-and-conditions" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Disclaimer", href: "/disclaimer" },
  { name: "Cookies", href: "/cookies" },
  { name: "Cancellation Policy", href: "/cancellation-policy" },
  { name: "Community Guidelines", href: "/community-guidelines" },
];

export const LegaLinksComponents = () => {
  return (
    <div className="flex flex-wrap justify-center heading-sm mb-5">
      {LEGAL_LINKS.map((item, i) => (
        <div key={i}>
          <Link
            href={item.href}
            className="hover:underline text-(--text-color-emphasis) hover:text-(--main)"
          >
            {item.name}
          </Link>
          {i !== LEGAL_LINKS.length - 1 && <span className="mx-3">|</span>}
        </div>
      ))}
    </div>
  );
};
