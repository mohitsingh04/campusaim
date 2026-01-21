import React, { useCallback, useEffect, useState } from "react";
import SettingsTabs from "../SettingsTabs";
import { SettingsTabData } from "@/common/SettingsTabData";
import { generateSlug } from "@/context/Callbacks";
import { useParams } from "next/navigation";
import { UserProps } from "@/types/UserTypes";

export default function AccountSetting({
  profile,
}: {
  profile: UserProps | null;
}) {
  const [mainTab, setMainTab] = useState<{ name: string; sub_tab: any }>();
  const { setting_tab } = useParams();

  const findActiveTab = useCallback(() => {
    const mainTab = SettingsTabData.find(
      (tab) => generateSlug(tab.name) === setting_tab
    );
    setMainTab(mainTab);
  }, [setting_tab]);

  useEffect(() => {
    findActiveTab();
  }, [findActiveTab]);
  return (
    <div>
      {/* <SettingsHeader label={mainTab?.name || ""} /> */}
      <SettingsTabs tabs={mainTab?.sub_tab} profile={profile} />
    </div>
  );
}
