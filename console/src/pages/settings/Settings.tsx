"use client";

import { useState } from "react";
import {
  Shield,
  Globe,
  Menu,
  X,
  Settings,
  MapPin,
  Smile,
  Headset,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import LocationSettings from "./settings_tab/location/LocationSettings";
import GeneralSettings from "./settings_tab/general/GeneralSettings";
import SecuritySettings from "./settings_tab/security/SecuritySettings";
import FeedbackSetting from "./settings_tab/feedback/FeedbackSetting";

// ✅ Define a clear type for your tabs
type SettingTab = {
  id: string;
  label: string;
  icon: any;
  component: React.ComponentType<any> | null;
};

export function SettingsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "general";
  const navigate = useNavigate();

  // ✅ Define all settings tabs
  const settingsTabs: SettingTab[] = [
    {
      id: "general",
      label: "General",
      icon: Globe,
      component: GeneralSettings,
    },
    {
      id: "location",
      label: "Location",
      icon: MapPin,
      component: LocationSettings,
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      component: SecuritySettings,
    },
    {
      id: "feedback",
      label: "Feedback",
      icon: Smile,
      component: FeedbackSetting,
    },
    {
      id: "support",
      label: "Help And Support",
      icon: Headset,
      component: null, // no component, this tab redirects
    },
  ];

  // ✅ Handle tab change
  const changeTab = (tabId: string) => {
    if (tabId === "support") {
      navigate("/dashboard/support");
      return;
    }
    setSearchParams({ tab: tabId });
    setMobileMenuOpen(false);
  };

  // ✅ Dynamically find the active component
  const ActiveComponent =
    settingsTabs.find((tab) => tab.id === activeTab)?.component ||
    GeneralSettings;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="Settings"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Settings" },
        ]}
      />

      {/* Mobile menu button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden inline-flex items-center p-2 rounded-md text-[var(--yp-muted)] hover:bg-[var(--yp-tertiary)]"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
                    : "text-[var(--yp-muted)] hover:bg-[var(--yp-primary)]"
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile Offcanvas Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            <div className="fixed inset-y-0 left-0 w-64 bg-[var(--yp-secondary)] shadow-xl p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[var(--yp-text-primary)] flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Settings
                </h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[var(--yp-muted)]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-1">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => changeTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
                        : "text-[var(--yp-muted)] hover:bg-[var(--yp-primary)]"
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* ✅ Render Active Component */}
        <div className="lg:col-span-3">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
}
