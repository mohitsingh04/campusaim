import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import React from "react";

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ReactElement;
  redirect?: string;
}

interface TabsProps {
  tabs: Tab[];
  showNav?: boolean;
}

export function PropertyTabs({ tabs, showNav = true }: TabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTabId = searchParams.get("tab") || tabs[0]?.id || "";

  useEffect(() => {
    if (!searchParams.get("tab") && tabs.length > 0) {
      setSearchParams({ tab: tabs[0].id });
    }
  }, [searchParams, setSearchParams, tabs]);

  const handleTabChange = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.redirect) {
      navigate(tab.redirect);
    } else {
      setSearchParams({ tab: tabId });
    }
  };

  const scrollTabs = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  const activeTabData = tabs.find((t) => t.id === activeTabId);

  return (
    <div>
      {/* Navigation */}
      {showNav && (
        <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div
              ref={scrollRef}
              className="flex space-x-8 overflow-x-auto scrollbar-hide"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTabId === tab.id
                      ? "border-[var(--yp-main)] text-[var(--yp-main)]"
                      : "border-transparent text-[var(--yp-muted)] hover:text-[var(--yp-main)]"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => scrollTabs("left")}
                className="p-2 text-[var(--yp-muted)] hover:text-[var(--yp-main)]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollTabs("right")}
                className="p-2 text-[var(--yp-muted)] hover:text-[var(--yp-main)]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!activeTabData?.redirect && (
        <div className="mt-6 bg-[var(--yp-primary)] rounded-xl shadow-sm overflow-hidden">
          {activeTabData?.component || <p>Not found</p>}
        </div>
      )}
    </div>
  );
}
