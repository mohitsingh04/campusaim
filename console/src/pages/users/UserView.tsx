import { MapPin, User } from "lucide-react";
import { Tabs } from "../../ui/tabs/Tabs";
import ProfessionalBasicDetails from "./tabs/BasicDetails";
import ProfessionalLocationDetails from "./tabs/Location";
import { useCallback, useEffect, useState } from "react";
import { DashboardOutletContextProps, UserProps } from "../../types/types";
import { API } from "../../contexts/API";
import { useOutletContext, useParams } from "react-router-dom";
import { AxiosResponse } from "axios";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { getErrorResponse } from "../../contexts/Callbacks";
import UserViewSkeleton from "../../ui/loadings/pages/UserViewSkeleton";
import { TbUserShield } from "react-icons/tb";
import UserPermissions from "./tabs/UserPermissions";

export function UserView() {
  const { objectId } = useParams();
  const [profileData, setProfileData] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);
  const { getRoleById } = useOutletContext<DashboardOutletContextProps>();

  const getUser = useCallback(async () => {
    try {
      const response = await API.get(`/profile/user/${objectId}`);
      const data = response.data;
      return { ...data, role: getRoleById(data.role) };
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [objectId, getRoleById]);

  /** Main profile fetch */
  const getProfileUser = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getUser();

      if (!profile || !profile?.uniqueId) {
        console.error("Invalid profile or unauthorized role.");
        window.location.href = "/not-found";
        return;
      }

      const uniqueId = profile.uniqueId;

      const [locationResult] = await Promise.allSettled([
        API.get(`/profile/location/${uniqueId}`),
      ]);

      const getData = function <T>(
        result: PromiseSettledResult<AxiosResponse<T>>,
        fallback: T,
      ): T {
        return result.status === "fulfilled" ? result.value.data : fallback;
      };

      const finalData = {
        ...profile,
        address: getData(locationResult, {}).address || "",
        pincode: getData(locationResult, {}).pincode || "",
        state: getData(locationResult, {}).state || "",
        city: getData(locationResult, {}).city || "",
        country: getData(locationResult, {}).country || "",
      };

      setProfileData(finalData);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [getUser]);

  useEffect(() => {
    getProfileUser();
  }, [getProfileUser]);

  const tabs = [
    {
      id: "basic-details",
      label: "Basic Details",
      icon: User,
      content: <ProfessionalBasicDetails professional={profileData} />,
      isProfessional: true,
    },
    {
      id: "user-permissions",
      label: "User Permissions",
      icon: TbUserShield,
      content: <UserPermissions professional={profileData} />,
      isProfessional: true,
    },
    {
      id: "location",
      label: "Location",
      icon: MapPin,
      content: <ProfessionalLocationDetails professional={profileData} />,
      isProfessional: true,
    },
  ];

  if (loading) return <UserViewSkeleton />;

  return (
    <div>
      <div className="space-y-6">
        <Breadcrumbs
          title="User"
          breadcrumbs={[
            {
              label: "Dashboard",
              path: "/dashboard",
            },
            {
              label: "User",
              path: "/dashboard/users",
            },
            { label: profileData?.name || "User" },
          ]}
        />
        <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:space-x-6">
          {/* Profile Image */}
          <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 mx-auto md:mx-0">
            <img
              src={
                profileData?.avatar?.[0]
                  ? profileData.avatar[0].startsWith("http")
                    ? profileData.avatar[0]
                    : `${import.meta.env.VITE_MEDIA_URL}/${
                        profileData.avatar[0]
                      }`
                  : "/img/default-images/yp-user.webp"
              }
              alt={profileData?.name || "Profile"}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
            <h1 className="text-2xl font-bold text-[var(--yp-text-primary)]">
              {profileData?.name}
            </h1>
            <p className="text-[var(--yp-muted)]">{profileData?.role || ""}</p>

            <div className="flex justify-center md:justify-start space-x-8 mt-4">
              {/* <div>
                <p className="text-lg font-bold text-[var(--yp-text-primary)]">
                  <CountUp
                    start={0}
                    end={profileData?.languages?.length || 0}
                  />
                </p>
                <p className="text-sm text-[var(--yp-muted)]">Languages</p>
              </div> */}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 md:mt-0 flex space-x-3 justify-center md:justify-end"></div>
        </div>

        <Tabs
          tabs={tabs?.filter((item) => item?.isProfessional)}
          defaultActive="basic-details"
        />
      </div>
    </div>
  );
}
