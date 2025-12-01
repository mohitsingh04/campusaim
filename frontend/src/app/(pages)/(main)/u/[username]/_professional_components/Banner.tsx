import React, { useEffect, useState } from "react";
import { UserProps } from "@/types/types";

export default function Banner({ profile }: { profile: UserProps | null }) {
  const [bannerImage, setBannerImage] = useState<string>();

  useEffect(() => {
    setBannerImage(
      profile?.banner?.[0]
        ? `${process.env.NEXT_PUBLIC_MEDIA_URL}${profile?.banner?.[0]}`
        : ""
    );
  }, [profile]);

  return (
    <div>
      <div className="relative">
        <div
          className="h-80 bg-purple-600 relative"
          style={{
            backgroundImage: bannerImage ? `url(${bannerImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-indigo-900/30"></div>
        </div>
      </div>
    </div>
  );
}
