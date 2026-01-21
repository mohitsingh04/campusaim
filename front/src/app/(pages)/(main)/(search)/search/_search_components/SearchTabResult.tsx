import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function SearchTabResult({
  setActiveTab,
  setCurrentPage,
  activeTab,
  alltabs,
}: {
  setActiveTab: any;
  setCurrentPage?: any;
  activeTab: string;
  alltabs: any;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<any>({});

  useEffect(() => {
    const defaultTab =
      alltabs.find((t: any) => t.key === activeTab) || alltabs[0];
    setTab(defaultTab);
  }, [alltabs, activeTab]);

  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-4 mt-4">
      <div className="flex gap-2 flex-wrap">
        {alltabs?.map((t: any) => (
          <button
            key={t.key}
            onClick={() => {
              setActiveTab(t.key);
              if (setCurrentPage) setCurrentPage(1);
              setTab(t);
              const params = new URLSearchParams(searchParams.toString());
              params.set("tab", t.key);
              params.delete("page", "");

              router.push(`${pathname}?${params.toString()}`);
            }}
            className={`flex items-center gap-1 px-4 py-2 my-1 text-xs cursor-pointer rounded-full shrink-0 ${
              activeTab === t.key
                ? "bg-(--text-color-emphasis) text-(--secondary-bg)"
                : "text-(--text-color-emphasis) bg-(--primary-bg) shadow-sm hover:opacity-80"
            } ${t.count <= 0 ? "hidden" : ""}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="heading font-medium">
          Found <span className="font-bold text-(--main)">{tab?.count}</span>{" "}
          {tab?.label !== "All" && tab.label} results
        </h1>
      </div>
    </div>
  );
}
