"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import API from "@/context/API";
import { generateSlug } from "@/context/Callbacks";
import { CourseProps, SeoProps, SimpleLocationProps } from "@/types/Types";
import SearchModal from "../search_modal/SearchModal";
import HeadingLine from "@/ui/headings/HeadingLine";
import FooterLoader from "@/ui/loader/component/FooterLoader";
import MobileBottomBar from "@/ui/loader/component/MobileBottomBar";
import { BottomNavBar } from "./BottomNavbar";
// import { SocialLinksComponent } from "@/common/SocailMedaiData";
import { LegaLinksComponents } from "@/common/LegalLinks";
import { CopyRightsFooter } from "./FooterNoLinks";
import { useResponsive } from "@/hooks/useResponsive";
import {
  CategoriesList,
  FEATURE_LINKS,
  FooterStates,
  QuickLinks,
} from "@/common/FooterData";

const FooterMenuList = ({
  title,
  viewall,
  list_data,
}: {
  title: string;
  viewall?: string;
  list_data: {
    href: string;
    image?: string;
    name: string;
    external?: boolean;
  }[];
}) => {
  return (
    <div>
      <HeadingLine title={title} className="text-xs font-bold! mt-2" />
      <ul className="space-y-2 footer-list">
        {list_data.map((item, i) => (
          <li key={i}>
            <Link
              href={item?.href}
              title={item?.name}
              target={item?.external ? "_blank" : "_self"}
              className="text-(--text-color) hover:text-(--main) flex items-center gap-2 transition capitalize"
            >
              {item?.image && (
                <div className="relative h-4 w-6 rounded-sm overflow-hidden">
                  <Image
                    src={item.image}
                    alt={`${item.name} flag`}
                    fill
                    sizes="24px"
                    priority
                    fetchPriority="high"
                    className="object-contain"
                  />
                </div>
              )}
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      {viewall && (
        <Link
          href={viewall}
          title={`View all ${title}`}
          className="text-gradient hover:underline text-xs font-semibold"
        >
          View all
        </Link>
      )}
    </div>
  );
};

const Footer = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useResponsive();

  const { data, isLoading } = useQuery({
    queryKey: ["footer-assets"],
    queryFn: async () => {
      const [courRes, seosRes, locsRes] = await Promise.allSettled([
        API.get("/course"),
        API.get("/all/seo?type=course"),
        API.get("/property/unique/location/pairs?limit=9&sort=desc"),
      ]);
      const cour = courRes.status === "fulfilled" ? courRes.value?.data : [];
      const seos = seosRes.status === "fulfilled" ? seosRes.value?.data : [];
      const locs = locsRes.status === "fulfilled" ? locsRes.value?.data : [];
      const processedCourses = cour?.map((cou: CourseProps) => ({
        ...cou,
        course_slug:
          seos?.find((s: SeoProps) => s?.course_id === cou?._id)?.slug ||
          generateSlug(cou?.course_name),
      }));
      return { courses: processedCourses, locations: locs };
    },
       staleTime: 1000 * 60 * 5,
  });

  const menus = useMemo(() => {
    const slug = (val: string) => generateSlug(val || "");
    return {
      locations: data?.locations?.map((item: SimpleLocationProps) => ({
        name: item?.city,
        href: `/institutes?city=${slug(item?.city || "")}&state=${slug(item?.state || "")}`,
      })),
      courses: data?.courses?.map((item: CourseProps) => ({
        name: item?.course_name,
        href: `/course/${item?.course_slug}`,
      })),
      topCities: data?.locations?.map((item: SimpleLocationProps) => ({
        name: `top university in ${item.city}`,
        href: `/top-university-in-${slug(item.city || "")}`,
      })),
      topCountries: FooterStates?.slice(0, 9).map((item) => ({
        name: `top college in ${item.name}`,
        href: `/top-college-in-${slug(item.name)}`,
      })),
    };
  }, [data]);

  if (isLoading) {
    return (
      <>
        {isMobile && <MobileBottomBar />}
        <FooterLoader />
      </>
    );
  }

  return (
    <>
      <footer className="bg-(--primary-bg) text-(--text-color) py-10 px-4 sm:px-8 border-t border-(--border)">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-3 lg:grid-cols-7">
            <FooterMenuList
              title="States"
              list_data={FooterStates}
              viewall="/locations"
            />
            <FooterMenuList
              title="Locations"
              list_data={menus.locations}
              viewall="/locations"
            />

            <div className="space-y-6">
              <FooterMenuList title="Campus" list_data={CategoriesList} />
              {/* <FooterMenuList
                title="Teacher Training"
                list_data={CoursesList}
              /> */}
            </div>

            <FooterMenuList
              title="Courses"
              list_data={menus?.courses}
              viewall="/courses"
            />
            <FooterMenuList title="Quick Links" list_data={QuickLinks} />
            <FooterMenuList title="Top cities" list_data={menus.topCities} />
            <FooterMenuList
              title="Top Colleges"
              list_data={menus.topCountries}
            />
          </div>
          <hr className="border-(--border) my-8" />
          <div className="flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-6">
              {FEATURE_LINKS.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  title={item?.name}
                  className="text-sm text-(--text-color-emphasis) hover:text-(--main) transition"
                >
                  {item.name}
                  {/* {item.badge && (
                    <span className="ml-2 bg-( --main-extra) text-(--main-emphasis) text-[10px] px-1.5 py-0.5 rounded uppercase">
                      {item.badge}
                    </span>
                  )} */}
                </Link>
              ))}
            </div>
            {/* <SocialLinksComponent /> */}
          </div>
          <div className="pt-8 border-t border-(--border)">
            <LegaLinksComponents />
            <CopyRightsFooter />
          </div>
        </div>
      </footer>
      {isMobile && <BottomNavBar setIsSearchOpen={setIsSearchOpen} />}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Footer;
