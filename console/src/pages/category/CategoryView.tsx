import { useCallback, useEffect, useState } from "react";
import { CategoryProps } from "../../types/types";
import { useParams } from "react-router-dom";
import { API } from "../../contexts/API";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import ViewSkeleton from "../../ui/skeleton/ViewSkeleton";
import { getErrorResponse } from "../../contexts/Callbacks";
import ReadMoreLess from "../../ui/read-more/ReadMoreLess";

export default function CategoryView() {
  const { objectId } = useParams();
  const [category, setCategory] = useState<CategoryProps | null>(null);
  const [loading, setLoading] = useState(true);

  const getCategoy = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/category/${objectId}`);
      setCategory(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [objectId]);

  useEffect(() => {
    getCategoy();
  }, [getCategoy]);

  const featured_image = category?.featured_image?.[0]
    ? `${import.meta.env.VITE_MEDIA_URL}/category/${category.featured_image[0]}`
    : "/img/default-images/ca-property-default.png";
  const category_icon = category?.category_icon?.[0]
    ? `${import.meta.env.VITE_MEDIA_URL}/category/${category.category_icon[0]}`
    : "/img/default-images/ca-property-default.png";

  if (loading) {
    return <ViewSkeleton />;
  }

  return (
    <div>
      <Breadcrumbs
        title="Category"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Category", path: "/dashboard/category" },
          { label: category?.category_name || "" },
        ]}
      />

      {/* Card */}
      <div className="bg-[var(--yp-primary)] rounded-2xl shadow-sm overflow-hidden">
        {/* Banner with overlay */}
        <div
          className="relative w-full h-40 sm:h-64 bg-[var(--yp-tertiary)] bg-center bg-cover"
          style={{ backgroundImage: `url(${featured_image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        </div>

        <div className="relative px-4 sm:px-6 -mt-10 flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--yp-secondary)] shadow-sm flex items-center justify-center overflow-hidden">
            <img
              src={category_icon}
              alt="Category Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
          <div className="bg-[var(--yp-secondary)] rounded-xl p-3 sm:p-4 shadow-sm">
            <h2 className="text-xs sm:text-sm font-semibold text-[var(--yp-muted)] uppercase">
              Category
            </h2>
            <p className="text-base sm:text-lg font-medium text-[var(--yp-text-primary)]">
              {category?.category_name}
            </p>
          </div>
          <div className="bg-[var(--yp-secondary)] rounded-xl p-3 sm:p-4 shadow-sm">
            <h2 className="text-xs sm:text-sm font-semibold text-[var(--yp-muted)] uppercase">
              Parent Category
            </h2>
            <p className="text-base sm:text-lg font-medium text-[var(--yp-text-primary)]">
              {category?.parent_category}
            </p>
          </div>
          {category?.description && (
            <div className="bg-[var(--yp-secondary)] rounded-xl p-3 sm:p-4 shadow-sm col-span-2">
              <h3 className="text-base sm:text-lg font-semibold text-[var(--yp-text-primary)] mb-2 sm:mb-3">
                Category Description
              </h3>
              <ReadMoreLess children={category?.description} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
