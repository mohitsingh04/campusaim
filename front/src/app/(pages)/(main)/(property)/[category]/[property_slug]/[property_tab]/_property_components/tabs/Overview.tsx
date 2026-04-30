import { PropertyProps } from "@/types/PropertyTypes";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { EarthIcon, MapPin } from "lucide-react";

const Overview = ({
  property,
  getCategoryById,
}: {
  property: PropertyProps | null;
  getCategoryById: (id: string | number) => string | undefined;
}) => {
  const loc = [
    property?.property_city,
    property?.property_state,
    property?.property_pincode,
  ]
    ?.filter(Boolean)
    ?.join(", ");

  return (
    <div className="space-y-6 p-5 text-(--text-color)">
      <div>
        <h2 className="heading font-semibold mb-3">
          About {property?.property_name}
        </h2>
        <ReadMoreLess html={property?.property_description || ""} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-(--secondary-bg) shadow-custom rounded-custom p-5 h-full">
          <div className="flex items-center gap-2 pb-2">
            <h3 className="sub-heading font-semibold">Location</h3>
          </div>
          {property?.property_address && (
            <p className="text-(--text-color) mb-2">
              {property.property_address}
            </p>
          )}
          {loc && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-(--main)" />
              <p>{loc}</p>
            </div>
          )}
          {property?.property_country && (
            <div className="flex items-center gap-2">
              <EarthIcon className="h-4 w-4 text-(--main)" />
              <p>{property?.property_country}</p>
            </div>
          )}
        </div>
        <div className="bg-(--secondary-bg) shadow-custom rounded-custom p-5 h-full">
          <div className="flex items-center gap-2 pb-3">
            <h3 className="sub-heading font-semibold">Property Details</h3>
          </div>
          <p>Type : {getCategoryById(property?.property_type || "")}</p>
          <p>Academic Type: {getCategoryById(property?.academic_type || "")}</p>
          {property?.est_year && <p>Established: {property?.est_year}</p>}
        </div>
      </div>
    </div>
  );
};

export default Overview;
