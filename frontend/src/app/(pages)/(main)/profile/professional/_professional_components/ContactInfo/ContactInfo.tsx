import { UserProps } from "@/types/types";
import React from "react";
import {
  LuMail,
  LuMap,
  LuPhone,
  LuPhoneCall,
  LuPhoneIncoming,
} from "react-icons/lu";

export default function ContactInfo({
  profile,
}: {
  profile: UserProps | null;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:shadow-purple-100 border border-purple-100 overflow-hidden">
      <div className="bg-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <LuPhoneIncoming className="h-5 w-5 text-purple-600" />
          <span>Contact Info</span>
        </h3>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-purple-50 to-indigo-50 rounded-xl border border-purple-100">
          <div className="w-10 h-10 bg-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <LuMail className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">
              Email
            </p>
            <p className="text-gray-500 font-medium">{profile?.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-purple-50 to-indigo-50 rounded-xl border border-purple-100">
          <div className="w-10 h-10 bg-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <LuPhoneCall className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">
              Primary Phone
            </p>
            <p className="text-gray-500 font-medium">{profile?.mobile_no}</p>
          </div>
        </div>
        {profile?.alt_mobile_no && (
          <div className="flex items-center space-x-3 p-3 bg-purple-50 to-indigo-50 rounded-xl border border-purple-100">
            <div className="w-10 h-10 bg-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <LuPhone className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">
                Alternate Phone
              </p>
              <p className="text-gray-500 font-medium">
                {profile?.alt_mobile_no}
              </p>
            </div>
          </div>
        )}
        {profile?.address &&
          profile?.pincode &&
          profile?.city &&
          profile?.state &&
          profile?.country && (
            <div className="flex items-center space-x-3 p-3 bg-purple-50 to-indigo-50 rounded-xl border border-purple-100">
              <div className="w-10 h-10 bg-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <LuMap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">
                  Location
                </p>
                <p className="text-gray-500 font-medium">
                  {profile?.address} {profile?.pincode} {profile?.city}{" "}
                  {profile?.state} {profile?.country}
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
