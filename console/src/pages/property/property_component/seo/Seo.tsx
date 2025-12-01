import { useCallback, useEffect, useState } from "react";
import { Edit3, Trash2, Tag, FileText, Hash, Key, Info } from "lucide-react";
import { SEOAddForm } from "./SeoAddForm";
import { API } from "../../../../contexts/API";
import { PropertyProps, SeoProps } from "../../../../types/types";
import { SEOEditForm } from "./SeoEditForm";
import Badge from "../../../../ui/badge/Badge";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import ReadMoreLess from "../../../../ui/read-more/ReadMoreLess";

export default function SEODetails({
  property,
}: {
  property: PropertyProps | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [seoData, setSeoData] = useState<SeoProps | null>(null);
  const [loading, setLoading] = useState(true);

  const getSeoData = useCallback(async () => {
    if (!property?._id) return;
    try {
      setLoading(true);
      const response = await API.get(`/property/seo/property/${property._id}`);
      setSeoData(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [property?._id]);

  useEffect(() => {
    getSeoData();
  }, [getSeoData]);

  if (loading) {
    return <div className="p-6 text-[var(--yp-muted)]">Loading SEO...</div>;
  }

  return (
    <div className="p-4">
      {/* SEO View */}
      <div className={isEditing ? "hidden" : "block"}>
        {seoData ? (
          <SEOView seoData={seoData} onEdit={() => setIsEditing(true)} />
        ) : (
          <SEOAddForm property={property} onSave={getSeoData} />
        )}
      </div>

      {/* SEO Edit Form */}
      {seoData && (
        <div className={isEditing ? "block" : "hidden"}>
          <SEOEditForm
            seoData={seoData}
            onCancel={() => setIsEditing(false)}
            onSave={() => {
              getSeoData();
              setIsEditing(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

function SEOView({
  seoData,
  onEdit,
}: {
  seoData: SeoProps;
  onEdit: () => void;
}) {
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await API.delete(`/property/seo/${id}`);
        toast.success(response.data.message);
        window.location.reload();
      } catch (error) {
        getErrorResponse(error);
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-[var(--yp-text-primary)]">
          SEO Details
        </h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={onEdit}
            className="px-2 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(seoData._id)}
            className="px-2 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Title */}
        <DetailCard
          icon={<Tag size={18} />}
          label="Title"
          value={seoData.title}
        />

        {/* Slug */}
        <DetailCard
          icon={<Hash size={18} />}
          label="Slug"
          value={seoData.slug}
        />

        {/* Primary Focus Keywords */}
        <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--yp-secondary)]">
          <div className="flex-shrink-0 p-2 rounded-full bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]">
            <Key size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--yp-text-primary)]">
              Primary Focus Keywords
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {seoData?.primary_focus_keyword?.map(
                (item: string, index: number) => (
                  <Badge label={item} color="green" key={index} />
                )
              )}
            </div>
          </div>
        </div>

        {/* JSON Schema */}
        <DetailCard
          icon={<FileText size={18} />}
          label="JSON Schema"
          value={seoData.json_schema || "(No schema provided)"}
        />

        {/* Meta Description */}
        <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--yp-secondary)]">
          <div className="flex-shrink-0 p-2 rounded-full bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]">
            <Info size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--yp-text-primary)]">
              Meta Description
            </p>
            <ReadMoreLess children={seoData?.meta_description} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--yp-secondary)]">
      <div className="flex-shrink-0 p-2 rounded-full bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--yp-text-primary)]">
          {label}
        </p>
        <p className="text-[var(--yp-text-secondary)] text-sm leading-relaxed break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
