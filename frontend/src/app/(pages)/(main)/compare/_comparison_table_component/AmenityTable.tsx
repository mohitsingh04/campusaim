import { PropertyProps } from "@/types/types";
import Image from "next/image";
import { useState } from "react";
import {
  LuChevronDown,
  LuWifi,
  LuCircleCheck,
  LuCircleX,
  LuBuilding,
} from "react-icons/lu";

export default function AmenityTable({
  selectedProperties,
}: {
  selectedProperties: PropertyProps[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const amenitySet = new Set<string>();
  selectedProperties.forEach((property) => {
    if (property.amenities) {
      Object.values(property.amenities).forEach((categoryArray) => {
        categoryArray.forEach((amenityObj) => {
          const amenityName = Object.keys(amenityObj)[0];
          amenitySet.add(amenityName);
        });
      });
    }
  });
  const allAmenities = Array.from(amenitySet).sort();

  return (
    <div className="bg-white shadow-sm border border-purple-100 overflow-hidden transition-all duration-300 hover:shadow-md">
      <div
        className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 cursor-pointer px-6 py-3 transition-all duration-200 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 relative overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-10 w-8 h-8 bg-white rounded-full blur-lg"></div>
          <div className="absolute bottom-2 left-10 w-6 h-6 bg-white rounded-full blur-md"></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <LuWifi size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-0.5">
                Amenities Comparison
              </h2>
              <p className="text-purple-100 text-xs">
                Compare facilities across {selectedProperties.length} colleges
              </p>
            </div>
          </div>
          <div
            className={`p-2 rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/30 hover:scale-110 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <LuChevronDown size={16} className="text-white" />
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen
            ? "max-h-none opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-0">
          {allAmenities.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                    <th className="text-left p-4 font-semibold text-gray-800 border-r border-purple-200 min-w-[160px] text-sm">
                      Amenity
                    </th>
                    {selectedProperties.map((prop, idx) => (
                      <th
                        key={idx}
                        className="text-center p-4 font-semibold text-gray-800 border-r border-purple-200 last:border-r-0 min-w-[200px]"
                      >
                        <div className="flex flex-col items-center">
                          {!prop?.property_logo?.[0] ? (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-2 shadow-sm">
                              <span className="text-purple-600 font-bold text-sm">
                                {prop.property_name.charAt(0)}
                              </span>
                            </div>
                          ) : (
                            <div className="relative w-14 h-14 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105 mb-3 overflow-hidden">
                              <Image
                                src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${prop.property_logo?.[0]}`}
                                alt={prop.property_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <span className="text-sm font-medium break-words text-center leading-tight">
                            {prop.property_name}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allAmenities.map((amenity, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-purple-25 transition-colors duration-200"
                    >
                      <td className="font-semibold p-4 text-gray-700 bg-gradient-to-r from-gray-50 to-purple-25 border-r border-purple-200">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                            <span className="text-purple-600 text-sm">
                              <LuBuilding />
                            </span>
                          </div>
                          <span className="text-sm break-words">{amenity}</span>
                        </div>
                      </td>
                      {selectedProperties.map((prop, pIdx) => {
                        let hasAmenity = false;
                        if (prop.amenities) {
                          Object.values(prop.amenities).forEach(
                            (categoryArray) => {
                              categoryArray.forEach((amenityObj) => {
                                if (amenityObj[amenity] !== undefined) {
                                  hasAmenity =
                                    amenityObj[amenity] === true ||
                                    (Array.isArray(amenityObj[amenity]) &&
                                      amenityObj[amenity].length > 0);
                                }
                              });
                            }
                          );
                        }
                        return (
                          <td
                            key={pIdx}
                            className="p-4 text-center border-r border-gray-100 last:border-r-0"
                          >
                            <div className="flex justify-center">
                              {hasAmenity ? (
                                <div className="w-9 h-9 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform duration-200">
                                  <LuCircleCheck
                                    size={18}
                                    className="text-green-600"
                                  />
                                </div>
                              ) : (
                                <div className="w-9 h-9 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform duration-200">
                                  <LuCircleX
                                    size={18}
                                    className="text-red-500"
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <LuWifi size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Amenities Data
              </h3>
              <p className="text-gray-500 text-sm">
                No amenities data available for comparison
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
