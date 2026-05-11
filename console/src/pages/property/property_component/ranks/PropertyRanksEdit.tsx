import { BiTrash } from "react-icons/bi";
import { useFormik } from "formik";
import CreatableSelect from "react-select/creatable";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import type { RankItem } from "./PropertyRanks";
import { useCallback, useEffect, useState } from "react";
import { reactSelectDesignClass } from "../../../../common/ExtraData";

interface EditProps {
  propertyId: string;
  initialRanks: RankItem[];
  onSuccess: () => void;
  onCancel: () => void;
}

interface RankValueItem {
  value_name: string;
  _id?: string;
}

interface RankListItem {
  _id?: string;
  rank_name: string;
  rank_value: RankValueItem[];
}

interface RankOption {
  label: string;
  value: string;
  rank_value: RankValueItem[];
}

export default function PropertyRanksEdit({
  propertyId,
  initialRanks,
  onSuccess,
  onCancel,
}: EditProps) {
  const [ranks, setRanks] = useState<RankOption[]>([]);

  const getRanksList = useCallback(async () => {
    try {
      const response = await API.get("/rank-list");

      const apiData = Array.isArray(response.data)
        ? response.data
        : [response.data];

      const formattedData: RankOption[] = apiData.map((item: RankListItem) => ({
        label: item.rank_name,
        value: item.rank_name,
        rank_value: item.rank_value || [],
      }));

      setRanks(formattedData);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getRanksList();
  }, [getRanksList]);

  const formik = useFormik({
    initialValues: {
      ranks:
        initialRanks.length > 0
          ? initialRanks
          : [
              {
                rank_name: "",
                value_name: "",
              },
            ],
    },
    enableReinitialize: true,

    onSubmit: async (values) => {
      try {
        const payload = {
          property_id: propertyId,
          ranks: values.ranks.map((item) => ({
            rank_name: item.rank_name,
            value_name: item.value_name,
          })),
        };

        console.log(payload);

        const response = await API.post("/ranking", payload);

        toast.success(response.data.message || "Ranks updated successfully");

        onSuccess();
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  return (
    <div className="p-6 rounded-lg shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <p className="font-bold text-[var(--yp-text-primary)]">Edit Ranks</p>

        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-red-500 hover:underline"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {formik.values.ranks.map((rank, index) => {
          const selectedRank = ranks.find(
            (item) => item.value === rank.rank_name,
          );

          const valueOptions =
            selectedRank?.rank_value?.map((item) => ({
              label: item.value_name,
              value: item.value_name,
            })) || [];

          return (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-[var(--yp-secondary)] p-4 rounded-lg border border-transparent hover:border-[var(--yp-main)] transition-all"
            >
              {/* Rank Name */}
              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-3">
                  Rank Name
                </label>

                <CreatableSelect
                  isClearable
                  options={ranks}
                  placeholder="Select or type..."
                  value={
                    rank.rank_name
                      ? {
                          label: rank.rank_name,
                          value: rank.rank_name,
                        }
                      : null
                  }
                  onChange={(val) => {
                    formik.setFieldValue(
                      `ranks.${index}.rank_name`,
                      val ? val.value : "",
                    );

                    formik.setFieldValue(`ranks.${index}.value_name`, "");
                  }}
                  classNames={reactSelectDesignClass}
                />
              </div>

              {/* Rank Value */}
              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-3">
                  Rank Value
                </label>

                <CreatableSelect
                  isClearable
                  options={valueOptions}
                  placeholder="Select or type..."
                  value={
                    rank.value_name
                      ? {
                          label: rank.value_name,
                          value: rank.value_name,
                        }
                      : null
                  }
                  onChange={(val) =>
                    formik.setFieldValue(
                      `ranks.${index}.value_name`,
                      val ? val.value : "",
                    )
                  }
                  classNames={reactSelectDesignClass}
                />
              </div>

              {/* Delete */}
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    formik.setFieldValue(
                      "ranks",
                      formik.values.ranks.filter((_, i) => i !== index),
                    )
                  }
                  disabled={formik.values.ranks.length === 1}
                  className="p-3 text-gray-400 hover:text-red-500 disabled:opacity-20 transition-colors"
                >
                  <BiTrash size={20} />
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() =>
            formik.setFieldValue("ranks", [
              ...formik.values.ranks,
              {
                rank_name: "",
                value_name: "",
              },
            ])
          }
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] disabled:opacity-50"
        >
          Add Rank
        </button>

        <div className="flex justify-end pt-4 gap-3 border-t border-[var(--yp-main)]">
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] disabled:opacity-50"
          >
            {formik.isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
