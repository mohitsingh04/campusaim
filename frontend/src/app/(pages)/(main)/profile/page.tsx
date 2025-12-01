"use client";
import { useCallback, useEffect, useState } from "react";
import {
  LuBadgeCheck,
  LuBadgeX,
  LuLock,
  LuLogOut,
  LuMail,
  LuMap,
  LuPen,
  LuPhone,
  LuPhoneCall,
  LuTrash,
  LuUser,
} from "react-icons/lu";
import ImageUpload from "./_profilecomponents/ImageUpload";
import { UserProps } from "@/types/types";
import { getProfile, handleLogout } from "@/contexts/getAssets";
import Link from "next/link";
import DeleteAccountModal from "./_modals/DeleteAccountModal";
import VerifyAccountModal from "./_modals/VerifyAccountModal";
import SwitchProfessionalModal from "./_modals/SwitchProfessionalModal";
import { useRouter } from "next/navigation";
import ProfileLoader from "@/components/Loader/Profile/ProfileLoader";

const Profile = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const router = useRouter();
  const [profile, setProfile] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  const getProfileUser = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProfileUser();
  }, [getProfileUser]);

  useEffect(() => {
    if (!loading) {
      if (profile?.isProfessional) {
        router.push(`/profile/professional`);
      }
    }
  }, [router, loading, profile]);

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.push(`/`);
      }
    }
  }, [router, loading, profile]);

  if (loading) {
    return <ProfileLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="h-20 relative bg-cover bg-center rounded-t-2xl"></div>

          <div className="relative px-8 pb-8">
            <div className="flex items-end justify-between -mt-16 mb-6">
              <div className="relative">
                <ImageUpload profile={profile} />
              </div>

              <div className="flex gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <Link
                    href={`/profile/edit`}
                    className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 text-nowrap"
                  >
                    <LuPen size={16} />
                    Edit Profile
                  </Link>

                  {/* <button
                    onClick={() => setShowSwitchModal(true)}
                    className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 text-nowrap"
                  >
                    <LuUser size={16} />
                    Switch Professional
                  </button> */}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-gray-500">
                  @{profile?.username}
                </h4>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.name}
                </h1>
                {profile?.verified ? (
                  <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mt-2">
                    <LuBadgeCheck className="w-4 h-4" />
                    Verified Account
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium mt-2">
                    <LuBadgeX className="w-4 h-4" />
                    Unverified Account
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Profile Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <LuUser size={16} className="text-purple-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Full Name
                </label>
                <p className="text-gray-900 font-medium">{profile?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <LuMail size={16} className="text-purple-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email
                </label>
                <p className="text-gray-900 font-medium">{profile?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <LuPhone size={16} className="text-purple-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Phone
                </label>
                <p className="text-gray-900 font-medium">
                  {profile?.mobile_no}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2  gap-6 mt-5">
            {profile?.address &&
              profile.pincode &&
              profile.city &&
              profile.state &&
              profile.country && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <LuMap size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Location
                    </label>
                    <p className="text-gray-900 font-medium">
                      {profile?.address} {profile?.pincode} {profile?.city}{" "}
                      {profile?.state} {profile?.country}
                    </p>
                  </div>
                </div>
              )}

            {profile?.alt_mobile_no && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <LuPhoneCall size={16} className="text-purple-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Alt Phone
                  </label>
                  <p className="text-gray-900 font-medium">
                    {profile?.alt_mobile_no}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Account Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/auth/reset-password`}
              className="flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
            >
              <LuLock size={18} />
              Reset Password
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center cursor-pointer gap-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
            >
              <LuLogOut size={18} />
              Logout
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center justify-center cursor-pointer gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
            >
              <LuTrash size={18} />
              Delete Account
            </button>
            {!profile?.verified && (
              <button
                onClick={() => setShowVerifyModal(true)}
                className="flex items-center justify-center cursor-pointer gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
              >
                <LuBadgeCheck size={18} />
                Verify Account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          profile={profile}
        />
      )}
      {showVerifyModal && (
        <VerifyAccountModal
          onClose={() => setShowVerifyModal(false)}
          profile={profile}
        />
      )}
      {showSwitchModal && (
        <SwitchProfessionalModal
          onClose={() => setShowSwitchModal(false)}
          profile={profile}
        />
      )}
    </div>
  );
};

export default Profile;
