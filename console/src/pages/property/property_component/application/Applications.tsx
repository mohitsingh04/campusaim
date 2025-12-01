import { useCallback, useEffect, useState } from "react";
import { API } from "../../../../contexts/API";
import { PropertyProps } from "../../../../types/types";
import {
  getErrorResponse,
  maskSensitive,
} from "../../../../contexts/Callbacks";

interface Application {
  hiringId: string;
  userId: string;
}

export default function Applications({
  property,
}: {
  property: PropertyProps | null;
}) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [allUser, setAllUser] = useState<any[]>([]);
  const [allHiring, setAllHiring] = useState<any[]>([]);
  const [allResume, setAllResume] = useState<any[]>([]);

  const getAllResume = useCallback(async () => {
    try {
      const response = await API.get(`/profile/doc/resume`);
      setAllResume(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getAllResume();
  }, [getAllResume]);

  const getAllHirings = useCallback(async () => {
    if (property) {
      try {
        const response = await API.get(`/hiring/${property?.uniqueId}`);
        setAllHiring(response.data);
      } catch (error) {
        getErrorResponse(error, true);
      }
    }
  }, [property]);

  useEffect(() => {
    getAllHirings();
  }, [getAllHirings]);

  const getAllUsers = useCallback(async () => {
    try {
      const response = await API.get(`/profile/users`);
      setAllUser(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const getUserDetail = (id: string) =>
    allUser?.find((item) => item.uniqueId === Number(id));

  const getHiringDetail = (id: string) =>
    allHiring?.find((item) => item.uniqueId === Number(id));

  const getResumeDetail = (id: string) =>
    allResume?.find((item) => item.userId === id);

  const getApplication = useCallback(async () => {
    if (property) {
      try {
        const response = await API.get(
          `/apply/applications/${property?.uniqueId}`
        );
        setApplications(response.data);
      } catch (error) {
        getErrorResponse(error, true);
      }
    }
  }, [property]);

  useEffect(() => {
    getApplication();
  }, [getApplication]);

  return (
    <>
      {applications.length > 0 ? (
        <section className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {applications.map((item, index) => {
              const user = getUserDetail(item.userId);
              const hiring = getHiringDetail(item.hiringId);
              const resume = getResumeDetail(item.userId);

              return (
                <div
                  key={index}
                  className="bg-[var(--yp-secondary)] rounded-xl shadow-xs hover:shadow-md transition p-6 flex flex-col justify-between"
                >
                  {/* Hiring Title */}
                  <h4 className="text-lg font-semibold text-[var(--yp-text-primary)] mb-3">
                    {hiring?.title || "Untitled Hiring"}
                  </h4>

                  {/* User Info */}
                  <div className="space-y-2 text-sm">
                    <p className="text-[var(--yp-muted)]">
                      <strong>Name:</strong> {user?.name}
                    </p>
                    <p className="text-[var(--yp-muted)]">
                      <strong>Email:</strong> {maskSensitive(user?.email)}
                    </p>
                    <p className="text-[var(--yp-muted)]">
                      <strong>Mobile:</strong> {maskSensitive(user?.mobile_no)}
                    </p>
                  </div>

                  {/* Resume Button */}
                  <div className="mt-4">
                    {resume?.resume ? (
                      <a
                        href={`${import.meta.env?.VITE_MEDIA_URL}${
                          resume.resume
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
                      >
                        View CV
                      </a>
                    ) : (
                      <span className="text-[var(--yp-muted)] text-sm">
                        No CV uploaded
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section>
          <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
            <h3 className="mt-4 text-base sm:text-lg lg:text-xl font-semibold text-[var(--yp-text-primary)]">
              No Applications Found
            </h3>
            <p className="text-[var(--yp-muted)] mt-1 text-sm sm:text-base">
              There are no applications yet for this property.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
