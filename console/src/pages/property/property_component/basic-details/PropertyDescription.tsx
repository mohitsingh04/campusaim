import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import JoditEditor from "jodit-react";
import { useFormik } from "formik";
import { getEditorConfig } from "../../../../contexts/JoditEditorConfig";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import { PropertyProps } from "../../../../types/types";
import ReadMoreLess from "../../../../ui/read-more/ReadMoreLess";
import { getErrorResponse } from "../../../../contexts/Callbacks";

export default function PropertyDescription({
  property,
  getProperty,
}: {
  property: PropertyProps | null;
  getProperty: () => void;
}) {
  const { objectId } = useParams<{ objectId: string }>();
  const [isUpdatingDescription, setIsUpdatingDescription] = useState(false);
  const editorConfig = useMemo(() => getEditorConfig(), []);

  const handleUpdate = async (values: { property_description: string }) => {
    try {
      const response = await API.patch(`/property/${objectId}`, values);
      toast.success(response.data.message || "Property updated successfully");
      setIsUpdatingDescription(false);
      getProperty();
    } catch (error) {
      getErrorResponse(error);
    }
  };

  const descriptionFormik = useFormik({
    initialValues: {
      property_description: (property?.property_description as string) || "",
    },
    onSubmit: handleUpdate,
    enableReinitialize: true,
  });

  return (
    <div>
      <div className="flex justify-start gap-2 items-center mb-2">
        <h3 className="text-lg font-semibold text-[var(--yp-text-primary)]">
          Description
        </h3>
        {!isUpdatingDescription && (
          <button
            onClick={() => setIsUpdatingDescription(true)}
            className="px-3 py-1 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
          >
            Edit
          </button>
        )}
      </div>

      {isUpdatingDescription ? (
        <form onSubmit={descriptionFormik.handleSubmit}>
          <JoditEditor
            value={descriptionFormik.values.property_description || ""}
            onChange={(newContent) =>
              descriptionFormik.setFieldValue(
                "property_description",
                newContent as string
              )
            }
            config={editorConfig}
            className="w-full mb-3"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => setIsUpdatingDescription(false)}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <ReadMoreLess children={property?.property_description || ""} />
      )}
    </div>
  );
}
