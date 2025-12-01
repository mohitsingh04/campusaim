import { UserProps } from "@/types/types";
import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function ProfileImage({
  profile,
}: {
  profile: UserProps | null;
}) {
  const [profileImage, setProfileImage] = useState<string>("");

  useEffect(() => {
    setProfileImage(
      profile?.avatar?.[0]
        ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${profile?.avatar?.[0]}`
        : ""
    );
  }, [profile]);

  return (
    <div className="relative">
      <div className="h-40 w-40 rounded-2xl border-2 border-purple-400 mt-2 bg-gradient-to-br from-purple-100 to-indigo-100 overflow-hidden">
        {profileImage ? (
          <div className="relative w-full h-full">
            <Image
              src={profileImage}
              alt={profile?.username || "Profile"}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-full w-full bg-purple-600 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">
              {profile?.name?.charAt(0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
