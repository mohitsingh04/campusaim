import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { API } from "../../../../contexts/API";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import { X } from "lucide-react";

interface AddAccomodationImagesProps {
  accomodation: any;
  getAccomodations: () => void;
  setAddingMore: (mode: "") => void;
}

export default function AddAccomodationImages({
  accomodation,
  getAccomodations,
  setAddingMore,
}: AddAccomodationImagesProps) {
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
      const newPreviews = newImages.map((file: any) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );

      setImages(newImages);
      setPreviews(newPreviews);
    },
    [images]
  );

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [] },
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
      images.forEach((img) => {
        formData.append("images", img);
      });

      try {
        setLoading(true);
        const response = await API.patch(
          `/accomodation/images/${accomodation?._id}`,
          formData
        );

        toast.success(
          response.data.message || "Accommodation images uploaded successfully."
        );
        setImages([]);
        setPreviews([]);
        setAddingMore("");
        getAccomodations();
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold text-lg text-[var(--yp-text-primary)]">
          Add Accommodation Images
        </h2>
        <button
          onClick={() => setAddingMore("")}
          className="px-1 py-1 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={formik.handleSubmit} className="p-4 space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition ${
            isDragActive
              ? "border-[var(--yp-main)] bg-[var(--yp-secondary)]"
              : "border-[var(--yp-border-primary)]"
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-[var(--yp-muted)]">
            {isDragActive
              ? "Drop the images here..."
              : "Drag & drop accommodation images here, or click to select"}
          </p>
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {previews.map((file: any, idx: number) => (
              <div
                key={idx}
                className="relative border rounded-lg shadow-sm overflow-hidden"
              >
                <img
                  src={file.preview}
                  alt="preview"
                  className="h-40 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 bg-[var(--yp-red-bg)] hover:bg-[var(--yp-red-text)] text-[var(--yp-red-text)] hover:text-[var(--yp-red-bg)] rounded-full p-1 shadow-md transition"
                  title="Remove"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)] mt-2"
        >
          {loading
            ? "Uploading..."
            : `Upload ${images.length} Image${images.length !== 1 ? "s" : ""}`}
        </button>
      </form>
    </div>
  );
}
