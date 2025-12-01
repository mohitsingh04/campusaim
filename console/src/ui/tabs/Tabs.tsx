import { useEffect, useState, ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

interface Tab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultActive?: string;
  queryKey?: string;
}

export function Tabs({ tabs, defaultActive, queryKey = "tab" }: TabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab =
    searchParams.get(queryKey) ||
    defaultActive ||
    (tabs.length > 0 ? tabs[0].id : "");

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get(queryKey);
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, queryKey, activeTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    searchParams.set(queryKey, tabId);
    setSearchParams(searchParams);
  };

  return (
    <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm overflow-hidden">
      {/* Tab headers */}
      <div className="border-b border-[var(--yp-border-primary)]">
        <div className="flex space-x-8 px-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[var(--yp-main)] text-[var(--yp-main)]"
                    : "border-transparent text-[var(--yp-text-secondary)] hover:text-[var(--yp-text-primary)]"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div>{tabs.find((t) => t.id === activeTab)?.content}</div>
    </div>
  );
}
