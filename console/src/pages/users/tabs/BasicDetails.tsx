import {
  User,
  Mail,
  Smartphone,
  ShieldCheck,
  BadgeCheck,
  LogIn,
} from "lucide-react";
import { UserProps } from "../../../types/types";
import Badge from "../../../ui/badge/Badge";
import {
  formatDate,
  getStatusColor,
  maskSensitive,
  timeAgo,
} from "../../../contexts/Callbacks";

export default function ProfessionalBasicDetails({
  professional,
}: {
  professional: UserProps | null;
}) {
  return (
    <div>
      <div className="bg-[var(--yp-primary)] shadow-lg p-5 sm:p-8">
        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-[var(--yp-text-primary)]">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-5">
            <p className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base lowercase">
              <User className="w-5 h-5 text-[var(--yp-main)]" />
              <span className="font-semibold capitalize">Username:</span> @
              {professional?.username}
            </p>
            <p className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base flex-wrap">
              <Mail className="w-5 h-5 text-[var(--yp-main)]" />
              <span className="font-semibold">Email:</span>
              <span className="ml-1 sm:ml-2 break-all">
                {maskSensitive(professional?.email || "")}
              </span>
            </p>

            <p className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base flex-wrap">
              <BadgeCheck className="w-5 h-5 text-[var(--yp-main)]" />
              <span className="font-semibold">Status:</span>
              <Badge
                label={professional?.status}
                color={getStatusColor(professional?.status || "")}
              />
            </p>

            <p className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <ShieldCheck className="w-5 h-5 text-[var(--yp-main)]" />
              <span className="font-semibold">Role:</span> {professional?.role}
            </p>
            <p className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <ShieldCheck className="w-5 h-5 text-[var(--yp-main)]" />
              <span className="font-semibold">User Type:</span>{" "}
              {professional?.isProfessional ? "Professional" : "User"}
            </p>
          </div>

          {/* Right Column */}
          <div className="space-y-3 sm:space-y-5">
            <p className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <User className="w-5 h-5 text-[var(--yp-main)]" />
              <span className="font-semibold">Name:</span> {professional?.name}
            </p>
            <p className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base flex-wrap">
              <Smartphone className="w-5 h-5 text-[var(--yp-main)]" />
              <span className="font-semibold">Mobile No:</span>
              <span className="ml-1 sm:ml-2 break-all">
                {maskSensitive(professional?.mobile_no || "")}
              </span>
            </p>
            <p className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <LogIn className="w-5 h-5 text-[var(--yp-main)]" />
              <span className="font-semibold">Login:</span>
              <Badge label={professional?.isGoogleLogin ? "Google" : "Email"} />
            </p>
            <p className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <BadgeCheck className="w-5 h-5 text-[var(--yp-main)]" />
              <span className="font-semibold">Email Verified:</span>
              <Badge
                label={professional?.verified ? "Verified" : "Unverified"}
                color={professional?.verified ? "green" : "red"}
              />
            </p>
            <p className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <BadgeCheck className="w-5 h-5 text-[var(--yp-main)]" />
              <span className="font-semibold">Register At:</span>
              <span>
                {formatDate(professional?.createdAt || "")}
                <span className="capitalize font-bold">
                  {" "}
                  ({timeAgo(professional?.createdAt || "")?.value}{" "}
                  {timeAgo(professional?.createdAt || "")?.type}
                </span>
                )
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
