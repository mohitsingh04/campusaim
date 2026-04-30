import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import JoditEditor from "jodit-react";
import { getEditorConfig } from "../../contexts/JoditEditorConfig";
import { useFormik, FormikErrors } from "formik";
import { API } from "../../contexts/API";
import toast from "react-hot-toast";
import LegalSkeleton from "../../ui/skeleton/LegalSkeleton";
import { getErrorResponse } from "../../contexts/Callbacks";

interface LegalValues {
  privacy_policy: string;
  terms: string;
  disclaimer: string;
  cancelation_policy: string;
  cookies: string;
  community_guidlines: string;
}

const LEGAL_KEYS = [
  "privacy_policy",
  "terms",
  "disclaimer",
  "cancelation_policy",
  "cookies",
  "community_guidlines",
] as const;

type LegalKey = (typeof LEGAL_KEYS)[number];

function isLegalKey(k: unknown): k is LegalKey {
  return typeof k === "string" && (LEGAL_KEYS as readonly string[]).includes(k);
}

const DEFAULT_VALUES: LegalValues = {
  privacy_policy: "",
  terms: "",
  disclaimer: "",
  cancelation_policy: "",
  cookies: "",
  community_guidlines: "",
};

export default function LegalPage() {
  const editor = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const editorConfig = useMemo(() => getEditorConfig(), []);
  const rawTab = searchParams.get("tab");
  const activeTab: LegalKey = isLegalKey(rawTab) ? rawTab : "privacy_policy";

  const [legalLoading, setLegalLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [legalData, setLegalData] = useState<LegalValues | null>(null);
  const [sendMail, setSendMail] = useState(false);

  const subNavItems = [
    { id: "privacy_policy", label: "Privacy Policy" },
    { id: "terms", label: "Terms And Conditions" },
    { id: "disclaimer", label: "Disclaimer" },
    { id: "cancelation_policy", label: "Cancelation Policy" },
    { id: "cookies", label: "Cookies" },
    { id: "community_guidlines", label: "Community Guidelines" },
  ];

  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({ tab: "privacy_policy" });
    }
  }, [searchParams, setSearchParams]);

  const handleTabClick = (id: LegalKey) => {
    setSearchParams({ tab: id });
  };

  const getData = useCallback(async () => {
    setLegalLoading(true);
    try {
      const res = await API.get("/legal");
      const data = res.data ?? {};

      const payload: LegalValues = {
        privacy_policy: data.privacy_policy?.content ?? "",
        terms: data.terms?.content ?? "",
        disclaimer: data.disclaimer?.content ?? "",
        cancelation_policy: data.cancelation_policy?.content ?? "",
        cookies: data.cookies?.content ?? "",
        community_guidlines: data.community_guidlines?.content ?? "",
      };

      setLegalData(payload);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLegalLoading(false);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const formik = useFormik<LegalValues>({
    initialValues: legalData ?? DEFAULT_VALUES,
    enableReinitialize: true,
    validate: (values) => {
      const errors: FormikErrors<LegalValues> = {};
      if (!values[activeTab] || values[activeTab].trim() === "") {
        errors[activeTab] = `${
          subNavItems.find((i) => i.id === activeTab)?.label
        } is required`;
      }
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setLoading(true);

        const payload = {
          [activeTab]: values[activeTab],
          sendMail,
        };

        const res = await API.patch("/legal", payload);

        const successMsg =
          res?.data?.message ??
          `${
            subNavItems.find((i) => i.id === activeTab)?.label
          } saved successfully`;

        toast.success(successMsg);
        await getData();
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  if (legalLoading) return <LegalSkeleton />;

  const fieldMeta = formik.getFieldMeta(activeTab);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="Legals"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Legals" },
        ]}
      />

      {/* Tabs */}
      <div className="border-b border-[var(--yp-border-primary)]">
        <nav className="flex space-x-8">
          {subNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id as LegalKey)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === item.id
                  ? "border-[var(--yp-main)] text-[var(--yp-main)]"
                  : "border-transparent text-[var(--yp-text-primary)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Editor */}
      <div className="bg-[var(--yp-primary)] rounded-lg shadow">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-[var(--yp-muted)]">
              {subNavItems.find((item) => item.id === activeTab)?.label} Content
            </label>

            <div id="blog-main">
              <JoditEditor
                ref={editor}
                value={formik.values[activeTab]}
                config={editorConfig}
                onBlur={() => formik.setFieldTouched(activeTab, true)}
                onChange={(val: string) => formik.setFieldValue(activeTab, val)}
              />
            </div>

            {fieldMeta.touched && fieldMeta.error && (
              <p className="mt-2 text-sm text-red-600">{fieldMeta.error}</p>
            )}
          </div>

          {/* Mail checkbox */}
          <div className="flex items-center space-x-2">
            <input
              id="sendMail"
              type="checkbox"
              checked={sendMail}
              onChange={(e) => setSendMail(e.target.checked)}
              className="w-4 h-4"
            />
            <label
              htmlFor="sendMail"
              className="text-sm text-[var(--yp-text-primary)]"
            >
              Send mail notification
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || formik.isSubmitting}
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
          >
            {loading || formik.isSubmitting
              ? "Saving..."
              : `Save ${subNavItems.find((i) => i.id === activeTab)?.label}`}
          </button>
        </form>
      </div>
    </div>
  );
}
