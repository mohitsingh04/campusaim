import { MapPin, Globe, Home, Hash } from "lucide-react";
import { UserProps } from "../../../types/types";

export default function ProfessionalLocationDetails({
  professional,
}: {
  professional: UserProps | null;
}) {
  return (
    <div>
      <div className="bg-[var(--yp-primary)] shadow-lg p-8 capitalize">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-[var(--yp-text-primary)]">
          <div className="space-y-3 sm:space-y-5">
            <p className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base lowercase">
              <Home className="w-5 h-5 text-[var(--yp-main)]" />
              <span className="font-semibold capitalize">Address:</span>
              {professional?.address || "N/A"}
            </p>
            <p className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base lowercase">
              <Globe className="w-5 h-5 text-[var(--yp-main)]" />
              <span className="font-semibold capitalize">State:</span>
              {professional?.state || "N/A"}
            </p>
            <p className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base lowercase">
              <Hash className="w-5 h-5 text-[var(--yp-main)]" />
              <span className="font-semibold capitalize">Pincode:</span>
              {professional?.pincode || "N/A"}
            </p>
          </div>

          <div className="space-y-4">
            <p className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base lowercase">
              <MapPin className="w-5 h-5 text-[var(--yp-main)]" />
              <span className="font-semibold capitalize">City:</span>
              {professional?.city || "N/A"}
            </p>
            <p className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base lowercase">
              <Globe className="w-5 h-5 text-[var(--yp-main)]" />
              <span className="font-semibold capitalize">Country:</span>
              {professional?.country || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
