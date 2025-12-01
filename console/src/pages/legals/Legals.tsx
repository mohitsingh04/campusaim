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
  privacyPolicy: string;
  terms: string;
  disclaimer: string;
  cancelationPolicy: string;
  cookies: string;
}

const LEGAL_KEYS = [
  "privacyPolicy",
  "terms",
  "disclaimer",
  "cancelationPolicy",
  "cookies",
] as const;
type LegalKey = (typeof LEGAL_KEYS)[number];

function isLegalKey(k: unknown): k is LegalKey {
  return typeof k === "string" && (LEGAL_KEYS as readonly string[]).includes(k);
}

const DEFAULT_VALUES: LegalValues = {
  privacyPolicy: "",
  terms: "",
  disclaimer: "",
  cancelationPolicy: "",
  cookies: "",
};

export default function LegalPage() {
  const editor = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const editorConfig = useMemo(() => getEditorConfig(), []);
  const rawTab = searchParams.get("tab");
  const activeTab: LegalKey = isLegalKey(rawTab) ? rawTab : "privacyPolicy";
  const [legalLoading, setLegalLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [legalData, setLegalData] = useState<LegalValues | null>(null);
  const [sendMail, setSendMail] = useState(false); // ✅ new state for checkbox

  const subNavItems = [
    { id: "privacyPolicy", label: "Privacy Policy" },
    { id: "terms", label: "Terms And Conditions" },
    { id: "disclaimer", label: "Disclaimer" },
    { id: "cancelationPolicy", label: "Cancelation Policy" },
    { id: "cookies", label: "Cookies" },
  ];

  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({ tab: "privacyPolicy" });
    }
  }, [searchParams, setSearchParams]);

  const handleTabClick = (id: LegalKey) => {
    setSearchParams({ tab: id });
  };

  const getData = useCallback(async () => {
    try {
      setLegalLoading(true);
      const res = await API.get("/legal");
      const data = res.data ?? {};
      const payload: LegalValues = {
        privacyPolicy: data.privacyPolicy ?? "",
        terms: data.terms ?? "",
        disclaimer: data.disclaimer ?? "",
        cancelationPolicy: data.cancelationPolicy ?? "",
        cookies: data.cookies ?? "",
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

        // ✅ Include sendMail in payload
        const payload = {
          [activeTab]: values[activeTab],
          sendMail, // <-- only true if user checked box
        };

        const res = await API.patch(`/legal`, payload);

        const successMsg =
          res?.data?.message ??
          `${
            subNavItems.find((i) => i.id === activeTab)?.label
          } saved successfully!`;

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

  if (legalLoading) {
    return <LegalSkeleton />;
  }

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

      <div className="bg-[var(--yp-primary)] rounded-lg shadow">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-[var(--yp-muted)]">
              {subNavItems.find((item) => item.id === activeTab)?.label} Content
            </label>
            <JoditEditor
              ref={editor}
              value={formik.values[activeTab]}
              config={editorConfig}
              onBlur={() => formik.setFieldTouched(activeTab, true)}
              onChange={(newContent: string) =>
                formik.setFieldValue(activeTab, newContent)
              }
            />
            {fieldMeta.touched && fieldMeta.error && (
              <p className="mt-2 text-sm text-red-600">{fieldMeta.error}</p>
            )}
          </div>

          {/* ✅ Send Mail Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              id="sendMail"
              type="checkbox"
              checked={sendMail}
              onChange={(e) => setSendMail(e.target.checked)}
              className="w-4 h-4 text-[var(--yp-main)] border-gray-300 rounded focus:ring-[var(--yp-main)]"
            />
            <label htmlFor="sendMail" className="text-sm text-[var(--yp-muted)]">
              Do you want to send mail notification?
            </label>
          </div>

          <div className="flex justify-start">
            <button
              type="submit"
              disabled={loading || formik.isSubmitting}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
            >
              {loading || formik.isSubmitting
                ? "Saving..."
                : `Save ${subNavItems.find((i) => i.id === activeTab)?.label}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
