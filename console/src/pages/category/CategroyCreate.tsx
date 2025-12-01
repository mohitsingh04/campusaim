import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Image, X } from "lucide-react";
import JoditEditor from "jodit-react";
import { useFormik } from "formik";
import { getEditorConfig } from "../../contexts/JoditEditorConfig";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { CategorySchema } from "../../contexts/ValidationsSchemas";
import { API } from "../../contexts/API";
import { CategoryProps, DashboardOutletContextProps } from "../../types/types";
import { useNavigate, useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorResponse, getFormikError } from "../../contexts/Callbacks";
import Select, {
  components,
  OptionProps,
  SingleValue,
  GroupBase,
} from "react-select";
import { reactSelectDesignClass } from "../../common/ExtraData";

// ----------------------------------------------------
// 💡 Define interfaces
// ----------------------------------------------------
interface CategoryNode extends CategoryProps {
  children: CategoryNode[];
}

interface SelectOption {
  value: string;
  label: string;
  level: number;
}

// ----------------------------------------------------
// 💡 Custom Option Component for Indentation
// ----------------------------------------------------
const CategoryOption = (
  props: OptionProps<SelectOption, false, GroupBase<SelectOption>>
) => {
  const { data, label, isSelected } = props;
  const { level } = data;

  const paddingLeft = `${level * 15}px`;
  const visualPrefix = level > 0 ? "—\u00A0" : "";

  return (
    <components.Option {...props}>
      <div
        style={{ paddingLeft }}
        className={isSelected ? "bg-blue-100 dark:bg-blue-800" : ""}
      >
        {visualPrefix}
        {label}
      </div>
    </components.Option>
  );
};

