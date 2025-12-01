import { Calendar, MapPin } from "lucide-react";
import { MdWorkOff } from "react-icons/md";
import { UserProps, PropertyProps } from "../../../types/types";
import { useCallback, useEffect, useState } from "react";
import { API } from "../../../contexts/API";
import {
  formatDateWithoutTime,
  getErrorResponse,
} from "../../../contexts/Callbacks";

export default function ProfessionalExperience({
  professional,
}: {
  professional: UserProps | null;
}) {
  const experiences = professional?.experiences || [];
  const [properties, setProperties] = useState<PropertyProps[]>([]);
  const [profileProperties, setProfileProperties] = useState<PropertyProps[]>(
    []
  );

  const getProperties = useCallback(async () => {
    try {
      const response = await API.get(`/property`);
      setProperties(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getProperties();
  }, [getProperties]);

  const getProfileProperties = useCallback(async () => {
    try {
      const response = await API.get(`/profile/properties`);
      setProfileProperties(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getProfileProperties();
  }, [getProfileProperties]);

  const getPropertyDetails = (id: number, properties: PropertyProps[]) => {
    const property = properties.find(
      (item) => Number(item?.uniqueId) === Number(id)
    );
    return property;
  };

  return (
    <div>
      <div className="p-5 sm:p-8">
        {/* Experience Cards */}
        {experiences.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {experiences.map((exp, index) => {
              const firstExp = experiences[0];

              const property = firstExp.property_id
                ? getPropertyDetails(firstExp.property_id, properties)
                : firstExp.property_name_id
                ? getPropertyDetails(
                    firstExp.property_name_id,
                    profileProperties
                  )
                : null;

              const propertyName = property?.property_name || "";

              const propertyLogo = property?.property_logo?.[0]
                ? `${import.meta.env.VITE_MEDIA_URL}/${
                    property.property_logo[0]
                  }`
                : "/img/default-images/yp-user.webp";

              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 p-4 sm:p-6 rounded-xl bg-[var(--yp-secondary)] shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <img
                    src={propertyLogo}
                    alt={propertyLogo}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-full shadow-sm"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-[var(--yp-text-primary)]">
                        {propertyName}
                      </h3>
                      <p className="text-sm sm:text-base text-[var(--yp-main)] font-medium mb-2 sm:mb-3">
                        {exp.position}
                      </p>

                      <div className="flex items-center gap-2 text-[var(--yp-muted)] mb-1 flex-wrap">
                        <Calendar className="w-4 h-4" />
                        <span>
                          <strong>Duration:</strong>{" "}
                          {formatDateWithoutTime(exp?.start_date)} {" - "}
                          {exp.currentlyWorking
                            ? "Present"
                            : formatDateWithoutTime(exp?.end_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[var(--yp-muted)] flex-wrap">
                        <MapPin className="w-4 h-4" />
                        <span>
                          <strong>Location:</strong> {exp.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // No Experience Found
          <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--yp-muted)]">
            <MdWorkOff className="w-20 h-20 mb-6 text-[var(--yp-muted)]" />
            <h3 className="text-xl sm:text-2xl font-semibold text-[var(--yp-text-primary)] mb-2">
              No Professional Experience Found
            </h3>
            <p>This user hasn't added any professional experiences yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
