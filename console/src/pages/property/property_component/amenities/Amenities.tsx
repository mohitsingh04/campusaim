import { useCallback, useEffect, useState } from "react";
import Select, { MultiValue } from "react-select";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import { PropertyProps } from "../../../../types/types";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import ToggleButton from "../../../../ui/button/ToggleButton";
import { reactSelectDesignClass } from "../../../../common/ExtraData";
import { AmenitiesData } from "../../../../common/AmenitiesData";

type AmenityOption = { name: string; options: string[] };
type AmenityItem = string | AmenityOption;

type Answer = {
  checked: boolean;
  selectedOptions: MultiValue<{ value: string; label: string }>;
};

type AnswersType = Record<string, Answer>;

type AmenitiesProps = {
  property: PropertyProps | null;
};

export default function Amenities({ property }: AmenitiesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Mandatory");
  const [foundAmenities, setFoundAmenities] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [answers, setAnswers] = useState<AnswersType>(() => {
    const initAnswers: AnswersType = {};
    Object.values(AmenitiesData).forEach((items) => {
      items.forEach((item) => {
        const name = typeof item === "string" ? item : item.name;
        initAnswers[name] = { checked: false, selectedOptions: [] };
      });
    });
    return initAnswers;
  });

  const getAmenities = useCallback(async () => {
    if (!property?.uniqueId) return;
    try {
      const response = await API.get(`/property/amenities/${property.uniqueId}`);
      const data = response.data;
      setFoundAmenities(data);

      if (data?.selectedAmenities?.length) {
        const selected = data.selectedAmenities[0];
        const prefill: AnswersType = {};

        Object.values(AmenitiesData)
          .flat()
          .forEach((item) => {
            const name = typeof item === "string" ? item : item.name;
            prefill[name] = { checked: false, selectedOptions: [] };
          });

        Object.values(selected).forEach((items) => {
          (items as any[]).forEach((item) => {
            Object.entries(item).forEach(([amenityName, value]) => {
              prefill[amenityName] = {
                checked: !!value,
                selectedOptions: Array.isArray(value)
                  ? value.map((v) => ({ value: v, label: v }))
                  : [],
              };
            });
          });
        });

        setAnswers(prefill);
      }
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [property?.uniqueId]);

  useEffect(() => {
    getAmenities();
  }, [getAmenities]);

  const handleToggle = (amenity: string) => {
    setAnswers((prev) => ({
      ...prev,
      [amenity]: { ...prev[amenity], checked: !prev[amenity].checked },
    }));
  };

  const handleSelectOptions = (
    amenity: string,
    options: MultiValue<{ value: string; label: string }>
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [amenity]: { ...prev[amenity], selectedOptions: options || [] },
    }));
  };

  const handleSave = async () => {
    for (const [name, data] of Object.entries(answers)) {
      if (data.checked) {
        const itemObj = Object.values(AmenitiesData)
          .flat()
          .find((item) =>
            typeof item === "string" ? item === name : item.name === name
          ) as AmenityOption | string | undefined;

        if (itemObj && typeof itemObj !== "string" && itemObj.options) {
          if (!data.selectedOptions.length) {
            toast.error(`Please select at least 1 option for "${name}"`);
            return;
          }
        }
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        propertyId: property?.uniqueId,
        selectedAmenities: [],
      };

      const grouped: Record<string, any[]> = {};

      Object.entries(answers).forEach(([name, data]) => {
        if (!data.checked) return;
        const category =
          Object.keys(AmenitiesData).find((cat) =>
            AmenitiesData[cat].some((item) =>
              typeof item === "string" ? item === name : item.name === name
            )
          ) || "Other";

        if (!grouped[category]) grouped[category] = [];

        const itemObj = AmenitiesData[category]?.find((item) =>
          typeof item === "string" ? item === name : item.name === name
        );

        if (itemObj && typeof itemObj !== "string" && itemObj.options) {
          grouped[category].push({
            [name]: data.selectedOptions.map((o) => o.value),
          });
        } else {
          grouped[category].push({ [name]: true });
        }
      });

      payload.selectedAmenities.push(grouped);

      if (foundAmenities?.uniqueId) {
        const response = await API.put(
          `/amenities/${foundAmenities.uniqueId}`,
          payload
        );
        toast.success(
          response.data.message || "Amenities updated successfully!"
        );
      } else {
        const response = await API.post("/amenities", payload);
        toast.success(response.data.message || "Amenities saved successfully!");
      }
    } catch (error) {
      getErrorResponse(error);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col lg:flex-row bg-[var(--yp-secondary)] rounded-xl overflow-hidden">
        {/* Mobile Tabs */}
        <div className="lg:hidden border-b border-[var(--yp-border-primary)] bg-[var(--yp-tertiary)] overflow-x-auto">
          <div className="flex space-x-3 px-3 py-2 min-w-max">
            {Object.entries(AmenitiesData).map(([category, items]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)] shadow-sm"
                    : "bg-[var(--yp-secondary)] text-[var(--yp-muted)] hover:opacity-80"
                }`}
              >
                {category}{" "}
                <span className="ml-1 text-xs">({items.length})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:block w-64 bg-[var(--yp-tertiary)]">
          <h2 className="px-5 py-4 text-lg font-semibold text-[var(--yp-text-primary)]">
            Add Property Amenities
          </h2>
          <ul>
            {Object.entries(AmenitiesData).map(([category, items]) => (
              <li
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex justify-between items-center px-5 py-3 cursor-pointer transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
                    : "text-[var(--yp-muted)] hover:opacity-70"
                }`}
              >
                <span>{category}</span>
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    selectedCategory === category
                      ? "bg-[var(--yp-orange-text)] text-[var(--yp-orange-bg)]"
                      : "bg-[var(--yp-green-bg)] text-[var(--yp-green-text)]"
                  }`}
                >
                  {items.length}
                </span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6">
          <h3 className="text-xl font-bold text-[var(--yp-text-primary)] mb-4 text-center sm:text-left">
            {selectedCategory}
          </h3>
          <ul className="space-y-4">
            {AmenitiesData[selectedCategory]?.map((item: AmenityItem) => {
              const amenityName = typeof item === "string" ? item : item.name;
              const subOptions = typeof item !== "string" ? item.options : null;
              const answer = answers[amenityName] || {
                checked: false,
                selectedOptions: [],
              };

              return (
                <li
                  key={amenityName}
                  className="flex flex-col border-b border-[var(--yp-border-primary)] pb-2"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <span className="font-medium text-[var(--yp-text-secondary)] text-sm sm:text-base">
                      {amenityName}
                    </span>
                    <div className="flex justify-end">
                      <ToggleButton
                        enabled={answer.checked}
                        onToggle={() => handleToggle(amenityName)}
                      />
                    </div>
                  </div>

                  {subOptions && answer.checked && (
                    <div className="mt-2">
                      <Select
                        isMulti
                        options={subOptions.map((opt) => ({
                          value: opt,
                          label: opt,
                        }))}
                        value={answer.selectedOptions}
                        onChange={(selected) =>
                          handleSelectOptions(amenityName, selected)
                        }
                        placeholder="Select options..."
                        classNames={reactSelectDesignClass}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </main>
      </div>

      {/* Save Button */}
      <div className="text-center lg:text-end mt-4">
        <button
          disabled={loading}
          onClick={handleSave}
          className="px-6 py-2 rounded-lg text-sm sm:text-base font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] mt-2 w-full sm:w-auto"
        >
          {loading ? "Saving..." : "Update Amenities"}
        </button>
      </div>
    </div>
  );
}