// ----------------------------------------------------
// 💡 Component
// ----------------------------------------------------
export function CategroyCreate() {
  const editor = useRef(null);
  const redirector = useNavigate();
  const { authUser } = useOutletContext<DashboardOutletContextProps>();
  const editorConfig = useMemo(() => getEditorConfig(), []);
  const [allCategories, setAllCategories] = useState<CategoryProps[]>([]);

  // Build a hierarchical tree from flat category list
  const buildCategoryTree = useCallback(
    (categories: CategoryProps[]): CategoryNode[] => {
      const map: { [key: string]: CategoryNode } = {};
      const tree: CategoryNode[] = [];

      categories.forEach((category) => {
        map[category.category_name] = { ...category, children: [] };
      });

      categories.forEach((category) => {
        const node = map[category.category_name];
        const parentName = category.parent_category;

        if (
          parentName &&
          parentName !== "" &&
          map[parentName] &&
          parentName !== category.category_name
        ) {
          map[parentName].children.push(node);
        } else {
          tree.push(node);
        }
      });

      const sortTree = (nodes: CategoryNode[]) => {
        nodes.sort((a, b) => a.category_name.localeCompare(b.category_name));
        nodes.forEach((node) => sortTree(node.children));
      };

      sortTree(tree);
      return tree;
    },
    []
  );

  const categoryTree = useMemo(
    () => buildCategoryTree(allCategories),
    [allCategories, buildCategoryTree]
  );

  // Convert tree to react-select options
  const getSelectOptions = useCallback(
    (nodes: CategoryNode[], level: number = 0): SelectOption[] =>
      nodes.flatMap((node) => [
        { value: node.category_name, label: node.category_name, level },
        ...(node.children.length > 0
          ? getSelectOptions(node.children, level + 1)
          : []),
      ]),
    []
  );

  const selectOptions = useMemo(
    () => getSelectOptions(categoryTree),
    [categoryTree, getSelectOptions]
  );

  const getAllCategories = useCallback(async () => {
    try {
      const response = await API.get("/category");
      setAllCategories(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  // ----------------------------------------------------
  // 💡 Formik Setup
  // ----------------------------------------------------
  const formik = useFormik({
    initialValues: {
      userId: authUser?.uniqueId || "",
      category_name: "",
      parent_category: "",
      description: "",
      featured_image: null as File | null,
      category_icon: null as File | null,
    },
    enableReinitialize: true,
    validationSchema: CategorySchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("userId", String(values.userId ?? ""));
      formData.append("category_name", values.category_name ?? "");
      formData.append("parent_category", values.parent_category ?? "");
      formData.append("description", values.description ?? "");

      if (values.featured_image)
        formData.append("featured_image", values.featured_image);
      if (values.category_icon)
        formData.append("category_icon", values.category_icon);

      try {
        const response = await API.post(`/category`, formData);
        toast.success(response.data.message || "Category created successfully");
        redirector(`/dashboard/category`);
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Find selected option
  const selectedOption = useMemo(
    () =>
      selectOptions.find(
        (option) => option.value === formik.values.parent_category
      ) || null,
    [formik.values.parent_category, selectOptions]
  );

  // ----------------------------------------------------
  // 💡 Render
  // ----------------------------------------------------
  return (
    <div>
      <Breadcrumbs
        title="Create Category"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Category", path: "/dashboard/category" },
          { label: "Create" },
        ]}
      />

      <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          {/* Name + Parent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Category Name
              </label>
              <input
                type="text"
                name="category_name"
                value={formik.values.category_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Category Name"
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "category_name")}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Parent Category
              </label>
              <Select<SelectOption, false>
                name="parent_category"
                options={selectOptions}
                value={selectedOption}
                onChange={(selected: SingleValue<SelectOption>) => {
                  formik.setFieldValue(
                    "parent_category",
                    selected ? selected.value : ""
                  );
                }}
                onBlur={formik.handleBlur}
                placeholder="Select Parent Category"
                isClearable
                components={{ Option: CategoryOption }}
                classNames={reactSelectDesignClass}
              />
              {getFormikError(formik, "parent_category")}
            </div>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Featured Image */}
            <FileUpload
              id="featured-image"
              label="Featured Image"
              file={formik.values.featured_image}
              onRemove={() => formik.setFieldValue("featured_image", null)}
              onChange={(file) => formik.setFieldValue("featured_image", file)}
            />
            {/* Category Icon */}
            <FileUpload
              id="category-icon"
              label="Category Icon"
              file={formik.values.category_icon}
              onRemove={() => formik.setFieldValue("category_icon", null)}
              onChange={(file) => formik.setFieldValue("category_icon", file)}
            />
          </div>

          {/* Jodit Editor */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Description
            </label>
            <JoditEditor
              ref={editor}
              value={formik.values.description}
              config={editorConfig}
              onBlur={(newContent) =>
                formik.setFieldValue("description", newContent)
              }
              onChange={(newContent) =>
                formik.setFieldValue("description", newContent)
              }
            />
            {getFormikError(formik, "description")}
          </div>

          {/* Submit */}
          <div className="flex justify-start">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
              disabled={formik.isSubmitting}
            >
              {formik?.isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 💡 FileUpload Reusable Component
// ----------------------------------------------------
function FileUpload({
  id,
  label,
  file,
  onChange,
  onRemove,
}: {
  id: string;
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
        {label}
      </label>
      <div className="border-2 border-dashed border-[var(--yp-border-primary)] rounded-lg p-4 text-center hover:border-[var(--yp-muted)] bg-[var(--yp-input-primary)] transition-colors">
        <input
          type="file"
          accept="image/png, image/jpeg"
          id={id}
          className="hidden"
          onChange={(e) => {
            const file = e.currentTarget.files
              ? e.currentTarget.files[0]
              : null;
            onChange(file);
          }}
        />
        <label htmlFor={id} className="cursor-pointer block">
          {file ? (
            <div className="relative inline-block">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="mx-auto max-h-40 rounded-lg object-contain"
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-[var(--yp-red-text)] text-[var(--yp-red-bg)] rounded-full p-1"
                onClick={(e) => {
                  e.preventDefault();
                  onRemove();
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Image className="w-8 h-8 text-[var(--yp-muted)] mx-auto mb-2" />
              <p className="text-sm text-[var(--yp-muted)]">
                Click to upload {label.toLowerCase()}
              </p>
            </>
          )}
        </label>
      </div>
    </div>
  );
}
