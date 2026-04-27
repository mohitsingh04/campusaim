import { LoaderIcon } from "lucide-react";
import React from "react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center max-h-screen min-h-100 bg-(--primary-bg) text-(--text-color)">
      <LoaderIcon className="animate-spin w-15 h-15" />
    </div>
  );
}
