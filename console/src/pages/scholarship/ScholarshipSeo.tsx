import { useFormik } from "formik";
import CreatableSelect from "react-select/creatable";
import { useCallback, useEffect, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { ScholarshipProps } from "../../types/types";
import {
  generateSlug,
  getErrorResponse,
  getFormikError,
  stripHtml,
} from "../../contexts/Callbacks";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "../../contexts/API";
import EditSkeleton from "../../ui/skeleton/EditPageSkeleton";
import toast from "react-hot-toast";
import { SeoValidation } from "../../contexts/ValidationsSchemas";
import { reactSelectDesignClass } from "../../common/ExtraData";

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
  scholarship_id: string | number;
  type: string;
};

export default function ScholarshipSeo() {
  const { objectId } = useParams();
  const [scholarship, setScholarship] = useState<ScholarshipProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [scholarshipSeo, setScholarshipSeo] = useState<any | null>(null);
  const navigate = useNavigate();

  /** Fetch Scholarship */
  const getScholarship = useCallback(async () => {
    try {
      const response = await API.get(`/scholarship/${objectId}`);
      setScholarship(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [objectId]);

  useEffect(() => {
    getScholarship();
  }, [getScholarship]);

  const getScholarshipSeo = useCallback(async () => {
    if (!scholarship) return;
    setLoading(true);
    try {
      const response = await API.get(`/seo/scholarship/${objectId}`);
      setScholarshipSeo(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [scholarship, objectId]);

  useEffect(() => {
    getScholarshipSeo();
  }, [getScholarshipSeo]);

  /** Formik setup */
  const formik = useFormik<SEOFormValues>({
    initialValues: {
      scholarship_id: scholarship?._id || "",
      title: scholarshipSeo?.title || scholarship?.scholarship_title || "",
      slug: scholarshipSeo?.slug || generateSlug(scholarship?.scholarship_title || ""),
      primary_focus_keyword:
        scholarshipSeo?.primary_focus_keyword?.map((k: string) => {
          return { value: k, label: k };
        }) || [],
      json_schema: scholarshipSeo?.json_schema || "",
      meta_description: stripHtml(
        scholarshipSeo?.meta_description || scholarship?.scholarship_description
      ).slice(0, 160),
      type: scholarshipSeo?.type || "scholarship",
    },
    enableReinitialize: true,
    validationSchema: SeoValidation,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const payload = {
          ...values,
          slug: generateSlug(values?.slug),
          primary_focus_keyword:
            values?.primary_focus_keyword?.map(
              (k: { value: string }) => k.value
            ) || [],
        };
        const response = await API.post(`/all/seo`, payload);
        toast.success(response.data.message);
        navigate(`/dashboard/scholarship`);
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (loading) {
    return <EditSkeleton />;
  }

  return (
    <div>
      <div>
        <Breadcrumbs
          title="Scholarship Seo"
          breadcrumbs={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Scholarship", path: "/dashboard/scholarship" },
            {
              label: scholarship?.scholarship_title || "",
              path: `/dashboard/scholarship/${scholarship?._id}`,
            },
            { label: "Seo" },
          ]}
        />
      </div>

      <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 space-x-2">
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
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "title")}
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
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "slug")}
            </div>
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
            />
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
              disabled={formik.isSubmitting}
            >
              {formik?.isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
