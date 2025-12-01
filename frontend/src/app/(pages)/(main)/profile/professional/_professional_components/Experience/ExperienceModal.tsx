import { ExperienceProps, PropertyProps, UserProps } from "@/types/types";
import React, { useState } from "react";
import { LuPlus, LuX } from "react-icons/lu";
import ExpereienceList from "./modalComponents/ExpereienceList";
import ExpereienceForm from "./modalComponents/ExpereienceForm";

const EditExperienceModal = ({
  profile,
  onClose,
  getProfile,
  properties,
  profileProperties,
}: {
  profile: UserProps | null;
  onClose: () => void;
  getProfile: () => void;
  properties: PropertyProps[];
  profileProperties: PropertyProps[];
}) => {
  const [editingItem, setEditingItem] = useState<ExperienceProps | null>(null);

  const handleAddNew = () => {
    const newExp: ExperienceProps = {
      position: "",
      location: "",
      start_date: "",
      end_date: "",
      currentlyWorking: false,
    };
    setEditingItem(newExp);
  };

  const handleEdit = (exp: ExperienceProps) => {
    setEditingItem({ ...exp });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Experience</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
            >
              <LuX className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!editingItem && (
            <button
              onClick={handleAddNew}
              className="w-full bg-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 mb-6 transition-all shadow-lg hover:shadow-xl"
            >
              <LuPlus className="h-5 w-5" />
              <span className="font-medium">Add Experience</span>
            </button>
          )}

          {editingItem ? (
            <ExpereienceForm
              profile={profile}
              editingItem={editingItem}
              onClose={() => setEditingItem(null)}
              getProfile={getProfile}
              properties={properties}
            />
          ) : (
            <ExpereienceList
              profile={profile}
              handleEdit={handleEdit}
              properties={properties}
              profileProperties={profileProperties}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditExperienceModal;
