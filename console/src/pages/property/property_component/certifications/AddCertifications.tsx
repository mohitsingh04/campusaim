import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { Upload, X } from "lucide-react";
import { API } from "../../../../contexts/API";
import { PropertyProps } from "../../../../types/types";
import { getErrorResponse } from "../../../../contexts/Callbacks";

interface AddCertificationPageProps {
  property: PropertyProps | null;
  getCertifications: () => void;
}
export default function AddCertifications({
  property,
  getCertifications,
}: AddCertificationPageProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > 8) {
        toast.error("You can upload a maximum of 8 images.");
        return;
      }

      const newImages = [...images, ...acceptedFiles];
      const newPreviews = newImages.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setImages(newImages);
      setPreviews(newPreviews);
    },
    [images]
  );

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setImages(updatedImages);
    setPreviews(updatedPreviews);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    multiple: true,
  });

  const formik = useFormik({
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit: async () => {
      if (images.length === 0) {
        toast.error("Please upload at least one image.");
        return;
      }

      const formData = new FormData();
      images.forEach((image) => {
        formData.append("certifications", image);
      });
      formData.append("property_id", property?.uniqueId || "");

      try {
        setLoading(true);
        const response = await API.post("/certifications", formData);

        toast.success(
          response.data?.message || "Images uploaded successfully 🎉"
        );

        getCertifications();
        setImages([]);
        setPreviews([]);
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <div
          {...getRootProps()}
          className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition group ${
            isDragActive
              ? "border-[var(--yp-main)] bg-[var(--yp-secondary)]"
              : "border-[var(--yp-border-primary)]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 text-[var(--yp-text-primary)]">
            <Upload className="w-8 h-8 text-[var(--yp-main)] group-hover:scale-110 transition-transform" />
            <p className="text-sm sm:text-base">
              {isDragActive
                ? "Drop the images here..."
                : "Drag & drop images here, or click to select"}
            </p>
          </div>
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mt-6">
            {previews.map((file, idx) => (
              <div
                key={idx}
                className="relative rounded-lg overflow-hidden shadow-md border border-[var(--yp-border-primary)] group"
              >
                <img
                  src={file.preview}
                  alt={`Preview ${idx}`}
                  className="w-full h-44 object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 bg-[var(--yp-red-bg)] hover:bg-[var(--yp-red-text)] text-[var(--yp-red-text)] hover:text-[var(--yp-red-bg)] rounded-full p-1 shadow-md transition"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] mt-2"
        >
          {loading ? (
            <>Uploading...</>
          ) : (
            <>
              Upload {images.length} Image{images.length !== 1 ? "s" : ""}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
