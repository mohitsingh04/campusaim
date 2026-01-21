import React from "react";
import { BiLoader } from "react-icons/bi";

export default function Loading() {
  return (
    <div className="flex items-center justify-center max-h-screen min-h-100 bg-(--primary-bg) text-(--text-color)">
      <BiLoader className="animate-spin w-15 h-15" />
    </div>
  );
}
