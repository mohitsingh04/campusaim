import { Upload, X } from "lucide-react";
import { useEffect, useState } from "react";

const usePreview = (file: File | null) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return preview;
};

export const ImageInput = ({
  name,
  file,
  onChange,
  label,
}: {
  name: string;
  file: File | null;
  onChange: (file: File | null) => void;
  label: string;
}) => {
  const preview = usePreview(file);

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
        {label}
      </label>

      <div className="border-2 border-dashed border-[var(--yp-border-primary)] rounded-lg p-4 text-center bg-[var(--yp-input-primary)]">
        <input
          type="file"
          accept="image/*"
          id={name}
          className="hidden"
          onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
        />

        <label htmlFor={name} className="cursor-pointer block">
          {preview ? (
            <div className="relative inline-block">
              <img
                src={preview}
                className="max-h-40 rounded-lg object-contain mx-auto"
              />
              <button
                type="button"
                onClick={() => onChange(null)}
                className="absolute top-1 right-1 p-1 text-[var(--yp-red-text)] bg-[var(--yp-red-bg)] rounded-full"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-[var(--yp-muted)] mx-auto mb-2" />
              <p className="text-sm text-[var(--yp-muted)]">
                Click to upload image
              </p>
            </>
          )}
        </label>
      </div>
    </div>
  );
};
