import API from "@/contexts/API";
import { UserProps } from "@/types/types";
import { AxiosError } from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { LuFileText, LuX } from "react-icons/lu";

export function ResumeModal({
  profile,
  closeModal,
  onUploaded,
}: {
  profile: UserProps | null;
  closeModal: () => void;
  onUploaded: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileSelect = e.target.files?.[0];
    if (!fileSelect) return;

    // ✅ Allowed file types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(fileSelect.type)) {
      toast.error("Only PDF, DOC, or DOCX files are allowed.");
      return;
    }

    // ✅ File size check (max 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (fileSelect.size > maxSizeInBytes) {
      toast.error("File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    setSelectedFile(fileSelect);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a valid resume file first.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("userId", String(profile?.uniqueId));
      formData.append("resume", selectedFile);

      const response = await API.post(`/profile/doc/resume`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(response.data.message);
      onUploaded();
      closeModal();
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      toast.error(
        err.response?.data?.error || "Failed to upload resume. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LuFileText className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-purple-600">
              Upload Your Resume
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
          >
            <LuX className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-center">
          {!selectedFile ? (
            <>
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
                  <LuFileText className="h-12 w-12 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Enhance Your Profile with Your Resume
              </h3>
              <p className="text-gray-600 text-sm">
                Upload your resume to showcase your skills and boost your
                profile visibility.
              </p>
              <label className="cursor-pointer inline-block">
                <span className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all duration-200">
                  Choose File
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </>
          ) : (
            <div className="space-y-3">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <LuFileText className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            Only PDF, DOC, or DOCX files under 5MB are accepted.
          </p>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={closeModal}
              className="px-6 py-3 border-2 border-purple-600 hover:border-purple-800 rounded-xl text-purple-600 hover:text-purple-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              disabled={!selectedFile || isLoading}
              onClick={handleUpload}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Uploading..." : "Upload Resume"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
