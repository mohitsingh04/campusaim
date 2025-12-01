import React from "react";
import { LuX } from "react-icons/lu";

interface MobileFilterOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const MobileFilterOverlay: React.FC<MobileFilterOverlayProps> = ({
  isVisible,
  onClose,
  children,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 cursor-pointer"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 left-0 w-80 max-w-full bg-white shadow-xl overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <LuX className="w-6 h-6" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileFilterOverlay;
