import { useCallback, useEffect, useMemo, useState } from "react";
import Select, { MultiValue } from "react-select";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import { PropertyProps } from "../../../../types/types";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import ToggleButton from "../../../../ui/button/ToggleButton";
import { reactSelectDesignClass } from "../../../../common/ExtraData";
import {
  AmenitiesData,
  AmenityItem,
  CategoryIcons,
  SubcategoryIcons,
} from "../../../../common/AmenitiesData";

import { LuShield, LuCheck } from "react-icons/lu";

type SelectOption = { value: string; label: string };

type Answer = {
  checked: boolean;
  selectedOptions: MultiValue<SelectOption>;
};

type AnswersType = Record<string, Answer>;

type AmenitiesProps = {
  property: PropertyProps | null;
};

export default function Amenities({ property }: AmenitiesProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Basic Facilities");
  const [foundAmenities, setFoundAmenities] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [answers, setAnswers] = useState<AnswersType>({});

  const getAmenityIcon = (amenityName: string) => {
    const Icon = SubcategoryIcons[amenityName] || LuShield;
    return Icon;
  };

  const allAmenitiesList = useMemo(() => {
    const list: { category: string; item: AmenityItem; name: string }[] = [];

    Object.entries(AmenitiesData).forEach(([category, items]) => {
      items.forEach((item) => {
        const name = typeof item === "string" ? item : item.name;
        list.push({ category, item, name });
      });
    });

    return list;
  }, []);

  const buildInitialAnswers = useCallback((): AnswersType => {
    const init: AnswersType = {};
    allAmenitiesList.forEach(({ name }) => {
      init[name] = { checked: false, selectedOptions: [] };
    });
    return init;
  }, [allAmenitiesList]);

  const getCategoryCount = (category: string) => {
    const items = AmenitiesData[category] || [];
    const filledCount = items.filter((item) => {
      const name = typeof item === "string" ? item : item.name;
      return answers[name]?.checked;
    }).length;

    return {
      filled: filledCount,
      total: items.length,
    };
  };

  const getAmenities = useCallback(async () => {
    if (!property?._id) return;
    try {
      const response = await API.get(`/property/amenities/${property._id}`);
      const data = response.data;
      setFoundAmenities(data);

      const prefill = buildInitialAnswers();

      if (data?.selectedAmenities?.length) {
        const selected = data.selectedAmenities[0];

        Object.values(selected).forEach((items) => {
          (items as any[]).forEach((item) => {
            Object.entries(item).forEach(([amenityName, value]) => {
              if (!prefill[amenityName]) return;

              prefill[amenityName] = {
                checked: !!value,
                selectedOptions: Array.isArray(value)
                  ? value.map((v) => ({ value: v, label: v }))
                  : [],
              };
            });
          });
        });
      }

      setAnswers(prefill);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [property?._id, buildInitialAnswers]);

  useEffect(() => {
    getAmenities();
  }, [getAmenities]);

  const handleToggle = (amenity: string) => {
    setAnswers((prev) => ({
      ...prev,
      [amenity]: { ...prev[amenity], checked: !prev[amenity]?.checked },
    }));
  };

  const handleSelectOptions = (
    amenity: string,
    options: MultiValue<SelectOption>,
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [amenity]: { ...prev[amenity], selectedOptions: options || [] },
    }));
  };

  const handleSave = async () => {
    for (const { item, name } of allAmenitiesList) {
      const answer = answers[name];

      if (!answer?.checked) continue;

      if (typeof item !== "string" && item.options?.length) {
        if (!answer.selectedOptions?.length) {
          toast.error(`Please select at least 1 option for "${name}"`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      const grouped: Record<string, any[]> = {};

      for (const { category, item, name } of allAmenitiesList) {
        const answer = answers[name];
        if (!answer?.checked) continue;

        if (!grouped[category]) grouped[category] = [];

        if (typeof item !== "string" && item.options?.length) {
          grouped[category].push({
            [name]: answer.selectedOptions.map((o) => o.value),
          });
        } else {
          grouped[category].push({ [name]: true });
        }
      }

      const hasAnyAmenity = Object.values(grouped).some(
        (arr) => Array.isArray(arr) && arr.length > 0,
      );

      if (!hasAnyAmenity) {
        toast.error("Please select at least 1 amenity before saving.");
        setLoading(false);
        return;
      }

      const payload: any = {
        property_id: property?._id,
        selectedAmenities: [grouped],
      };

      if (foundAmenities?._id) {
        const response = await API.put(
          `/amenities/${foundAmenities._id}`,
          payload,
        );
        toast.success(
          response.data.message || "Amenities updated successfully!",
        );
      } else {
        const response = await API.post("/amenities", payload);
        toast.success(response.data.message || "Amenities saved successfully!");
      }
    } catch (error) {
      getErrorResponse(error);
    } finally {
      getAmenities();
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col lg:flex-row gap-2 items-start">
        {/* === LEFT SIDEBAR (Categories) === */}
        <aside className="w-full lg:w-72 shrink-0 bg-[var(--yp-tertiary)] rounded-2xl shadow-sm lg:sticky lg:top-4 overflow-hidden">
          <div className="px-5 py-4 bg-[var(--yp-secondary)]">
            <h2 className="text-lg font-bold text-[var(--yp-text-primary)]">
              Categories
            </h2>
          </div>

          {/* Desktop List */}
          <ul className="hidden lg:flex flex-col p-2 space-y-1 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
            {Object.entries(AmenitiesData).map(([category]) => {
              const Icon = CategoryIcons[category] || LuShield;
              const isActive = selectedCategory === category;
              const { filled, total } = getCategoryCount(category);

              return (
                <li key={category}>
                  <button
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-left ${
                      isActive
                        ? "bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)] shadow-sm"
                        : "text-[var(--yp-text-secondary)] hover:bg-[var(--yp-secondary)] hover:text-[var(--yp-text-primary)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`text-xl ${
                          isActive
                            ? "text-[var(--yp-blue-text)]"
                            : "text-[var(--yp-muted)] group-hover:text-[var(--yp-text-primary)]"
                        }`}
                      />
                      <span className="font-medium text-sm">{category}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm transition-colors ${
                        isActive
                          ? "bg-[var(--yp-blue-text)] text-white"
                          : filled > 0
                            ? "bg-[var(--yp-green-text)] text-white"
                            : "bg-[var(--yp-secondary)] text-[var(--yp-muted)]"
                      }`}
                    >
                      {filled} / {total}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Mobile Horizontal Tabs */}
          <div className="lg:hidden w-full overflow-x-auto no-scrollbar bg-[var(--yp-secondary)] p-3">
            <div className="flex space-x-3">
              {Object.entries(AmenitiesData).map(([category]) => {
                const Icon = CategoryIcons[category] || LuShield;
                const isActive = selectedCategory === category;
                const { filled, total } = getCategoryCount(category);

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[var(--yp-blue-text)] text-white shadow-md"
                        : "bg-[var(--yp-tertiary)] text-[var(--yp-text-secondary)]"
                    }`}
                  >
                    <Icon className="text-base" />
                    {category}
                    <span
                      className={`text-[10px] ml-1 px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20"
                          : filled > 0
                            ? "bg-[var(--yp-green-bg)] text-[var(--yp-green-text)]"
                            : "bg-[var(--yp-secondary)]"
                      }`}
                    >
                      {filled}/{total}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* === MAIN CONTENT (Checklist) === */}
        <div className="flex-1 w-full bg-[var(--yp-secondary)] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 flex justify-between items-center bg-[var(--yp-secondary)]/80 backdrop-blur-sm sticky top-0 z-10">
            <div>
              <h3 className="text-xl font-bold text-[var(--yp-text-primary)] flex items-center gap-2">
                {selectedCategory}
              </h3>
              <p className="text-sm text-[var(--yp-muted)] mt-1">
                Select the amenities available at your property.
              </p>
            </div>
          </div>

          <div className="p-6">
            <ul className="grid grid-cols-1 gap-y-2">
              {AmenitiesData[selectedCategory]?.map((item: AmenityItem) => {
                const amenityName = typeof item === "string" ? item : item.name;
                const subOptions =
                  typeof item !== "string" ? item.options : null;

                const answer = answers[amenityName] || {
                  checked: false,
                  selectedOptions: [],
                };

                const AmenityIcon = getAmenityIcon(amenityName);
                const isChecked = answer.checked;

                return (
                  <li
                    key={amenityName}
                    className={`group rounded-xl transition-all duration-200 ${
                      isChecked
                        ? "bg-[var(--yp-primary)] shadow-sm"
                        : "hover:bg-[var(--yp-tertiary)]/20"
                    }`}
                  >
                    <div className="flex flex-col py-3 px-4">
                      <div className="flex items-center justify-between gap-4">
                        <div
                          className="flex items-center gap-4 cursor-pointer flex-1"
                          onClick={() => handleToggle(amenityName)}
                        >
                          <div
                            className={`p-2.5 rounded-full transition-colors duration-300 ${
                              isChecked
                                ? "bg-[var(--yp-green-bg)] text-[var(--yp-green-text)]"
                                : "bg-[var(--yp-red-bg)] text-[var(--yp-red-text)]"
                            }`}
                          >
                            <AmenityIcon className="text-xl" />
                          </div>

                          <span
                            className={`font-medium text-base transition-colors ${
                              isChecked
                                ? "text-[var(--yp-text-primary)]"
                                : "text-[var(--yp-text-secondary)]"
                            }`}
                          >
                            {amenityName}
                          </span>
                        </div>

                        <div className="shrink-0">
                          <ToggleButton
                            enabled={answer.checked}
                            onToggle={() => handleToggle(amenityName)}
                          />
                        </div>
                      </div>

                      {subOptions && isChecked && (
                        <div className="mt-3 ml-[3.5rem] animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="p-3 bg-[var(--yp-main-subtle)] rounded-lg shadow-sm ring-1 ring-(--yp-main)">
                            <label className="text-xs font-semibold text-[var(--yp-muted)] uppercase mb-2 block tracking-wider">
                              Select Options
                            </label>
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
                              placeholder={`Select ${amenityName} types...`}
                              classNames={reactSelectDesignClass}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* === FOOTER ACTION === */}
      <div className="sticky bottom-4 z-20 flex justify-end">
        <div className="inline-flex">
          <button
            disabled={loading}
            onClick={handleSave}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200
              ${
                loading
                  ? "bg-[var(--yp-tertiary)] text-[var(--yp-muted)] cursor-not-allowed"
                  : "bg-[var(--yp-blue-text)] text-white hover:bg-[var(--yp-blue-text)]/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              }
            `}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <LuCheck className="text-lg" />
                <span>Save Amenities</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
