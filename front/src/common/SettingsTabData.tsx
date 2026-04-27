import AccountSetting from "@/app/(pages)/(main-without-footer)/(profile-and-settings)/settings/_setting_components/setting_tabs/AccountSetting";
import ProfileTab from "@/app/(pages)/(main-without-footer)/(profile-and-settings)/settings/_setting_components/account_setting_tab/ProfileTab";
import LocationTab from "@/app/(pages)/(main-without-footer)/(profile-and-settings)/settings/_setting_components/account_setting_tab/LocationTab";
import SecuritySetting from "@/app/(pages)/(main-without-footer)/(profile-and-settings)/settings/_setting_components/account_setting_tab/SecuritySetting";
import { MapIcon, SettingsIcon, UserIcon, UserLockIcon } from "lucide-react";

export const SettingsTabData = [
  {
    name: "Account",
    icon: SettingsIcon,
    href: "/settings/account",
    tab: AccountSetting,
    sub_tab: [
      { label: "Profile", tab: ProfileTab, icon: UserIcon },
      { label: "Location", tab: LocationTab, icon: MapIcon },
      { label: "Security", tab: SecuritySetting, icon: UserLockIcon },
    ],
  },
];
