import React from "react";
import { Star, Languages } from "lucide-react";
import { MdBlock } from "react-icons/md";
import { UserProps } from "../../../types/types";

interface SectionProps {
  title: string;
  items: string[];
  icon?: React.ReactNode;
  getName: (id: string) => string;
}

const Section: React.FC<SectionProps> = ({ title, items, icon, getName }) => {
  return (
    <div>
      <div className="bg-[var(--yp-secondary)] rounded-2xl shadow-sm mb-8 overflow-hidden">
        {/* Card Title */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--yp-border-primary)] bg-[var(--yp-secondary)]">
          <div className="p-2 bg-[var(--yp-main-subtle)] rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--yp-text-primary)]">
            {title}
          </h2>
        </div>

        {/* Items */}
        <div className="px-4 sm:px-6 py-4 flex flex-wrap gap-3">
          {items.length > 0 ? (
            items.map((item, index) => (
              <span
                key={index}
                className="bg-[var(--yp-primary)] text-[var(--yp-text-primary)] 
                 text-sm sm:text-base font-medium px-3 py-1 
                 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                {getName(item)}
              </span>
            ))
          ) : (
            // No items placeholder
            <div className="flex flex-col items-center justify-center w-full py-8 text-[var(--yp-muted)]">
              <MdBlock className="w-12 h-12 mb-4 text-[var(--yp-muted)]" />
              <p>No {title} added yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ProfessionalSkillsAndLanguages({
  professional,
  getSkill,
  getLanguage,
}: {
  professional: UserProps | null;
  getSkill: (id: string) => string;
  getLanguage: (id: string) => string;
}) {
  return (
    <div className="bg-[var(--yp-primary)] py-8 px-4 sm:px-6 md:px-10">
      <div className="space-y-6">
        {/* Skills Section */}
        <Section
          title="Skills"
          items={professional?.skills || []}
          getName={getSkill}
          icon={
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--yp-main)]" />
          }
        />

        {/* Languages Section */}
        <Section
          title="Languages"
          items={professional?.languages || []}
          getName={getLanguage}
          icon={
            <Languages className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--yp-main)]" />
          }
        />
      </div>
    </div>
  );
}
