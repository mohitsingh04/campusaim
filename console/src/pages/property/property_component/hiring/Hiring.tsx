import { useCallback, useEffect, useState } from "react";
import { PropertyProps } from "../../../../types/types";
import AddHiring from "./AddHiring";
import EditHiring from "./EditHiring";
import { API } from "../../../../contexts/API";
import {
  formatDateWithoutTime,
  getErrorResponse,
  getStatusColor,
} from "../../../../contexts/Callbacks";
import {
  Pencil,
  Trash2,
  Briefcase,
  Calendar,
  Clock,
  Wallet,
} from "lucide-react";
import Badge from "../../../../ui/badge/Badge";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import ReadMoreLess from "../../../../ui/read-more/ReadMoreLess";

export default function Hiring({
  property,
}: {
  property: PropertyProps | null;
}) {
  const [hiring, setHiring] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<any>(null);

  const getHiring = useCallback(async () => {
    if (property) {
      try {
        const response = await API.get(`/hiring/${property?.uniqueId}`);
        setHiring(response.data);
      } catch (error) {
        getErrorResponse(error, true);
      }
    }
  }, [property]);

  useEffect(() => {
    getHiring();
  }, [getHiring]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await API.delete(`/hiring/${id}`);
        toast(response?.data?.message || "Hiring deleted successfully.");
        getHiring();
      } catch (error) {
        getErrorResponse(error);
      }
    }
  };

  if (isEditing) {
    return (
      <EditHiring
        hiring={isEditing}
        setIsEditing={setIsEditing}
        getHiring={getHiring}
      />
    );
  }

  return (
    <div className="space-y-6 p-4">
      {hiring?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hiring?.map((item, index) => (
            <div
              key={index}
              className="bg-[var(--yp-secondary)] rounded-xl shadow-sm hover:shadow transition-shadow flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--yp-border-primary)]">
                <h3 className="text-lg font-semibold text-[var(--yp-text-primary)] truncate">
                  {item?.title}
                </h3>
                <div className="flex gap-2">
                  <button
                    className="p-1 rounded bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
                    onClick={() => setIsEditing(item)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="p-1 rounded bg-[var(--yp-red-bg)] text-[var(--yp-red-text)]"
                    onClick={() => handleDelete(item?.uniqueId)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1 text-[var(--yp-text-primary)] space-y-3 text-sm">
                {/* Job Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <p className="flex items-center gap-1">
                    <Briefcase size={14} /> {item?.job_type}
                  </p>
                  <p className="flex items-center gap-1">
                    <Clock size={14} /> {item?.experience}
                  </p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <p className="flex items-center gap-1">
                    <Calendar size={14} />{" "}
                    {formatDateWithoutTime(item?.start_date)}
                  </p>
                  <p className="flex items-center gap-1">
                    <Calendar size={14} />{" "}
                    {formatDateWithoutTime(item?.end_date)}
                  </p>
                </div>

                {/* Salary */}
                {item?.salary && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {item?.salary?.INR && (
                      <p className="flex items-center gap-1">
                        <Wallet size={14} /> ₹{item.salary.INR || "N/A"}
                      </p>
                    )}
                    {item?.salary?.DOLLAR && (
                      <p className="flex items-center gap-1">
                        <Wallet size={14} /> ${item.salary.DOLLAR || "N/A"}
                      </p>
                    )}
                    {item?.salary?.EURO && (
                      <p className="flex items-center gap-1">
                        <Wallet size={14} /> €{item.salary.EURO || "N/A"}
                      </p>
                    )}
                  </div>
                )}

                {/* Badges (Fixed Labels) */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--yp-text-secondary)] font-medium">
                      Status:
                    </span>
                    <Badge
                      label={item?.status}
                      color={getStatusColor(item?.status)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--yp-text-secondary)] font-medium">
                      Expiry:
                    </span>
                    <Badge
                      label={item?.isExpired ? "Expired" : "Active"}
                      color={item?.isExpired ? "gray" : "green"}
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <strong>Skills:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item?.skills?.map((skill: string, i: number) => (
                      <Badge label={skill} color="blue" key={i} />
                    ))}
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <strong>Qualifications:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item?.qualification?.map((qual: string, i: number) => (
                      <Badge label={qual} color="yellow" key={i} />
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <strong>Description:</strong>
                  <ReadMoreLess children={item?.job_description} limit={25} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <AddHiring property={property} getHiring={getHiring} />
      </div>
    </div>
  );
}
