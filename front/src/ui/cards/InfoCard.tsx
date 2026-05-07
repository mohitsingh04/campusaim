"use client";

import { LucideIcon } from "lucide-react";
import React from "react";
import { Badge } from "../badge/Badge";

const InfoCard = ({
  Icon,
  title,
  value,
  tags,
  className,
  isDanger = false,
  note = "",
}: {
  Icon: LucideIcon;
  title: string;
  value: string | number;
  tags?: { name: string; color?: string; value?: boolean }[];
  className?: string;
  isDanger?: boolean;
  note?: string;
}) => (
  <div
    className={`flex items-center gap-2 p-4 bg-(--secondary-bg) rounded-custom  shadow-custom ${className} ${isDanger ? "ring-2! ring-(--danger)/20!" : ""}`}
  >
    <div
      className={`${isDanger ? "bg-(--danger-subtle) text-(--danger-emphasis)" : "bg-(--main-subtle) text-(--main-emphasis)"} p-2  rounded-full`}
    >
      <Icon size={20} />
    </div>
    <div>
      <p className="text-sm font-medium text-(--text-color-emphasis)">
        {title}
      </p>
      <p className="font-semibold text-(--text-color)">{value}</p>
      {(tags?.length || 0) > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags?.map((item, index) => {
            if (!item?.value) return;
            return (
              <Badge
                label={item?.name}
                color={item?.color || "main"}
                key={index}
              />
            );
          })}
        </div>
      )}
      {note && <p className="font-semibold text-(--danger)">{note}</p>}
    </div>
  </div>
);

export default InfoCard;
