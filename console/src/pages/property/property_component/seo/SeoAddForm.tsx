import { useFormik } from "formik";
import CreatableSelect from "react-select/creatable";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import { PropertyProps } from "../../../../types/types";
import { useEffect } from "react";
import {
  getErrorResponse,
  getFormikError,
  stripHtml,
} from "../../../../contexts/Callbacks";
import { SeoValidation } from "../../../../contexts/ValidationsSchemas";
import { reactSelectDesignClass } from "../../../../common/ExtraData";

type KeywordOption = {
  label: string;
  value: string;
};

type SEOFormValues = {
  title: string;
  slug: string;
  primary_focus_keyword: KeywordOption[];
  json_schema: string;
  meta_description: string;
  property_id: string;
};

type SEOAddFormProps = {
  onSave: () => void;
  property?: PropertyProps | null;
};

export function SEOAddForm({ onSave, property }: SEOAddFormProps) {
  const formik = useFormik<SEOFormValues>({
    initialValues: {
      property_id: property?._id ?? "",
      title: property?.property_name || "",
      slug: property?.property_slug || "",
      primary_focus_keyword: [],
      json_schema: "",
      meta_description: stripHtml(property?.property_description || "").slice(
        0,
        160
      ),
    },
    enableReinitialize: true,
    validationSchema: SeoValidation,
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          primary_focus_keyword:
            values?.primary_focus_keyword?.map(
              (k: { value: string }) => k.value
            ) || [],
        };
        const response = await API.post(`/property/seo`, payload);
        toast.success(response.data.message);
        onSave();
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  useEffect(() => {
    if (property?.property_description) {
      const plainText = stripHtml(property?.property_description || "");
      formik.setFieldValue("meta_description", plainText.slice(0, 160));
    }
  }, [property]);

  return (
    <div>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          />
          {getFormikError(formik, "meta_description")}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Slug
          </label>
          <input
            type="text"
            name="slug"
            value={formik.values.slug}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          />
          {getFormikError(formik, "slug")}
        </div>

        {/* Primary Focus Keywords */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Primary Focus Keywords (max 2)
          </label>
          <CreatableSelect
            isMulti
            name="primary_focus_keyword"
            value={formik.values.primary_focus_keyword}
            onChange={(selected) => {
              if (selected && selected.length <= 2) {
                formik.setFieldValue("primary_focus_keyword", selected);
              }
            }}
            placeholder="Type and press enter..."
            classNames={reactSelectDesignClass}
          />
          {getFormikError(formik, "primary_focus_keyword")}
        </div>

        {/* JSON Schema */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            JSON Schema
          </label>
          <textarea
            name="json_schema"
            value={formik.values.json_schema}
            onChange={formik.handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          ></textarea>
          {getFormikError(formik, "json_schema")}
        </div>

        {/* Meta Description */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Meta Description
          </label>
          <textarea
            name="meta_description"
            value={formik.values.meta_description}
            onChange={(e) =>
              formik.setFieldValue("meta_description", e.target.value)
            }
            onBlur={(e) =>
              formik.setFieldValue(
                "meta_description",
                stripHtml(e.target.value).slice(0, 160)
              )
            }
            rows={3}
            maxLength={160}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          />
          <p className="text-xs text-[var(--yp-muted)] text-end">
            {formik.values.meta_description?.length}/160
          </p>
          {getFormikError(formik, "meta_description")}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
