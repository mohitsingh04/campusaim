import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CategoryProps,
  CourseProps,
  PropertyProps,
  ReqKoItem,
} from "../../../../types/types";
import { API } from "../../../../contexts/API";
import Badge from "../../../../ui/badge/Badge";
import {
  getErrorResponse,
  getStatusColor,
} from "../../../../contexts/Callbacks";
import TableButton from "../../../../ui/button/TableButton";
import { Edit, Eye, Trash } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import CourseView from "./CourseView";
import AddCourseForm from "./CourseAdd";
import EditCourseForm from "./CourseEdit";
import { Column, SimpleTable } from "../../../../ui/tables/SimpleTable";

export default function CourseList({
  property,
  getCategoryById,
}: {
  property: PropertyProps | null;
  getCategoryById: (id: string) => string | undefined;
}) {
  const [allCourses, setAllCourses] = useState<CourseProps[]>([]);
  const [allPropertyCourse, setAllPropertyCourse] = useState<any[]>([]);
  const [isViewing, setIsViewing] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [requirements, setRequirements] = useState<ReqKoItem[]>([]);
  const [keyOutcomes, setKeyOutcomes] = useState<ReqKoItem[]>([]);
  const [categories, setCategories] = useState<CategoryProps[]>([]);

  /** Fetch requirements, outcomes, and categories **/
  const fetchRequirements = useCallback(async () => {
    try {
      const res = await API.get("/requirment/all");
      setRequirements((res?.data as ReqKoItem[]) || []);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  const fetchKeyOutcomes = useCallback(async () => {
    try {
      const res = await API.get("/key-outcome/all");
      setKeyOutcomes((res?.data as ReqKoItem[]) || []);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await API.get("/category");
      setCategories(res?.data || []);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    fetchRequirements();
    fetchKeyOutcomes();
    fetchCategories();
  }, [fetchRequirements, fetchKeyOutcomes, fetchCategories]);

  /** Fetch master courses **/
  const getAllCourses = useCallback(async () => {
    try {
      const response = await API.get("/course");
      const data = response.data;
      setAllCourses(data.filter((item: CourseProps) => !item.isDeleted));
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getAllCourses();
  }, [getAllCourses]);

  const getAllPropertyCourses = useCallback(async () => {
    if (!property?._id) return;
    try {
      const response = await API.get(
        `/property/property-course/${property?._id}`
      );
      setAllPropertyCourse(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      getErrorResponse(error);
    }
  }, [property?._id]);

  useEffect(() => {
    getAllPropertyCourses();
  }, [getAllPropertyCourses]);

  /** Delete handler **/
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "Once deleted, you will not be able to recover this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
          const response = await API.delete(`/property-course/${id}`);
          toast.success(response.data.message || "Deleted successfully");
          getAllPropertyCourses();
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
    [getAllPropertyCourses]
  );

  /** Merge propertyCourse + masterCourse **/
  const mergedCourses = useMemo(() => {
    return allPropertyCourse?.map((propertyCourse) => {
      const masterCourse = allCourses.find(
        (mc) => String(mc._id) === String(propertyCourse.course_id)
      );

      return {
        ...masterCourse,
        ...propertyCourse,
        course_name:
          propertyCourse?.course_name || masterCourse?.course_name || "N/A",
        course_type:
          getCategoryById(
            propertyCourse?.course_type || masterCourse?.course_type
          ) || "N/A",
        course_type_id:
          propertyCourse?.course_type || masterCourse?.course_type,
        duration: propertyCourse?.duration || masterCourse?.duration || "N/A",
        status: propertyCourse?.status || masterCourse?.status || "N/A",
      };
    });
  }, [allPropertyCourse, allCourses, getCategoryById]);

  /** Table columns **/
  const columns = useMemo<Column<CourseProps>[]>(() => {
    return [
      { value: "course_name" as keyof CourseProps, label: "Name" },
      {
        label: "Course Type",
        value: (row: any) => row.course_type || "N/A",
      },
      {
        label: "Duration",
        value: (row: any) => row.duration || "N/A",
      },
      {
        label: "Status",
        value: (row: any) => (
          <Badge label={row.status} color={getStatusColor(row?.status)} />
        ),
      },
      {
        label: "Actions",
        value: (row: any) => (
          <div className="flex space-x-2">
            <TableButton
              Icon={Eye}
              color="blue"
              buttontype="button"
              onClick={() => setIsViewing(row)}
            />
            <TableButton
              Icon={Edit}
              color="green"
              buttontype="button"
              onClick={() => setIsEditing(row)}
            />
            <TableButton
              Icon={Trash}
              color="red"
              buttontype="button"
              onClick={() => handleDelete(row?._id)}
            />
          </div>
        ),
      },
    ];
  }, [handleDelete]);

  /** Conditional Views **/
  if (isAdding) {
    return (
      <div className="m-4 pb-4">
        <AddCourseForm
          requirements={requirements}
          categories={categories}
          keyOutcomes={keyOutcomes}
          allCourses={allCourses}
          property={property}
          getPropertyCourse={getAllPropertyCourses}
          setIsAdding={setIsAdding}
        />
      </div>
    );
  }

  if (isViewing) {
    return (
      <div className="m-4 pb-4">
        <CourseView
          course={isViewing}
          setIsViewing={setIsViewing}
          getCourseById={(id) =>
            allCourses.find((c) => String(c._id) === String(id))
          }
          getCategoryById={getCategoryById}
          requirements={requirements}
          keyOutcomes={keyOutcomes}
        />
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="m-4 pb-4">
        <EditCourseForm
          requirements={requirements}
          categories={categories}
          getPropertyCourse={getAllPropertyCourses}
          property={property}
          keyOutcomes={keyOutcomes}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          getCourseById={(id: any) =>
            allCourses.find((c) => String(c._id) === String(id))
          }
        />
      </div>
    );
  }

  return (
    <div className="m-4 pb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
          Courses
        </h2>

        <button
          onClick={() => setIsAdding(true)}
          className="px-2 py-1 text-sm font-medium rounded-md bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)] hover:opacity-90 transition"
        >
          + Add Course
        </button>
      </div>

      <SimpleTable<CourseProps> data={mergedCourses} columns={columns} />
    </div>
  );
}
