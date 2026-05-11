import { useCallback, useEffect, useState } from "react";
import { API } from "../../../../../contexts/API";
import ToggleButton from "../../../../../ui/button/ToggleButton";
import { Badge } from "../../../../../ui/badge/Badge";
import { PropertyProps } from "../../../../../types/types";
import { getErrorResponse } from "../../../../../contexts/Callbacks";
import { toast } from "react-hot-toast";

const schoolClass = [
  "Nursery",
  "LKG",
  "UKG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

interface ClassStatus {
  isAvailable: boolean;
  admissionOpen: boolean;
}

interface PayloadItem {
  class_name: string;
  is_available: boolean;
  admission_open: boolean;
}

interface GetClassResponse {
  property_id: string;
  classess: PayloadItem[];
}

export default function SchoolClassess({
  property,
}: {
  property: PropertyProps | null;
}) {
  const [classData, setClassData] = useState<Record<string, ClassStatus>>({});

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const initializeClassData = () => {
    const initialData: Record<string, ClassStatus> = {};

    schoolClass.forEach((cls) => {
      initialData[cls] = {
        isAvailable: false,
        admissionOpen: false,
      };
    });

    return initialData;
  };

  const getSchoolClassess = useCallback(async () => {
    try {
      if (!property?._id) return;

      setFetching(true);

      const response = await API.get<GetClassResponse>(
        `/property/school/classess/${property?._id}`,
      );

      const responseData = response?.data;

      const updatedData = initializeClassData();

      responseData?.classess?.forEach((item) => {
        updatedData[item.class_name] = {
          isAvailable: item.is_available,
          admissionOpen: item.admission_open,
        };
      });

      setClassData(updatedData);
    } catch (error) {
      getErrorResponse(error, true);
      setClassData(initializeClassData());
    } finally {
      setFetching(false);
    }
  }, [property?._id]);

  useEffect(() => {
    getSchoolClassess();
  }, [getSchoolClassess]);

  const handleAvailableToggle = (cls: string) => {
    setClassData((prev) => ({
      ...prev,
      [cls]: {
        ...prev[cls],
        isAvailable: !prev[cls].isAvailable,

        admissionOpen: prev[cls].isAvailable ? false : prev[cls].admissionOpen,
      },
    }));
  };

  const handleAdmissionToggle = (cls: string) => {
    setClassData((prev) => ({
      ...prev,
      [cls]: {
        ...prev[cls],
        admissionOpen: !prev[cls].admissionOpen,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload: PayloadItem[] = schoolClass.map((cls) => ({
        class_name: cls,
        is_available: classData[cls]?.isAvailable || false,
        admission_open: classData[cls]?.admissionOpen || false,
      }));

      const response = await API.post("/property/school/classess/add", {
        property_id: property?._id,
        classess: payload,
      });

      toast.success(response?.data?.message || "Classes saved successfully");
    } catch (error) {
      getErrorResponse(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-[var(--yp-primary)] p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--yp-text-primary)]">
            School Classes
          </h2>

          <p className="mt-1 text-sm text-[var(--yp-text-secondary)]">
            Manage available classes and admission status
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading || fetching}
          className="rounded-xl bg-[var(--yp-blue-bg)] px-5 py-3 text-sm font-semibold text-[var(--yp-blue-text)] transition-all duration-300"
        >
          {loading ? "Saving..." : fetching ? "Loading..." : "Save Changes"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[var(--yp-tertiary)]">
              <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--yp-text-primary)]">
                Class
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--yp-text-primary)]">
                Available In School
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--yp-text-primary)]">
                Admission Open
              </th>
            </tr>
          </thead>

          <tbody>
            {schoolClass.map((cls, index) => (
              <tr
                key={cls}
                className={`transition hover:bg-[var(--yp-tertiary)] ${
                  index % 2 === 0
                    ? "bg-[var(--yp-primary)]"
                    : "bg-[var(--yp-secondary)]"
                }`}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Badge label={cls} color="green" />

                    <div>
                      <p className="text-sm font-semibold text-[var(--yp-text-primary)]">
                        {["Nursery", "LKG", "UKG"].includes(cls)
                          ? cls
                          : `Class ${cls}`}
                      </p>

                      <p className="text-xs text-[var(--yp-text-secondary)]">
                        Academic Standard
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-start gap-3">
                    <ToggleButton
                      enabled={classData[cls]?.isAvailable}
                      onToggle={() => handleAvailableToggle(cls)}
                    />

                    <Badge
                      label={
                        classData[cls]?.isAvailable ? "Available" : "Not Available"
                      }
                      color={classData[cls]?.isAvailable ? "green" : "red"}
                    />
                  </div>
                </td>

                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-start gap-3">
                    {classData[cls]?.isAvailable ? (
                      <div className="flex items-center justify-start gap-3">
                        <ToggleButton
                          enabled={classData[cls]?.admissionOpen}
                          onToggle={() => handleAdmissionToggle(cls)}
                        />

                        <Badge
                          label={
                            classData[cls]?.admissionOpen ? "Open" : "Closed"
                          }
                          color={
                            classData[cls]?.admissionOpen ? "green" : "red"
                          }
                        />
                      </div>
                    ) : (
                      <Badge color="red" label="Enable Class First" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
