import { LuMap, LuSettings, LuUser } from "react-icons/lu";
import AccountSetting from "@/app/(pages)/(main-without-footer)/(profile-and-settings)/settings/_setting_components/setting_tabs/AccountSetting";
import ProfileTab from "@/app/(pages)/(main-without-footer)/(profile-and-settings)/settings/_setting_components/account_setting_tab/ProfileTab";
import { FaUserLock } from "react-icons/fa";

import LocationTab from "@/app/(pages)/(main-without-footer)/(profile-and-settings)/settings/_setting_components/account_setting_tab/LocationTab";
import SecuritySetting from "@/app/(pages)/(main-without-footer)/(profile-and-settings)/settings/_setting_components/account_setting_tab/SecuritySetting";

export const SettingsTabData = [
  {
    name: "Account",
    icon: LuSettings,
    href: "/settings/account",
    tab: AccountSetting,
    sub_tab: [
      { label: "Profile", tab: ProfileTab, icon: LuUser },
      { label: "Location", tab: LocationTab, icon: LuMap },
      { label: "Security", tab: SecuritySetting, icon: FaUserLock },
    ],
  },
];
