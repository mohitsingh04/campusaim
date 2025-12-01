import { MapPin, Clock, BookOpen, Globe, User, FileText } from "lucide-react";
import { Tabs } from "../../ui/tabs/Tabs";
import ProfessionalBasicDetails from "./tabs/BasicDetails";
import ProfessionalLocationDetails from "./tabs/Location";
import { useCallback, useEffect, useState } from "react";
import {
  AllLanaguagesProps,
  AllSkillsProps,
  DashboardOutletContextProps,
  UserProps,
} from "../../types/types";
import { API } from "../../contexts/API";
import { useOutletContext, useParams } from "react-router-dom";
import { AxiosResponse } from "axios";
import ProfessionalSkillsAndLanguages from "./tabs/SkillsLanguages";
import ProfessionalExperience from "./tabs/Experience";
import ProfessionalEducation from "./tabs/Education";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { getErrorResponse } from "../../contexts/Callbacks";
import CountUp from "react-countup";
import UserViewSkeleton from "../../ui/loadings/pages/UserViewSkeleton";
import { TbUserShield } from "react-icons/tb";
import UserPermissions from "./tabs/UserPermissions";

export function UserView() {
  const { objectId } = useParams();
  const [profileData, setProfileData] = useState<UserProps | null>(null);
  const [allSkills, setAllSkills] = useState<AllSkillsProps[]>([]);
  const [allLanguages, setAllLanguages] = useState<AllLanaguagesProps[]>([]);
  const [allDegreeAndInstitute, setAllDegreeAndInstitute] = useState<
    any | null
  >(null);
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

  /** Fetch degree + institute lists */
  const getAllDegreeAndInstitute = useCallback(async () => {
    try {
      const [degreeRes, instRes] = await Promise.all([
        API.get(`/profile/degree`),
        API.get(`/profile/institute`),
      ]);
      setAllDegreeAndInstitute({
        degree: degreeRes.data || [],
        institute: instRes.data || [],
      });
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  /** Fetch all skills & languages list */
  const getAllSkillAndLanguages = useCallback(async () => {
    try {
      const [skillsRes, langRes] = await Promise.all([
        API.get(`/profile/skill/all/list`),
        API.get(`/profile/language/all/list`),
      ]);
      setAllSkills(skillsRes.data || []);
      setAllLanguages(langRes.data || []);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  const getLanguage = (id: string) => {
    const lang = allLanguages.find((item) => item.uniqueId === Number(id));
    return lang?.language ?? "Unknown";
  };
  const getSkill = (id: string) => {
    const skill = allSkills.find((item) => item.uniqueId === Number(id));
    return skill?.skill ?? "Unknown";
  };

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

      const [
        bioResult,
        locationResult,
        skillResult,
        languageResult,
        resumeResult,
        expResult,
        eduResult,
        scoreResult,
      ] = await Promise.allSettled([
        API.get(`/profile/bio/${uniqueId}`),
        API.get(`/profile/location/${uniqueId}`),
        API.get(`/profile/skill/${uniqueId}`),
        API.get(`/profile/language/${uniqueId}`),
        API.get(`/profile/doc/resume/${uniqueId}`),
        API.get(`/profile/experience/${uniqueId}`),
        API.get(`/profile/education/${uniqueId}`),
        API.get(`/profile/score/${uniqueId}`),
      ]);

      const getData = function <T>(
        result: PromiseSettledResult<AxiosResponse<T>>,
        fallback: T
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
        heading: getData(bioResult, {}).heading || "",
        about: getData(bioResult, {}).about || "",
        skills: getData(skillResult, {}).skills || [],
        languages: getData(languageResult, {}).languages || [],
        resume: getData(resumeResult, {}).resume,
        experiences: getData(expResult, []),
        education: getData(eduResult, []),
        score: getData(scoreResult, {}).score,
      };

      setProfileData(finalData);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      getAllSkillAndLanguages();
      getAllDegreeAndInstitute();
      setLoading(false);
    }
  }, [getUser, getAllSkillAndLanguages, getAllDegreeAndInstitute]);

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
    {
      id: "experience",
      label: "Experience",
      icon: Clock,
      content: <ProfessionalExperience professional={profileData} />,
      isProfessional: profileData?.isProfessional ? true : false,
    },
    {
      id: "education",
      label: "Education",
      icon: BookOpen,
      content: (
        <ProfessionalEducation
          professional={profileData}
          allDegreeAndInstitute={allDegreeAndInstitute}
        />
      ),
      isProfessional: profileData?.isProfessional ? true : false,
    },
    {
      id: "skills-languages",
      label: "Skills & Languages",
      icon: Globe,
      content: (
        <ProfessionalSkillsAndLanguages
          professional={profileData}
          getSkill={getSkill}
          getLanguage={getLanguage}
        />
      ),
      isProfessional: profileData?.isProfessional ? true : false,
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
              <div>
                <p className="text-lg font-bold text-[var(--yp-text-primary)]">
                  <CountUp start={0} end={profileData?.skills?.length || 0} />
                </p>
                <p className="text-sm text-[var(--yp-muted)]">Skills</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--yp-text-primary)]">
                  <CountUp
                    start={0}
                    end={profileData?.languages?.length || 0}
                  />
                </p>
                <p className="text-sm text-[var(--yp-muted)]">Languages</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 md:mt-0 flex space-x-3 justify-center md:justify-end">
            {profileData?.resume && (
              <a
                href={`${import.meta.env.VITE_MEDIA_URL}${profileData?.resume}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
              >
                <FileText className="w-4 h-4 mr-2" />
                View CV
              </a>
            )}
          </div>
        </div>

        <Tabs
          tabs={tabs?.filter((item) => item?.isProfessional)}
          defaultActive="basic-details"
        />
      </div>
    </div>
  );
}
