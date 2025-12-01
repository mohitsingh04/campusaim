import { useMemo, useRef, useState } from "react";
import JoditEditor from "jodit-react";
import { ImageInput } from "../../../ui/inputs/ImageInput";
import { getEditorConfig } from "../../../contexts/JoditEditorConfig";

/* -----------------------------
   MAIN COMPONENT
----------------------------- */
interface EventDescriptionProps {
  defaultData: any;
  onNext: (values: any) => void;
  onBack: () => void;
}

export default function EventDescription({
  defaultData,
  onNext,
  onBack,
}: EventDescriptionProps) {
  const editor = useRef(null);

  const [description, setDescription] = useState(
    defaultData?.description || ""
  );
  const [featuredImage, setFeaturedImage] = useState<File | null>(
    defaultData?.featured_image || null
  );

  const editorConfig = useMemo(() => getEditorConfig(), []);

  const handleNext = () => {
    onNext({
      description,
      featured_image: featuredImage,
    });
  };

  return (
    <div className="space-y-10">
      {/* Description Editor */}
      <div>
        <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
          Description
        </label>
        <JoditEditor
          ref={editor}
          value={description}
          config={editorConfig}
          onBlur={(v: string) => setDescription(v)}
        />
      </div>

      {/* Featured Image */}
      <ImageInput
        name="featured_image"
        file={featuredImage}
        onChange={setFeaturedImage}
        label="Featured Image"
      />

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-gray-text)] bg-[var(--yp-gray-bg)]"
        >
          Back
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
