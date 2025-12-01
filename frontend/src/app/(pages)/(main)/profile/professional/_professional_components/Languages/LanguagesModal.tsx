import API from "@/contexts/API";
import { getLanguageNameById } from "@/contexts/Callbacks";
import {
  AllLanaguagesProps,
  SelectOptionProps,
  UserProps,
} from "@/types/types";
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuTrash, LuX } from "react-icons/lu";
import CreatableSelect from "react-select/creatable";

const LanguagesModal = ({
  profile,
  onClose,
  getProfile,
  allLanguages,
}: {
  profile: UserProps | null;
  onClose: () => void;
  allLanguages: AllLanaguagesProps[];
  getProfile: () => void;
}) => {
  const [newLanguage, setNewLanguage] = useState<SelectOptionProps | null>(
    null
  );
  const [languages, setLanguages] = useState<number[]>([]);

  useEffect(() => {
    if (profile) {
      setLanguages(profile?.languages || []);
    }
  }, [profile]);

  const options = allLanguages?.map((lang) => ({
    label: lang.language,
    value: lang.uniqueId,
  }));

  const handleAddLanguage = async () => {
    if (!newLanguage) return;

    const existingOption = allLanguages?.find(
      (lang) => lang.uniqueId === newLanguage.value
    );

    const payload = {
      userId: profile?.uniqueId,
      ...(existingOption
        ? { languageId: newLanguage.value }
        : { language: newLanguage.label }),
    };

    try {
      const response = await API.patch(`/profile/language`, payload);
      toast.success(response.data.message);
      setNewLanguage(null);
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      toast.error(err.response?.data?.error || "Failed to add language.");
    } finally {
      getProfile();
    }
  };

  const handleRemoveLanguage = async (language: number) => {
    try {
      const response = await API.patch(
        `/profile/language/remove/${profile?.uniqueId}`,
        { language: language }
      );
      toast.success(response.data.message);
      setLanguages((prev) => prev.filter((lang) => lang !== language));
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      toast.error(err.response?.data?.error || "Failed to add language.");
    } finally {
      getProfile();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Edit Languages</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
            >
              <LuX className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-purple-50 to-emerald-50 p-4 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-3">Add Language</h3>
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
              <div className="flex-1">
                <CreatableSelect
                  options={options}
                  onChange={(selected) => setNewLanguage(selected)}
                  value={newLanguage}
                  placeholder="Add or type a language"
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  maxMenuHeight={200}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderWidth: "0px",
                      minHeight: "3rem",
                      paddingLeft: "0.75rem",
                      paddingRight: "0.75rem",
                      boxShadow: "none",
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 50,
                    }),
                  }}
                />
              </div>
              <button
                onClick={handleAddLanguage}
                className="px-6 py-3 bg-purple-500 to-emerald-500 hover:from-purple-600 hover:to-emerald-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-medium mt-1 md:mt-0"
              >
                Add Language
              </button>
            </div>
          </div>

          {/* Current Languages */}
          <div className="mb-6">
            {(languages?.length || 0) > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {languages?.map((language, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-xs"
                  >
                    <div>
                      <span className="font-semibold text-gray-900">
                        {getLanguageNameById(language, allLanguages)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveLanguage(language)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-100 bg-red-50 p-2 rounded-lg transition-all"
                    >
                      <LuTrash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                <p className="text-gray-500 italic">
                  No languages added yet. Search and add languages above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguagesModal;
