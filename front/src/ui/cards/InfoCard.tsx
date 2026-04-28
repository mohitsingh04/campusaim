"use client";

import { LucideIcon } from "lucide-react";
import React from "react";

const InfoCard = ({
  Icon,
  title,
  value,
}: {
  Icon: LucideIcon;
  title: string;
  value: string | number;
}) => (
  <div className="flex items-center gap-2 p-4  rounded-custom bg-(--secondary-bg) shadow-custom">
    <div className="bg-(--main-subtle) p-2 text-(--main-emphasis) rounded-full">
      {/* {React.cloneElement(icon, { size: 20 })} */}
      <Icon size={20} />
    </div>
    <div>
      <p className="text-sm font-medium text-(--text-color-emphasis)">
        {title}
      </p>
      <p className="font-semibold text-(--text-color)">{value}</p>
    </div>
  </div>
);

export default InfoCard;
