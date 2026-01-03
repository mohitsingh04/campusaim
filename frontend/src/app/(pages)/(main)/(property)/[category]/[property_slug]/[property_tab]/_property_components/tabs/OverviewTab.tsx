import { PropertyProps } from "@/types/types";
import React from "react";
import { FaMapMarkerAlt, FaBuilding, FaGlobe } from "react-icons/fa";
import Link from "next/link";

const Overview = ({
  property,
  getCategoryById,
}: {
  property: PropertyProps | null;
  getCategoryById: any;
}) => {
  return (
    <div className="space-y-6 p-6 relative">
      {/* About Section */}
      {property?.property_description && (
        <div>
          <h2 className="text-xl uppercase font-bold text-gray-600 mb-3">
            About {property?.property_name || "Institute"}
          </h2>
          <p
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: property?.property_description || "",
            }}
          />
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Card */}
        <div className="bg-purple-50 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <FaMapMarkerAlt className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Location</h3>
          </div>

          {property?.category === "Online Yoga Studio" ? (
            <p className="text-purple-700 font-medium">
              This is an online yoga studio. Classes can be attended from home.
            </p>
          ) : (
            <>
              {property?.address && (
                <p className="text-gray-700 mb-2">{property.address}</p>
              )}

              {(property?.city || property?.state || property?.pincode) && (
                <p className="text-gray-700">
                  {property?.city && `${property.city}, `}
                  {property?.state && `${property.state} `}
                  {property?.pincode && property.pincode}
                </p>
              )}

              {property?.country && (
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <FaGlobe className="h-4 w-4 text-gray-600" />
                  <span>{property.country}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Property Details Card */}
        <div className="bg-purple-50 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <FaBuilding className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Property Details
            </h3>
          </div>

          <p className="text-gray-700">
            <span className="font-medium">Type:</span>{" "}
            {getCategoryById(property?.property_type) || "N/A"}
          </p>

          <p className="text-gray-700">
            <span className="font-medium">Academic Type:</span>{" "}
            {getCategoryById(property?.academic_type) || "N/A"}
          </p>

          <p className="text-gray-700">
            <span className="font-medium">Established:</span>{" "}
            {property?.est_year || "N/A"}
          </p>
        </div>
      </div>

      {/* Claim Button At Bottom */}
      {/* {!property?.claimed && (
        <div className="pt-2 flex justify-end">
          <Link
            href={`/verify/institute/${property?._id}`}
            className="px-4 py-2 bg-white text-gray-400 rounded-full font-semibold shadow-sm text-xs hover:bg-purple-200 transition"
          >
            Claim Your Institute
          </Link>
        </div>
      )} */}
    </div>
  );
};

export default Overview;
