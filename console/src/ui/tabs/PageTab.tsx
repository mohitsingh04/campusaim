import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  content: React.ReactNode;
  isHidden?: boolean;
}

interface PageTabProps {
  title?: string;
  items: TabItem[];
  defaultTab?: string;
  queryKey?: string; // optional query key (default: "tab")
  className?: string;
}

export const PageTab: React.FC<PageTabProps> = ({
  title,
  items,
  defaultTab,
  queryKey = "tab",
  className = "",
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL or fallback to defaultTab
  const initialTab = searchParams.get(queryKey) || defaultTab || items[0]?.id;
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync URL when tab changes
  useEffect(() => {
    const current = searchParams.get(queryKey);
    if (activeTab !== current) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set(queryKey, activeTab);
      setSearchParams(newParams, { replace: true }); // replace avoids extra history entries
    }
  }, [activeTab, queryKey, searchParams]);

  // Sync tab state if user changes URL manually
  useEffect(() => {
    const urlTab = searchParams.get(queryKey);
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

  const activeItem = items.find((i) => i.id === activeTab) || items[0];

  return (
    <div className={`space-y-6 ${className}`}>
      {title && (
        <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
          {title}
        </h2>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-[var(--yp-border-primary)]">
        <nav className="flex space-x-8 overflow-x-auto">
          {items
            .filter((item) => !item.isHidden)
            .map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === item.id
                      ? "border-[var(--yp-main)] text-[var(--yp-main)]"
                      : "border-transparent text-[var(--yp-text-primary)] hover:text-[var(--yp-main)]"
                  }`}
                >
                  {Icon && <Icon size={15} />}
                  {item.label}
                </button>
              );
            })}
        </nav>
      </div>

      {/* Active Tab Content */}
      <div className="mt-4">
        {activeItem?.content ?? (
          <div className="text-sm text-[var(--yp-text-secondary)]">
            No content available for this tab.
          </div>
        )}
      </div>
    </div>
  );
};
