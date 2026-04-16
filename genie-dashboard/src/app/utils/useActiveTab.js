import { useSearchParams } from "react-router-dom";

export default function useActiveTab(validTabs, defaultTab) {
    const [searchParams, setSearchParams] = useSearchParams();

    const tab = searchParams.get("tab");

    if (!tab || !validTabs.includes(tab)) {
        const params = new URLSearchParams(searchParams);
        params.set("tab", defaultTab);
        setSearchParams(params, { replace: true });

        return defaultTab;
    }

    return tab;
}