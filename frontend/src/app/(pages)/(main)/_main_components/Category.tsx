"use client";

import React from "react";
import { motion } from "framer-motion";
import { LuLaptop, LuSchool, LuLandmark, LuStore } from "react-icons/lu";
import { cardVariants } from "@/contexts/varients";
import { CategoryItem, ColorKey } from "@/types/types";
import Link from "next/link";

type CSSVariableStyle = React.CSSProperties & {
  [key: `--${string}`]: string;
};

const colorClasses: Record<
  ColorKey,
  { bg: string; icon: string; button: string }
> = {
  blue: {
    bg: "bg-[#e6f0fa]",
    icon: "text-blue-700",
    button: "bg-blue-700 text-white hover:bg-blue-800",
  },
  green: {
    bg: "bg-[#e6f9f0]",
    icon: "text-green-700",
    button: "bg-green-700 text-white hover:bg-green-800",
  },
  purple: {
    bg: "bg-[#f1e6fa]",
    icon: "text-purple-700",
    button: "bg-purple-700 text-white hover:bg-purple-800",
  },
  orange: {
    bg: "bg-[#fff2e5]",
    icon: "text-orange-700",
    button: "bg-orange-700 text-white hover:bg-orange-800",
  },
};

// Categories data
const categories: CategoryItem[] = [
  {
    icon: LuSchool,
    title: "Colleges",
    link: "online-yoga-studio",
    description: "Practice from the comfort of your home with expert trainers.",
    linkText: "Explore Colleges",
    color: "blue",
  },
  {
    icon: LuLandmark,
    title: "Universities",
    link: "university",
    description: "Explore university-level yoga degree & diploma programs.",
    linkText: "Explore Universities",
    color: "purple",
  },
  {
    icon: LuLaptop,
    title: "Schools",
    link: "college",
    description: "Browse certified yoga colleges with government affiliations.",
    linkText: "List of Defense Schools",
    color: "green",
  },
  {
    icon: LuStore,
    title: "Academies",
    link: "yoga-studio",
    description: "Join a local yoga studio for in-person group training.",
    linkText: "List of Academies",
    color: "orange",
  },
];

export default function Category() {
  return (
    <section className="py-20 px-4 sm:px-10 md:px-20">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-center mb-2 leading-snug tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        Discover Our <span className="text-purple-600">Categories</span>
      </motion.h2>

      <motion.p
        className="text-gray-600 text-center mx-auto mb-12 text-sm sm:text-base"
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        viewport={{ once: true }}
      >
        Explore properties options tailored to your goals—from online classes to top
        institutions.
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {categories.map((cat, index) => {
          const styles = colorClasses[cat.color];

          return (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`flipCardHover rounded-2xl p-6 transition-all duration-300 group ${styles.bg}`}
              style={{ "--bg-color": cat.color } as CSSVariableStyle}
            >
              <div className="flex items-center justify-between mb-4">
                <cat.icon size={40} className={styles.icon} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {cat.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                {cat.description}
              </p>
              <Link
                href={`/yoga-institutes?category=${cat?.link}`}
                className="text-sm font-medium underline text-gray-700 hover:text-black transition"
              >
                {cat.linkText}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
