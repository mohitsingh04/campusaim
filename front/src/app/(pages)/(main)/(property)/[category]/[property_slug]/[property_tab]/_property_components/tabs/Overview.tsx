import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import { PropertyProps } from "@/types/PropertyTypes";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { EarthIcon, MapPin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const Overview = ({
  property,
  getCategoryById,
}: {
  property: PropertyProps | null;
  getCategoryById: (id: string) => string | undefined;
}) => {
  const mainCategory = getCategoryById(property?.category || "");
  const mainProperty = getCategoryById(property?.property_type || "");

  const loc = [
    property?.property_city,
    property?.property_state,
    property?.property_pincode,
  ]
    ?.filter(Boolean)
    ?.join(", ");

  const [maps, setMaps] = useState("");

  const getMaps = useCallback(async () => {
    if (!property?._id) return;
    try {
      const response = await API.get(`/property/maps/${property?._id}`);
      setMaps(response.data?.mapUrl || "");
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [property?._id]);

  useEffect(() => {
    getMaps();
  }, [getMaps]);
  const hasMap = maps && maps.trim() !== "";

  const LocationCard = (
    <div className="bg-(--secondary-bg) shadow-custom rounded-custom p-5 h-full">
      <div className="flex items-center gap-2 pb-2">
        <h3 className="sub-heading font-semibold">Location</h3>
      </div>
      {property?.property_address && (
        <p className="text-(--text-color) mb-2">{property.property_address}</p>
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
  );

  const DetailsCard = (
    <div className="bg-(--secondary-bg) shadow-custom rounded-custom p-5 h-full">
      <div className="flex items-center gap-2 pb-3">
        <h3 className="sub-heading font-semibold">Property Details</h3>
      </div>
      <p>Type : {mainProperty}</p>
      <p>Academic Type: {mainCategory}</p>
      {property?.est_year && <p>Established: {property?.est_year}</p>}
    </div>
  );

  return (
    <div className="space-y-6 p-5 text-(--text-color)">
      <div>
        <h2 className="heading font-semibold mb-3">
          About {property?.property_name}
        </h2>
        <ReadMoreLess html={property?.property_description || ""} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hasMap ? (
          <>
            <div className="flex flex-col gap-6">
              {mainCategory !== "Online Yoga Studio" && LocationCard}
              {DetailsCard}
            </div>
            <div className="w-full h-full min-h-88">
              <iframe
                title="Map"
                className="w-full h-full border-none rounded-custom shadow-custom"
                src={maps}
                loading="lazy"
                allowFullScreen
              />
            </div>
          </>
        ) : (
          <>
            {mainCategory !== "Online Yoga Studio" && LocationCard}
            {DetailsCard}
          </>
        )}
      </div>
    </div>
  );
};

export default Overview;
