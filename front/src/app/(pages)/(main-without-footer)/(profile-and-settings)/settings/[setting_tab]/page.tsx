"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { generateSlug, getErrorResponse } from "@/context/Callbacks";
import { SettingsTabData } from "@/common/SettingsTabData";
import { UserProps } from "@/types/UserTypes";
import { getProfile } from "@/context/getAssets";
import Loading from "@/ui/loader/Loading";

const SettingsPage = () => {
  const router = useRouter();
  const { setting_tab } = useParams();
  const [profile, setProfile] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  const getProfileUser = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      getErrorResponse(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProfileUser();
  }, [getProfileUser]);

  useEffect(() => {
    if (!profile && !loading) {
      router.push("/auth/login");
    }
  }, [profile, router, loading]);

  const renderTab = useCallback(() => {
    if (loading) <Loading />;

    const tabs = SettingsTabData;
    const mainTab = tabs.find((t) => generateSlug(t.name) === setting_tab);

    if (!mainTab) {
      router.push(`/settings/account`);
      return null;
    }

    const ActiveTab = mainTab.tab;

    return <ActiveTab profile={profile} />;
  }, [setting_tab, loading, router, profile]);

  if (loading) return <Loading />;

  return <div>{renderTab()}</div>;
};

export default SettingsPage;
