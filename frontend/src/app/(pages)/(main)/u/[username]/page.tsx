"use client";
import React, { useCallback, useEffect, useState } from "react";
import Banner from "./_professional_components/Banner";
import { AllDegreeAndInstituteProps, UserProps } from "@/types/types";
import { LuBadgeCheck } from "react-icons/lu";
import ProfileImage from "./_professional_components/ProfileImage";
import AboutSection from "./_professional_components/About/AboutSection";
import API from "@/contexts/API";
import LanguagesSection from "./_professional_components/Languages/LanguagesSection";
import SkillSection from "./_professional_components/Skills/SkillSection";
import { AxiosResponse } from "axios";
import ExperienceSection from "./_professional_components/Experience/ExperienceSection";
import EducationSection from "./_professional_components/Education/Education";
import ProfessionalLoader from "@/components/Loader/Professional/ProfessionalLoader";
import Suggestions from "./_professional_components/Suggestions/Suggestions";
import { useParams } from "next/navigation";

export default function Professional() {
  const { username } = useParams();
  const [profileData, setProfileData] = useState<UserProps | null>(null);
  const [allSKills, setAllSkills] = useState([]);
  const [allLanguages, SetAllLanguages] = useState([]);
  const [allDegreeAndInstitute, setAllDegreeAndInstitute] =
    useState<AllDegreeAndInstituteProps | null>(null);
  const [loading, setLoading] = useState(true);

  const getAllDegreeAndInstitute = useCallback(async () => {
    try {
      const [degreeRes, instRes] = await Promise.all([
        API.get(`/profile/degree`),
        API.get(`/profile/institute`),
      ]);
      const finalData = {
        degree: degreeRes.data || [],
        institute: instRes.data || [],
      };

      setAllDegreeAndInstitute(finalData);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getAllDegreeAndInstitute();
  }, [getAllDegreeAndInstitute]);

  const getAllSkillAndLanuages = useCallback(async () => {
    try {
      const [skillsRes, langRes] = await Promise.all([
        API.get(`/profile/skill/all/list`),
        API.get(`/profile/language/all/list`),
      ]);
      setAllSkills(skillsRes.data);
      SetAllLanguages(langRes.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getAllSkillAndLanuages();
  }, [getAllSkillAndLanuages]);

  const getUserProfile = useCallback(async () => {
    try {
      const resposnse = await API.get(`/profile/username/${username}`);
      return resposnse.data;
    } catch (error) {
      console.log(error);
    }
  }, [username]);

  const getProfileUser = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getUserProfile();

      if (!profile || !profile.isProfessional || !profile?.uniqueId) {
        console.warn("Invalid profile or unauthorized role.");
        window.location.href = "/";
        return;
      }

      const uniqueId = profile.uniqueId;

      const [bioResult, skillResult, languageResult, expResult, eduResult] =
        await Promise.allSettled([
          API.get(`/profile/bio/${uniqueId}`),
          API.get(`/profile/skill/${uniqueId}`),
          API.get(`/profile/language/${uniqueId}`),
          API.get(`/profile/experience/${uniqueId}`),
          API.get(`/profile/education/${uniqueId}`),
        ]);

      const getData = function <T>(
        result: PromiseSettledResult<AxiosResponse<T>>,
        fallback: T
      ): T {
        return result.status === "fulfilled" ? result.value.data : fallback;
      };
      const finalData = {
        ...profile,
        heading: getData(bioResult, {}).heading || "",
        about: getData(bioResult, {}).about || "",
        skills: getData(skillResult, {}).skills || [],
        skillsId: getData(skillResult, {}).uniqueId,
        languages: getData(languageResult, {}).languages || [],
        languageId: getData(languageResult, {}).uniqueId,
        experiences: getData(expResult, []),
        education: getData(eduResult, []),
      };

      setProfileData(finalData);
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
      window.location.href = "/";
    } finally {
      getAllSkillAndLanuages();
      getAllDegreeAndInstitute();
      setLoading(false);
    }
  }, [getAllSkillAndLanuages, getAllDegreeAndInstitute, getUserProfile]);

  useEffect(() => {
    getProfileUser();
  }, [getProfileUser]);

  if (loading) {
    return <ProfessionalLoader />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <Banner profile={profileData} />
        <div className="relative">
          <div className="bg-purple-50 px-6 pb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-end space-y-6 lg:space-y-0 lg:space-x-8 -mt-20">
              <ProfileImage profile={profileData} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3 mb-2">
                      <span>{profileData?.name}</span>
                      <span className="inline-flex items-center px-3 py-1  mt-2 rounded-full text-xs font-semibold bg-purple-100 to-indigo-100 text-purple-800 ring-1 ring-purple-300 shadow-sm">
                        <LuBadgeCheck className="me-1" />
                        Professional
                      </span>
                    </h1>
                    <p className="text-purple-600 font-medium text-lg mb-1">
                      @{profileData?.username}
                    </p>
                    {profileData?.heading && (
                      <p className="text-gray-700 text-lg mb-4">
                        {profileData?.heading}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AboutSection profile={profileData} />
            <ExperienceSection profile={profileData} />
            <EducationSection
              profile={profileData}
              allDegreeAndInstitute={allDegreeAndInstitute}
            />
            <SkillSection profile={profileData} allSkills={allSKills} />
            <LanguagesSection
              profile={profileData}
              allLanguages={allLanguages}
            />
          </div>
          <div className="space-y-8">
            <Suggestions profile={profileData} />
          </div>
        </div>
      </div>
    </div>
  );
}
