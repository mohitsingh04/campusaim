"use client";
import React from "react";
import BadgeBorder from "../badge/BadgeBorder";

interface HeadingProps {
  title: string;
  subtitle?: string;
  activetitle: string;
  tag?: string;
}
export const HeadingProps: React.FC<HeadingProps> = ({
  tag,
  title,
  subtitle,
  activetitle,
}) => {
  return (
    <div className="w-full animate-fade-in-up">
      <BadgeBorder label={tag || ""} />
      <h2 className="text-3xl font-bold text-(--text-color-emphasis) my-3 leading-tight">
        {title}
        <span className="text-(--main)">{activetitle}</span>
      </h2>
      <p className="text-lg text-(--text-color) max-w-4xl mb-3 leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
};
