import { useCallback, useEffect, useState } from "react";
import { AddTeacherForm } from "./AddTeacherForm";
import { PropertyProps } from "../../../../types/types";
import { API } from "../../../../contexts/API";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { EditTeacherForm } from "./EditTeacharForm";
import { getErrorResponse } from "../../../../contexts/Callbacks";

interface Teacher {
  _id: string;
  teacher_name: string;
  designation: string;
  experience: string;
  profile?: string[];
  status: string;
}

export default function Teachers({
  property,
}: {
  property: PropertyProps | null;
}) {
  const [showForm, setShowForm] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);

  const getTeachers = useCallback(async () => {
    if (!property?.uniqueId) return;
    try {
      const response = await API.get(`/teacher/property/${property?.uniqueId}`);
      setTeachers(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [property?.uniqueId]);

  useEffect(() => {
    getTeachers();
  }, [getTeachers]);

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await API.delete(`/teacher/${id}`);

          toast.success(
            response.data.message || "Teacher deleted successfully"
          );
          getTeachers();
        } catch (error) {
          getErrorResponse(error);
        }
      }
    });
  };

  if (editTeacher) {
    return (
      <EditTeacherForm
        teacher={editTeacher}
        onBack={() => {
          setShowForm(false);
          setEditTeacher(null);
          getTeachers();
        }}
      />
    );
  }

  return (
    <>
      {showForm ? (
        <AddTeacherForm
          property={property}
          onBack={() => {
            setShowForm(false);
            setEditTeacher(null);
            getTeachers();
          }}
        />
      ) : teachers.length > 0 ? (
        <section className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--yp-text-primary)]">
              Teachers
            </h3>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
            >
              Add Teacher
            </button>
          </div>

          {/* Teacher Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <div
                key={teacher._id}
                className="bg-[var(--yp-secondary)] rounded-xl shadow-md hover:shadow-lg transition p-4 flex flex-col items-center text-center relative"
              >
                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => {
                      setEditTeacher(teacher);
                      setShowForm(true);
                    }}
                    className="p-2 rounded-full bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)] transition"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher._id)}
                    className="p-2 rounded-full bg-[var(--yp-red-bg)] text-[var(--yp-red-text)] transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Profile */}
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--yp-tertiary)] mb-3">
                  {teacher.profile?.[0] ? (
                    <img
                      src={`${import.meta.env.VITE_MEDIA_URL}/${
                        teacher.profile[0]
                      }`}
                      alt={teacher.teacher_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-[var(--yp-muted)] text-sm">
                      No Image
                    </span>
                  )}
                </div>

                {/* Info */}
                <h4 className="font-semibold text-[var(--yp-text-primary)]">
                  {teacher.teacher_name}
                </h4>
                <p className="text-[var(--yp-muted)] text-sm">
                  {teacher.designation}
                </p>
                <p className="text-[var(--yp-main)] text-sm mt-1">
                  {teacher.experience}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
            <h3 className="mt-4 text-base sm:text-lg lg:text-xl font-semibold text-[var(--yp-text-primary)]">
              No Teacher Data Found
            </h3>
            <p className="text-[var(--yp-muted)] mt-1 text-sm sm:text-base">
              You haven’t added any teachers yet. Click below to get started.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] mt-2"
            >
              Add Teacher
            </button>
          </div>
        </section>
      )}
    </>
  );
}
