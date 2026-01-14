import { useState, useRef, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { Cropper } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import { Edit } from "lucide-react";
import toast from "react-hot-toast";
import { API } from "../../../../contexts/API";
import { getErrorResponse } from "../../../../contexts/Callbacks";

interface Property {
  featured_image?: string[];
}

interface FeaturedImageProps {
  property: Property;
  getPropertyBasicDetails: () => void;
}

export default function FeaturedImage({
  property,
  getPropertyBasicDetails,
}: FeaturedImageProps) {
  const { objectId } = useParams<{ objectId: string }>();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const cropperRef = useRef<any>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setFile(null);
  };

  const getCroppedImage = async (): Promise<Blob | null> => {
    const cropper = cropperRef.current?.getCanvas();
    if (!cropper) return null;

    return new Promise((resolve) => {
      cropper.toBlob((blob: any) => {
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const handleConfirm = async () => {
    if (!file || !objectId) return;

    const croppedBlob = await getCroppedImage();
    if (!croppedBlob) return;

    const formData = new FormData();
    formData.append("featured_image", croppedBlob, "cropped.jpg");

    try {
      setUploading(true);
      const response = await API.patch(
        `/property/images/${objectId}`,
        formData
      );

      toast.success(
        response.data.message ||
          "Your featured image has been successfully updated."
      );
      handleCancel();
      getPropertyBasicDetails();
    } catch (error) {
      getErrorResponse(error);
    } finally {
      setUploading(false);
    }
  };

  const getImageSrc = () => {
    if (preview) return preview;
    if (property?.featured_image?.[0])
      return `${import.meta.env.VITE_MEDIA_URL}/${property.featured_image[0]}`;
    return "/img/default-images/ca-property-default.png";
  };

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {preview ? (
        <div className="mb-3 w-full max-w-xl h-64 rounded-md overflow-hidden">
          <Cropper
            src={preview}
            ref={cropperRef}
            className="w-full h-full"
            stencilProps={{
              aspectRatio: 2,
              circular: false,
            }}
          />
        </div>
      ) : (
        <img
          src={getImageSrc()}
          alt="Featured"
          className="w-full max-w-xl h-64 rounded-md mb-3 shadow-sm object-cover"
        />
      )}

      <div className="flex items-center justify-center gap-2 mt-2">
        <h5 className="mb-0 text-lg font-medium text-[var(--yp-text-primary)]">
          Featured Image
        </h5>

        {!preview && (
          <label
            htmlFor="featuredUpload"
            className="text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] rounded px-1 py-1 text-sm cursor-pointer flex items-center gap-1 hover:opacity-80"
          >
            <Edit size={16} />
          </label>
        )}

        <input
          id="featuredUpload"
          type="file"
          accept="image/jpeg, image/png"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview && (
          <>
            <button
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
              onClick={handleConfirm}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : <>Upload</>}
            </button>
            <button
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
              onClick={handleCancel}
              disabled={uploading}
            >
              Close
            </button>
          </>
        )}
      </div>

      <small className="text-[var(--yp-muted)] mt-2">
        Your Property Featured Image preview
      </small>
    </div>
  );
}
