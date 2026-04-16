import { useSearchParams } from "react-router-dom";

export default function TabsRouter({
    tabs = [],
    activeTab,
    className = "",
}) {
    const [searchParams, setSearchParams] = useSearchParams();

    const handleTabChange = (tab) => {
        const params = new URLSearchParams(searchParams);
        params.set("tab", tab);
        setSearchParams(params);
    };

    return (
        <div className={`border-b border-gray-200 ${className}`}>
            <nav className="-mb-px flex gap-6 overflow-x-auto px-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => handleTabChange(tab.value)}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
              ${activeTab === tab.value
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }
            `}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}