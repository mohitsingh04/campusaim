import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Globe2,
  Map,
  Locate,
  LocateFixed,
  Edit2,
  Trash2,
} from "lucide-react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { DashboardOutletContextProps, PropertyProps } from "../../types/types";
import {
  formatDateWithoutTime,
  getErrorResponse,
  getStatusColor,
  maskSensitive,
  timeAgo,
} from "../../contexts/Callbacks";
import Badge from "../../ui/badge/Badge";
import ViewSkeleton from "../../ui/skeleton/ViewSkeleton";
import { useOutletContext } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import ProfileCropModal from "./ProfileCropModal";
import { DeleteProfileModal } from "./DeleteProfileModal";
import { API } from "../../contexts/API";
import CountUp from "react-countup";

export default function Profile() {
  const { authUser, authLoading } =
    useOutletContext<DashboardOutletContextProps>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);
  const [property, setProperty] = useState<PropertyProps[]>([]);

  const getProperty = useCallback(async () => {
    try {
      const response = await API.get(`/property/userId/${authUser?._id}`);
      setProperty(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [authUser?._id]);
  useEffect(() => {
    getProperty();
  }, [getProperty]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setSelectedImage(result);
        }
        setOriginalFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  if (authLoading) {
    return <ViewSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title={"Profile"}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Profile" },
        ]}
        extraButtons={[
          {
            label: "Edit Profile",
            icon: Edit2,
            path: "/dashboard/settings",
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-[var(--yp-primary)] rounded-xl">
            <div className="p-6">
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between bg-[var(--yp-primary)] rounded-xl p-6">
                {/* Left: Avatar + Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mb-6 md:mb-0">
                  {/* Avatar */}
                  {/* Avatar */}
                  <div className="relative mx-auto sm:mx-0 mb-4 sm:mb-0 w-24 h-24">
                    <img
                      src={
                        authUser?.avatar?.[0]
                          ? authUser.avatar[0].startsWith("http")
                            ? authUser.avatar[0]
                            : `${import.meta.env.VITE_MEDIA_URL}/${
                                authUser.avatar[0]
                              }`
                          : "/img/default-images/yp-user.webp"
                      }
                      alt="Profile"
                      className="w-24 h-24 rounded-lg object-cover border-4 border-[var(--yp-border-primary)] shadow-sm"
                    />

                    {/* Bottom Right Buttons */}
                    <div className="absolute -bottom-3 right-0 flex items-center space-x-1">
                      {/* Upload */}
                      <label className="p-1.5 rounded-full bg-[var(--yp-gray-bg)] text-[var(--yp-gray-text)] shadow-sm hover:opacity-90 transition cursor-pointer border border-[var(--yp-gray-text)]">
                        <Edit2 className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>

                      {/* Delete */}
                      {authUser?.avatar?.[0] && (
                        <button
                          onClick={() => setShowDeleteProfileModal(true)}
                          className="p-1.5 rounded-full bg-[var(--yp-red-bg)] text-[var(--yp-red-text)] shadow-sm hover:opacity-90 transition border border-[var(--yp-red-text)]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-bold text-[var(--yp-text-primary)]">
                      {authUser?.name}
                    </h3>
                    <p className="text-[var(--yp-muted)] text-sm">
                      {authUser?.role}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                      <Badge
                        label={authUser?.status}
                        color={getStatusColor(authUser?.status || "")}
                      />
                      {authUser?.verified && (
                        <Badge
                          label={authUser?.verified ? "Verified" : "Unverified"}
                          color={authUser?.verified ? "green" : "red"}
                        />
                      )}
                      {authUser?.isProfessional && (
                        <Badge label="Professional" color="green" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {selectedImage && (
                <ProfileCropModal
                  profile={authUser}
                  image={selectedImage}
                  onClose={() => setSelectedImage(null)}
                  originalFileName={originalFileName}
                />
              )}
              {showDeleteProfileModal && (
                <DeleteProfileModal
                  profile={authUser}
                  onClose={() => setShowDeleteProfileModal(false)}
                />
              )}
              <div className="bg-[var(--yp-secondary)] rounded-lg p-6">
                <h4 className="text-lg font-semibold text-[var(--yp-text-primary)] mb-4">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-[var(--yp-muted)]" />
                    <div>
                      <p className="text-sm text-[var(--yp-muted)]">Email</p>
                      <p className="text-sm font-medium text-[var(--yp-text-primary)]">
                        {maskSensitive(authUser?.email || "")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-[var(--yp-muted)]" />
                    <div>
                      <p className="text-sm text-[var(--yp-muted)]">
                        Mobile No
                      </p>
                      <p className="text-sm font-medium text-[var(--yp-text-primary)]">
                        {maskSensitive(authUser?.mobile_no || "")}
                      </p>
                    </div>
                  </div>
                  {authUser?.address && (
                    <div className="flex items-center space-x-3">
                      <Locate className="w-5 h-5 text-[var(--yp-muted)]" />
                      <div>
                        <p className="text-sm text-[var(--yp-muted)]">
                          address
                        </p>
                        <p className="text-sm font-medium text-[var(--yp-text-primary)]">
                          {authUser?.address}
                        </p>
                      </div>
                    </div>
                  )}
                  {authUser?.pincode && (
                    <div className="flex items-center space-x-3">
                      <LocateFixed className="w-5 h-5 text-[var(--yp-muted)]" />
                      <div>
                        <p className="text-sm text-[var(--yp-muted)]">
                          pincode
                        </p>
                        <p className="text-sm font-medium text-[var(--yp-text-primary)]">
                          {authUser?.pincode}
                        </p>
                      </div>
                    </div>
                  )}
                  {authUser?.city && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-[var(--yp-muted)]" />
                      <div>
                        <p className="text-sm text-[var(--yp-muted)]">City</p>
                        <p className="text-sm font-medium text-[var(--yp-text-primary)]">
                          {authUser?.city}
                        </p>
                      </div>
                    </div>
                  )}
                  {authUser?.state && (
                    <div className="flex items-center space-x-3">
                      <Map className="w-5 h-5 text-[var(--yp-muted)]" />
                      <div>
                        <p className="text-sm text-[var(--yp-muted)]">state</p>
                        <p className="text-sm font-medium text-[var(--yp-text-primary)]">
                          {authUser?.state}
                        </p>
                      </div>
                    </div>
                  )}
                  {authUser?.country && (
                    <div className="flex items-center space-x-3">
                      <Globe2 className="w-5 h-5 text-[var(--yp-muted)]" />
                      <div>
                        <p className="text-sm text-[var(--yp-muted)]">
                          Country
                        </p>
                        <p className="text-sm font-medium text-[var(--yp-text-primary)]">
                          {authUser?.country}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[var(--yp-secondary)] rounded-lg p-6 mt-6">
                <h4 className="text-lg font-semibold text-[var(--yp-text-primary)] mb-4">
                  Account Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-[var(--yp-muted)]" />
                    <div>
                      <p className="text-sm text-[var(--yp-muted)]">
                        Join Date
                      </p>
                      <p className="text-sm font-medium text-[var(--yp-text-primary)]">
                        {formatDateWithoutTime(authUser?.createdAt || "")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-[var(--yp-muted)]" />
                    <div>
                      <p className="text-sm text-[var(--yp-muted)]">Login</p>
                      <p className="text-sm font-medium text-[var(--yp-text-primary)]">
                        {authUser?.isGoogleLogin
                          ? "Google Login"
                          : "Email Login"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--yp-text-primary)] mb-4">
                About User
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--yp-main)]">
                    {timeAgo(authUser?.createdAt || "")?.value}{" "}
                    <span className="capitalize">
                      {timeAgo(authUser?.createdAt || "")?.type}
                    </span>
                  </p>
                  <p className="text-sm text-[var(--yp-muted)]">Old User</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--yp-main)]">
                    {authUser?.role}
                  </p>
                  <p className="text-sm text-[var(--yp-muted)]">Role</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--yp-main)]">
                    <CountUp start={0} end={property?.length} />
                  </p>
                  <p className="text-sm text-[var(--yp-muted)]">Properties</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {[
                  {
                    action: "Added new lead",
                    lead: "Sarah Johnson",
                    time: "2 hours ago",
                    type: "lead",
                  },
                  {
                    action: "Updated lead status",
                    lead: "Michael Chen",
                    time: "4 hours ago",
                    type: "update",
                  },
                  {
                    action: "Converted lead",
                    lead: "Emily Rodriguez",
                    time: "6 hours ago",
                    type: "conversion",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "conversion"
                          ? "bg-green-500"
                          : activity.type === "update"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {activity.action}{" "}
                        <span className="font-medium">{activity.lead}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
