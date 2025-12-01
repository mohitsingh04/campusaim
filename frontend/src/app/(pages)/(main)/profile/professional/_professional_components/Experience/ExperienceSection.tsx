import { PropertyProps, UserProps } from "@/types/types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LuAward, LuCalendar, LuMap, LuPen } from "react-icons/lu";
import EditExperienceModal from "./ExperienceModal";
import API from "@/contexts/API";
import { getPropertyDetails } from "@/contexts/Callbacks";

export default function ExperienceSection({
  profile,
  getProfile,
}: {
  profile: UserProps | null;
  getProfile: () => void;
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [properties, setProperties] = useState<PropertyProps[]>([]);
  const [profileProperties, setProfileProperties] = useState<PropertyProps[]>(
    []
  );

  const getProperties = useCallback(async () => {
    try {
      const response = await API.get(`/property`);
      setProperties(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getProperties();
  }, [getProperties]);

  const getProfileProperties = useCallback(async () => {
    try {
      const response = await API.get(`/profile/properties`);
      setProfileProperties(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getProfileProperties();
  }, [getProfileProperties]);

  const groupedExperiences = useMemo(() => {
    if (!profile?.experiences) return [];

    const map = new Map<string, typeof profile.experiences>();

    profile.experiences.forEach((exp) => {
      const key =
        exp.property_id?.toString() ??
        exp.property_name_id?.toString() ??
        exp.position;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(exp);
    });

    return Array.from(map.values());
  }, [profile]);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:shadow-purple-100 border border-purple-100 overflow-hidden">
      <div className="bg-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <LuAward className="h-5 w-5 text-purple-600" />
            <span>Experience</span>
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
              {profile?.experiences?.length ?? 0}
            </span>
          </h2>
          <button
            onClick={() => setShowEditModal(true)}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 p-2 rounded-lg transition-all"
          >
            <LuPen className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {groupedExperiences.length > 0 ? (
          <div className="space-y-6">
            {groupedExperiences.map((experiences, index) => {
              const firstExp = experiences[0];

              const propertyName = firstExp.property_id
                ? getPropertyDetails(firstExp.property_id, properties)
                    ?.property_name
                : firstExp.property_name_id
                ? getPropertyDetails(
                    firstExp.property_name_id,
                    profileProperties
                  )?.property_name
                : "";

              return (
                <div key={index} className="relative">
                  {index !== groupedExperiences.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-full bg-purple-200 to-transparent"></div>
                  )}

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white font-bold text-lg"></span>
                    </div>
                    <div className="flex-1 bg-purple-50 rounded-xl p-4 border border-purple-100">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {propertyName || "Unknown Company"}
                      </h3>
                      <div className="space-y-2 mt-2">
                        {experiences.map((expItem, idx) => (
                          <div
                            key={idx}
                            className="border-t border-purple-100 pt-2 first:border-t-0 first:pt-0"
                          >
                            <p className="text-purple-600 font-semibold">
                              {expItem.position}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <LuMap className="h-4 w-4" />
                                <span>{expItem.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <LuCalendar className="h-4 w-4" />
                                <span>
                                  {new Date(
                                    expItem.start_date
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    year: "numeric",
                                  })}{" "}
                                  {" - "}
                                  {expItem.currentlyWorking
                                    ? "Present"
                                    : new Date(
                                        expItem.end_date
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        year: "numeric",
                                      })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <LuAward className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 italic">
              Add your work experience to showcase your professional journey...
            </p>
            <button
              onClick={() => setShowEditModal(true)}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
            >
              Add Experience
            </button>
          </div>
        )}
      </div>

      {showEditModal && (
        <EditExperienceModal
          profile={profile}
          getProfile={getProfile}
          onClose={() => setShowEditModal(false)}
          properties={properties}
          profileProperties={profileProperties}
        />
      )}
    </div>
  );
}
