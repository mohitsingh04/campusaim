import { getPropertyDetails } from "@/contexts/Callbacks";
import { ExperienceProps, PropertyProps, UserProps } from "@/types/types";
import React from "react";
import { LuPen } from "react-icons/lu";

export default function ExpereienceList({
  profile,
  handleEdit,
  properties,
  profileProperties,
}: {
  profile: UserProps | null;
  handleEdit: (exp: ExperienceProps) => void;
  properties: PropertyProps[];
  profileProperties: PropertyProps[];
}) {
  return (
    <div>
      <div className="space-y-4 mb-6">
        {profile?.experiences.map((exp, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-purple-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {exp.position}
                  </h3>
                  <p className="text-purple-600 font-medium">
                    {exp?.property_id
                      ? getPropertyDetails(exp?.property_id, properties)
                          ?.property_name
                      : exp?.property_name_id &&
                        getPropertyDetails(
                          exp?.property_name_id,
                          profileProperties
                        )?.property_name}
                  </p>
                  <p className="text-gray-500 text-sm">{exp.location}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(exp.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {exp.currentlyWorking
                      ? "Present"
                      : new Date(exp.end_date).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(exp)}
                  className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-all"
                >
                  <LuPen className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
