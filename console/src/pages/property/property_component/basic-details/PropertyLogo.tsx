import { useState, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { Cropper } from "react-advanced-cropper";
import { Edit } from "lucide-react";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import { getErrorResponse } from "../../../../contexts/Callbacks";

interface Property {
  property_logo?: string[];
}

interface PropertyLogoProps {
  property: Property;
  getPropertyBasicDetails: () => void;
}

export default function PropertyLogo({
  property,
  getPropertyBasicDetails,
}: PropertyLogoProps) {
  const { objectId } = useParams<{ objectId: string }>();
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cropper, setCropper] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setFile(selectedFile);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCancel = () => {
    setImage(null);
    setFile(null);
  };

  const handleConfirm = async () => {
    if (!cropper || !objectId || !file) return;

    const canvas = cropper.getCanvas?.();
    if (!canvas) return;

    canvas.toBlob(async (blob: Blob | null) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("property_logo", blob, file.name);

      try {
        setUploading(true);
        const response = await API.patch(
          `/property/images/${objectId}`,
          formData
        );
        toast.success(
          response.data.message ||
            "Your property logo has been successfully updated."
        );
        getPropertyBasicDetails();
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setUploading(false);
        setImage(null);
        setFile(null);
      }
    }, "image/jpeg");
  };

  const getImageSrc = () => {
    if (image) return image;
    if (property?.property_logo?.[0])
      return `${import.meta.env.VITE_MEDIA_URL}/${property.property_logo[0]}`;
    return "/img/default-images/ca-property-default.png";
  };

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {!image ? (
        <img
          src={getImageSrc()}
          alt="Property Logo"
          className="w-36 h-36 rounded-full mb-3 shadow-sm object-cover"
        />
      ) : (
        <div className="mb-3 w-full max-w-xl h-64 rounded-md overflow-hidden">
          <Cropper
            src={image}
            className="w-full h-full"
            stencilProps={{
              aspectRatio: 1,
              circular: false,
            }}
            onChange={(cropperInstance) => setCropper(cropperInstance)}
          />
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-2">
        <h5 className="mb-0 text-lg font-medium text-[var(--yp-text-primary)]">
          Property Logo
        </h5>

        {!image && (
          <label
            htmlFor="logoUpload"
            className="text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] rounded px-1 py-1 text-sm cursor-pointer flex items-center gap-1 hover:opacity-80"
          >
            <Edit size={16} />
          </label>
        )}

        <input
          id="logoUpload"
          type="file"
          accept="image/jpeg, image/png"
          onChange={handleFileChange}
          className="hidden"
        />

        {image && (
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
        Your Property logo preview
      </small>
    </div>
  );
}
