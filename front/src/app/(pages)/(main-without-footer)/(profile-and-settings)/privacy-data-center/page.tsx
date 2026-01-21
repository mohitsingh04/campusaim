"use client";
import React, { JSX, useState } from "react";

// 🔹 Type for a single privacy option
interface PrivacyOption {
  id: number;
  label: string;
  description: string;
  isChecked: boolean;
}

export default function PrivacyDataCenter(): JSX.Element {
  // 1. Define the privacy options data
  const [privacyOptions, setPrivacyOptions] = useState<PrivacyOption[]>([
    {
      id: 1,
      label: "Public Profile Visibility",
      description: "Allow your profile to be seen by non-registered users.",
      isChecked: true,
    },
    {
      id: 2,
      label: "Marketing Emails",
      description: "Receive updates, newsletters, and promotional offers.",
      isChecked: false,
    },
    {
      id: 3,
      label: "Third-Party Data Sharing",
      description: "Allow us to share anonymized data with partners.",
      isChecked: false,
    },
    {
      id: 4,
      label: "Location Tracking",
      description: "Enable location-based services and recommendations.",
      isChecked: true,
    },
    {
      id: 5,
      label: "Activity History",
      description:
        "Save your search and viewing history for better suggestions.",
      isChecked: true,
    },
    {
      id: 6,
      label: "Personalized Ads",
      description: "Show advertisements based on your interests.",
      isChecked: false,
    },
  ]);

  // 2. Function to toggle checkboxes
  const handleToggle = (id: number): void => {
    setPrivacyOptions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-white p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">
            Privacy Data Center
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage your personal data and privacy preferences below.
          </p>
        </div>

        {/* List of Checkboxes */}
        <ul className="divide-y divide-gray-100">
          {privacyOptions.map((option) => (
            <li
              key={option.id}
              className={`p-5 transition-colors duration-200 hover:bg-gray-50 ${
                option.isChecked ? "bg-blue-50/30" : ""
              }`}
            >
              <label className="flex items-start cursor-pointer w-full">
                {/* Checkbox */}
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    checked={option.isChecked}
                    onChange={() => handleToggle(option.id)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Text Content */}
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-semibold text-base ${
                        option.isChecked ? "text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        option.isChecked
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {option.isChecked ? "Enabled" : "Disabled"}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm mt-1">
                    {option.description}
                  </p>
                </div>
              </label>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex justify-end">
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-all shadow-sm active:scale-95"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
