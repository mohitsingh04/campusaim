import Image from "next/image";

export const socailLinks = [
  {
    name: "Facebook",
    src: "/img/social-links/facebook.webp",
    href: "https://www.facebook.com/yogprernaofficial",
  },
  {
    name: "Instagram",
    src: "/img/social-links/insta.webp",
    href: "https://www.instagram.com/yog_prerna",
  },
  {
    name: "X",
    src: "/img/social-links/x-twiter.webp",
    href: "https://x.com/PrernaYog40326",
  },
  {
    name: "YouTube",
    src: "/img/social-links/youtube.webp",
    href: "https://www.youtube.com/@yogprerna108",
  },
  {
    name: "Linkedin",
    src: "/img/social-links/linkedin.webp",
    href: "https://www.linkedin.com/company/yogprerna",
  },
];

export const SocialLinksComponent = ({
  classNames = "gap-x-8 gap-y-2",
  size = "w-8 h-8",
}: {
  classNames?: string;
  size?: string;
}) => {
  return (
    <div
      className={`flex flex-wrap justify-center items-center ${classNames} my-5`}
    >
      {socailLinks.map((item, i) => {
        return (
          <a
            key={i}
            href={item.href}
            title={item.name}
            target="_blank"
            className={`relative ${size} rounded-full hover:scale-110 hover:rotate-12 transition-transform duration-300 overflow-hidden`}
          >
            <Image
              src={item.src}
              alt={`${item.name} icon`}
              fill
              sizes="(max-width: 768px) 32px, (max-width: 1200px) 40px, 48px"
              quality={90}
              priority={i < 3}
              className="object-contain"
            />
          </a>
        );
      })}
    </div>
  );
};
