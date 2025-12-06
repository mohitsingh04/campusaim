import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { API } from "../../../../contexts/API";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import { X } from "lucide-react";

interface AddNewGalleryImagesProps {
  gallery: any;
  getGalleries: () => void;
  setAddingMore: (mode: "view" | "add" | "remove") => void;
}

export default function AddNewGalleryImages({
  gallery,
  getGalleries,
  setAddingMore,
}: AddNewGalleryImagesProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > 12) {
        toast.error("You can upload a maximum of 12 images per gallery.");
        return;
      }

      const newImages = [...images, ...acceptedFiles];
      const newPreviews = newImages.map((file: any) =>
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
      "image/webp": [],
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
        formData.append("gallery", image);
      });

      try {
        setLoading(true);
        const response = await API.post(
          `/gallery/add/${gallery?._id}`,
          formData
        );
        toast.success(
          response?.data?.message || "New gallery images uploaded successfully."
        );
        setImages([]);
        setPreviews([]);
        setAddingMore("view");
        getGalleries();
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setLoading(false);
      }
    },
  });

  const filteredImages =
    gallery?.gallery?.filter((img: string) =>
      img.toLowerCase().endsWith(".webp")
    ) || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--yp-border-primary)]">
        <h2 className="font-semibold text-lg text-[var(--yp-text-primary)]">
          Add Images to Gallery
        </h2>
        <button
          onClick={() => setAddingMore("view")}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
        >
          ✕ Cancel
        </button>
      </div>

      <form onSubmit={formik.handleSubmit} className="p-4 space-y-4">
        {/* Existing Images */}
        {filteredImages.length > 0 && (
          <div>
            <h3 className="font-semibold text-[var(--yp-text-primary)] mb-2">
              Existing Images
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredImages.map((img: string, idx: number) => {
                const fullUrl = `${import.meta.env.VITE_MEDIA_URL}/${img}`;
                return (
                  <div
                    key={idx}
                    className="bg-[var(--yp-tertiary)] rounded-lg shadow-sm overflow-hidden"
                  >
                    <img
                      src={fullUrl}
                      alt="Existing"
                      className="h-40 w-full object-cover"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
              : "Drag & drop gallery images here, or click to select"}
          </p>
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {previews.map((file: any, idx: number) => (
              <div
                key={idx}
                className="relative bg-[var(--yp-tertiary)] rounded-lg shadow-sm overflow-hidden"
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
          {loading
            ? "Uploading..."
            : `Upload ${images.length} Image${images.length !== 1 ? "s" : ""}`}
        </button>
      </form>
    </div>
  );
}
