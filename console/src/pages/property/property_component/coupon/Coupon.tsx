import { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import { Zap, Ticket, Clipboard } from "lucide-react";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useOutletContext } from "react-router-dom";
import {
  DashboardOutletContextProps,
  PropertyProps,
} from "../../../../types/types";
import {
  formatDateToFormik,
  formatDateWithoutTime,
  getErrorResponse,
  getFormikError,
} from "../../../../contexts/Callbacks";
import { CouponValidation } from "../../../../contexts/ValidationsSchemas";
import Badge from "../../../../ui/badge/Badge";
import ReadMoreLess from "../../../../ui/read-more/ReadMoreLess";

interface Coupon {
  uniqueId: string;
  coupon_code: string;
  start_from: string;
  valid_upto: string;
  discount: number;
  description: string;
}

interface CouponManagerProps {
  property: PropertyProps | null;
}

export default function CouponManager({ property }: CouponManagerProps) {
  const [prefix, setPrefix] = useState<string>("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const { authUser } = useOutletContext<DashboardOutletContextProps>();

  // Set prefix as property initials
  useEffect(() => {
    if (property?.property_name) {
      const initials = property.property_name
        .split(" ")
        .map((word: string) => word[0].toUpperCase())
        .join("");
      setPrefix(initials);
    }
  }, [property]);

  // Fetch coupons
  const getCoupons = useCallback(async () => {
    if (!property?.uniqueId) return;
    try {
      const response = await API.get<Coupon[]>(
        `/coupons/property/${property.uniqueId}`
      );
      setCoupons(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [property]);

  useEffect(() => {
    getCoupons();
  }, [getCoupons]);

  const formik = useFormik({
    initialValues: {
      coupon_code: "",
      start_from: "",
      valid_upto: "",
      discount: "",
      description: "",
    },
    validationSchema: CouponValidation,
    onSubmit: async (values, { resetForm }) => {
      if (!editId && coupons.length >= 3) {
        toast.error("You can only create up to 3 coupons at a time.");
        return;
      }

      const payload = {
        coupon_code: `${prefix}${values.coupon_code}`,
        start_from: values.start_from,
        valid_upto: values.valid_upto,
        discount: values.discount,
        description: values.description,
        userId: authUser?.uniqueId,
        property_id: property?.uniqueId,
      };

      try {
        if (editId) {
          const response = await API.patch(`/coupon/${editId}`, payload);
          setCoupons(
            coupons.map((c) => (c.uniqueId === editId ? response.data : c))
          );
          toast.success(
            response?.data?.message || "Coupon updated successfully!"
          );
          setEditId(null);
        } else {
          const response = await API.post("/coupons", payload);
          setCoupons([...coupons, response.data]);
          toast.success(
            response.data.message || "Coupon created successfully!"
          );
        }
        resetForm();
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 10; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    formik.setFieldValue("coupon_code", code);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditId(coupon.uniqueId);
    formik.setValues({
      coupon_code: coupon.coupon_code.replace(prefix, ""),
      start_from: formatDateToFormik(coupon.start_from),
      valid_upto: formatDateToFormik(coupon.valid_upto),
      discount: coupon.discount.toString(),
      description: coupon.description,
    });
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await API.delete(`/coupon/${id}`);
        setCoupons(coupons.filter((c) => c.uniqueId !== id));
        if (editId === id) formik.resetForm();
        toast.success(response.data.message || "Coupon deleted successfully!");
      } catch (error) {
        getErrorResponse(error);
      }
    }
  };

  return (
    <div>
      {/* Coupon Form */}
      <div className="p-6">
        <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold mb-6 text-[var(--yp-text-primary)]">
          <Ticket className="w-6 h-6 sm:w-7 sm:h-7" />
          {editId ? "Edit Coupon" : "Create Coupon"}
        </h2>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Coupon Code */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Coupon Code
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center overflow-hidden rounded-lg border border-[var(--yp-border-primary)]">
              <span className="bg-[var(--yp-input-primary)] px-4 py-2 font-semibold text-[var(--yp-muted)]">
                {prefix}
              </span>
              <input
                type="text"
                name="coupon_code"
                value={formik.values.coupon_code}
                onChange={formik.handleChange}
                placeholder="Enter code or Generate Code"
                className="flex-grow px-3 py-2 outline-none bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              <button
                type="button"
                onClick={generateCode}
                className="bg-[var(--yp-blue-bg)] transition px-4 sm:px-5 py-2 flex items-center justify-center text-[var(--yp-blue-text)] font-semibold"
              >
                <Zap className="w-5 h-5 mr-1" /> Generate
              </button>
            </div>
            {getFormikError(formik, "coupon_code")}
            <p className="mt-2 text-sm text-[var(--yp-muted)]">
              Final Code:
              <span className="text-[var(--yp-main)]">
                {prefix}
                {formik.values.coupon_code}
              </span>
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Start From
              </label>
              <input
                type="date"
                name="start_from"
                value={formik.values.start_from}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "start_from")}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Valid Upto
              </label>
              <input
                type="date"
                name="valid_upto"
                value={formik.values.valid_upto}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "valid_upto")}
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Discount (%)
            </label>
            <input
              type="number"
              name="discount"
              value={formik.values.discount}
              onChange={formik.handleChange}
              placeholder="Enter discount percentage"
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
            {getFormikError(formik, "discount")}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              placeholder="Enter description"
              rows={3}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
            {getFormikError(formik, "description")}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  formik.resetForm();
                }}
                className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!editId && coupons.length >= 3}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
            >
              {editId ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {/* Coupon Cards - hide if in edit mode */}
      {!editId && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 p-5">
          {coupons.map((coupon) => (
            <div
              key={coupon.uniqueId}
              className="bg-[var(--yp-secondary)] p-5 sm:p-6 rounded-xl shadow-md flex flex-col"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg sm:text-xl font-bold text-[var(--yp-text-primary)] break-all">
                  {coupon.coupon_code}
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(coupon.coupon_code);
                    toast("Coupon Code Copied");
                  }}
                  className="p-1 rounded bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
                  title="Copy Code"
                >
                  <Clipboard className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge label={`${coupon.discount}% OFF`} color="orange" />
              </div>

              <div className="flex flex-col text-sm text-[var(--yp-muted)] mb-4 gap-1">
                <p>Start: {formatDateWithoutTime(coupon.start_from)}</p>
                <p>Valid Upto: {formatDateWithoutTime(coupon.valid_upto)}</p>
              </div>

              <p className="text-[var(--yp-muted)] mb-4 text-sm sm:text-base flex-grow">
                <strong>Description:</strong>{" "}
                <ReadMoreLess children={coupon.description} />
              </p>

              <div className="flex justify-between gap-2 mt-auto">
                <button
                  onClick={() => handleEdit(coupon)}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(coupon.uniqueId)}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
