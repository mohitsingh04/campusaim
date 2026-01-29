import { SlLocationPin } from "react-icons/sl";
import { PiGlobeStandLight } from "react-icons/pi";
import { PropertyProps } from "@/types/PropertyTypes";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";

const Overview = ({
  property,
  getCategoryById,
}: {
  property: PropertyProps | null;
  getCategoryById: (id: string | number) => string | undefined;
}) => {
  // console.log(property?.category)
  return (
    <div className="space-y-6 p-5 text-(--text-color)">
      <div>
        <h2 className="heading font-semibold mb-3">
          About {property?.property_name}
        </h2>
        <p className="leading-relaxed">
          <ReadMoreLess
            html={property?.property_description || ""}
            maxLength={650}
          />
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-(--secondary-bg)  shadow-custom rounded-custom p-5">
          <div className="flex items-center gap-2 pb-2">
            <h3 className="sub-heading font-semibold ">Location</h3>
          </div>

          {getCategoryById(property?.category || "") ===
          "Online Yoga Studio" ? (
            <p className="text-(--text-color)">
              This is an online yoga studio. Classes can be attended from home.
            </p>
          ) : (
            <>
              {property?.address && (
                <p className="text-(--text-color) mb-2">{property.address}</p>
              )}

              {(property?.city || property?.state || property?.pincode) && (
                <div className="flex items-center gap-2">
                  <SlLocationPin className="h-4 w-4 text-(--main)" />
                  <p>
                    {property?.city && `${property.city}, `}
                    {property?.state && `${property.state} `}
                    {property?.pincode && property.pincode}
                  </p>
                </div>
              )}

              {property?.country && (
                <div className="flex items-center gap-2">
                  <PiGlobeStandLight className="h-4 w-4 text-(--main)" />
                  <p>{property?.country}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-(--secondary-bg) shadow-custom rounded-custom p-5">
          <div className="flex items-center gap-2 pb-3">
            {/* <FaBuilding className="h-4 w-4 text-[var(--main)]" /> */}
            <h3 className="sub-heading font-semibold ">Property Details</h3>
          </div>
          <p>Type : {getCategoryById(property?.property_type || "")}</p>
          <p>Academic Type: {getCategoryById(property?.category || "")}</p>
          {property?.est_year && <p>Established: {property?.est_year}</p>}
        </div>
      </div>
    </div>
  );
};

export default Overview;
