"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FileText, Plus, X, FileType, FileCheck2 } from "lucide-react";
import {
  getErrorResponse,
  getFormikError,
} from "../../../../contexts/Callbacks";
import { PropertyProps } from "../../../../types/types";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";

export default function BussinessIdentityTab({
  property,
  verifyDoc,
  getVerificationDocs,
}: {
  property: PropertyProps | null;
  verifyDoc: any;
  getVerificationDocs: () => void;
}) {
  const [previewFiles, setPreviewFiles] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);

  const formik = useFormik({
    initialValues: {
      business_identity_proof: [] as File[],
    },
    validationSchema: Yup.object({
      business_identity_proof: Yup.array()
        .min(1, "At least one file is required")
        .test(
          "fileType",
          "Only JPG, PNG, PDF, or DOC files are allowed",
          (files) => {
            if (!files || files.length === 0) return false;
            const allowedTypes = [
              "image/jpeg",
              "image/png",
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];
            return files.every((file) => allowedTypes.includes(file.type));
          }
        ),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("property_id", property?._id ?? "");
      values.business_identity_proof.forEach((file) => {
        formData.append("business_identity_proof", file);
      });
      try {
        const response = await API.post(
          `/property/verification/upload/doc`,
          formData
        );
        toast.success(response.data.message);
        resetForm();
        setPreviewFiles([]);
        setShowForm(false);
        getVerificationDocs();
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    formik.setFieldValue("business_identity_proof", fileArray);

    const readers = fileArray
      .filter((f) => f.type.startsWith("image/"))
      .map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsDataURL(file);
          })
      );

    Promise.all(readers).then((images) => setPreviewFiles(images));
  };

  const removeFile = (index: number) => {
    const newFiles = [...formik.values.business_identity_proof];
    newFiles.splice(index, 1);
    formik.setFieldValue("business_identity_proof", newFiles);

    const newPreviews = [...previewFiles];
    newPreviews.splice(index, 1);
    setPreviewFiles(newPreviews);
  };

  // 🔹 Helper to detect file type by extension
  const getFileType = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png"].includes(ext!)) return "image";
    if (["pdf"].includes(ext!)) return "pdf";
    if (["doc", "docx"].includes(ext!)) return "doc";
    return "other";
  };

  return (
    <div className="bg-[var(--yp-primary)] p-6 rounded-lg shadow-sm">
      {!showForm ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
              Submitted Business Identity Files
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)] rounded-lg text-sm font-medium"
            >
              <Plus size={16} /> Add New
            </button>
          </div>

          {verifyDoc?.business_identity_proof?.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {verifyDoc.business_identity_proof.map(
                (file: string, index: number) => {
                  const type = getFileType(file);
                  const fileUrl = `${import.meta.env.VITE_MEDIA_URL}${file}`;

                  return (
                    <a
                      key={index}
                      href={fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-24 h-24 flex items-center justify-center rounded-lg transition shadow-sm cursor-pointer
                        ${
                          type === "pdf"
                            ? "bg-red-100 hover:bg-red-200"
                            : type === "doc"
                            ? "bg-blue-100 hover:bg-blue-200"
                            : "bg-[var(--yp-input-primary)] hover:bg-[var(--yp-blue-bg)]"
                        }`}
                      title={`Download ${type.toUpperCase()} File`}
                    >
                      {type === "image" ? (
                        <img
                          src={fileUrl}
                          alt="File"
                          className="object-cover w-full h-full rounded-lg"
                        />
                      ) : type === "pdf" ? (
                        <FileType className="w-8 h-8 text-red-600" />
                      ) : type === "doc" ? (
                        <FileCheck2 className="w-8 h-8 text-blue-600" />
                      ) : (
                        <FileText className="w-8 h-8 text-[var(--yp-blue-text)]" />
                      )}
                    </a>
                  );
                }
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--yp-muted)] mt-2">
              No business identity files uploaded yet.
            </p>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
              Upload Business Identity Proof
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-[var(--yp-blue-text)] hover:underline"
            >
              Back to List
            </button>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Business Identity Proof
              </label>

              <div className="border-2 border-dashed border-[var(--yp-border-primary)] rounded-lg p-4 text-center hover:border-[var(--yp-muted)] bg-[var(--yp-input-primary)] transition-colors">
                <input
                  type="file"
                  id="business-identity-proof"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="business-identity-proof"
                  className="cursor-pointer block"
                >
                  {formik.values.business_identity_proof.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-3">
                      {formik.values.business_identity_proof.map(
                        (file, index) => (
                          <div
                            key={index}
                            className="relative w-24 h-24 border rounded-lg flex items-center justify-center overflow-hidden bg-[var(--yp-secondary)]"
                          >
                            {file.type.startsWith("image/") &&
                            previewFiles[index] ? (
                              <img
                                src={previewFiles[index]}
                                alt="Preview"
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <FileText className="w-8 h-8 text-[var(--yp-muted)]" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <>
                      <FileText className="w-8 h-8 text-[var(--yp-muted)] mx-auto mb-2" />
                      <p className="text-sm text-[var(--yp-muted)]">
                        Click to upload file(s)
                      </p>
                    </>
                  )}
                </label>
              </div>

              {getFormikError(formik, "business_identity_proof")}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
            >
              {formik.isSubmitting ? "Uploading..." : "Submit"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
